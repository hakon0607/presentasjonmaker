// Stripe webhook (Deno-vennlig: verifiserer signatur manuelt, ingen Stripe-bibliotek).
// Secrets: STRIPE_WEBHOOK_SECRET (whsec_...). Deploy med "Verify JWT" AV.
const URL = Deno.env.get('SUPABASE_URL')!
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const h = { apikey: SRV, Authorization: `Bearer ${SRV}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
const rh = { apikey: SRV, Authorization: `Bearer ${SRV}` }

// Verifiser Stripe-signaturen (t=...,v1=...) med HMAC-SHA256 over "t.payload"
async function verify(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=')))
    const t = parts['t']; const v1 = parts['v1']
    if (!t || !v1) return false
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`))
    const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('')
    // konstant-tid-sammenligning
    if (hex.length !== v1.length) return false
    let diff = 0
    for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i)
    return diff === 0
  } catch { return false }
}

async function planForPrice(priceId: string) {
  const row = (await (await fetch(`${URL}/rest/v1/plans?or=(price_month_id.eq.${priceId},price_year_id.eq.${priceId})&select=tier,tokens_daily,price_month_id`, { headers: rh })).json())?.[0]
  if (!row) return null
  return { tier: row.tier as string, tokens_daily: row.tokens_daily as number, interval: row.price_month_id === priceId ? 'month' : 'year' }
}
async function gratisTokens() {
  return (await (await fetch(`${URL}/rest/v1/plans?tier=eq.gratis&select=tokens_daily`, { headers: rh })).json())?.[0]?.tokens_daily ?? 5
}
async function patchProfile(uid: string, body: Record<string, unknown>) {
  await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
}
async function uidFromCustomer(customer: string): Promise<string | null> {
  return (await (await fetch(`${URL}/rest/v1/profiles?stripe_customer_id=eq.${customer}&select=id`, { headers: rh })).json())?.[0]?.id ?? null
}

Deno.serve(async (req) => {
  const WH = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!WH) return new Response('STRIPE_WEBHOOK_SECRET mangler', { status: 500 })
  const sig = req.headers.get('stripe-signature') || ''
  const raw = await req.text()
  if (!(await verify(raw, sig, WH))) return new Response('Bad signature', { status: 400 })

  let ev: any
  try { ev = JSON.parse(raw) } catch { return new Response('Bad JSON', { status: 400 }) }

  try {
    const obj = ev?.data?.object || {}
    if (ev.type === 'checkout.session.completed') {
      const uid = obj.client_reference_id || obj.metadata?.uid
      const customer = obj.customer
      if (uid && customer) await patchProfile(uid, { stripe_customer_id: String(customer), email: obj.customer_details?.email ?? undefined })
    }
    if (ev.type === 'customer.subscription.created' || ev.type === 'customer.subscription.updated') {
      const uid = obj.metadata?.uid || await uidFromCustomer(String(obj.customer))
      const price = obj.items?.data?.[0]?.price?.id
      const plan = price ? await planForPrice(price) : null
      if (uid) {
        const active = obj.status === 'active' || obj.status === 'trialing'
        const gratis = await gratisTokens()
        const body: Record<string, unknown> = {
          stripe_customer_id: String(obj.customer),
          stripe_subscription_id: obj.id,
          sub_status: obj.status,
          sub_interval: plan?.interval ?? null,
          sub_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null,
          plan: active && plan ? plan.tier : 'gratis',
          tokens_daily: active && plan ? plan.tokens_daily : gratis,
        }
        if (active && plan) {
          // fyll opp tokens til den nye kvoten MED EN GANG (ikke vent til neste dag)
          body.tokens = plan.tokens_daily; body.tokens_day = null
        } else {
          // abonnement ikke lenger aktivt -> ned til gratis-kvote med en gang (ikke behold f.eks. 1000)
          body.tokens = gratis; body.tokens_day = null
        }
        await patchProfile(uid, body)
      }
    }
    if (ev.type === 'customer.subscription.deleted') {
      const uid = obj.metadata?.uid || await uidFromCustomer(String(obj.customer))
      if (uid) {
        const gratis = await gratisTokens()
        await patchProfile(uid, { sub_status: 'canceled', plan: 'gratis', tokens_daily: gratis, tokens: gratis, tokens_day: null, stripe_subscription_id: null })
      }
    }
  } catch (e) {
    return new Response(`handler error: ${(e as Error)?.message}`, { status: 500 })
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
