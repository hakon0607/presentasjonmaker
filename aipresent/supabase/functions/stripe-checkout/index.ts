// Starter en Stripe Checkout-økt for et abonnement. Bruker Stripe REST-API via fetch (Deno-vennlig).
// Body: { tier: 'pluss'|'pro', interval: 'month'|'year', origin: 'https://din-app.no' }
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

// enkel form-encoder for Stripe (støtter nøstede nøkler som line_items[0][price])
function form(obj: Record<string, string | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null) p.append(k, String(v))
  return p.toString()
}
async function stripe(path: string, body: Record<string, string | undefined>, key: string) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form(body),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data?.error?.message || `Stripe-feil (${r.status})`)
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const SECRET = Deno.env.get('STRIPE_SECRET_KEY')
    const URL = Deno.env.get('SUPABASE_URL')!
    const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!SECRET) return json({ error: 'STRIPE_SECRET_KEY mangler' }, 400)

    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const ures = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: SRV, Authorization: `Bearer ${jwt}` } })
    const user = await ures.json().catch(() => null)
    if (!user?.id) return json({ error: 'Ikke innlogget' }, 401)

    const bodyIn = await req.json().catch(() => ({}))
    const h = { apikey: SRV, Authorization: `Bearer ${SRV}` }

    // --- Selvbetjent: si opp / gjenoppta eget abonnement ---
    if (bodyIn.action === 'cancel' || bodyIn.action === 'resume') {
      const prof = (await (await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_subscription_id`, { headers: h })).json())?.[0]
      const subId = prof?.stripe_subscription_id
      if (!subId) return json({ error: 'Fant ingen aktivt abonnement' }, 400)
      await stripe(`subscriptions/${subId}`, { cancel_at_period_end: bodyIn.action === 'cancel' ? 'true' : 'false' }, SECRET)
      return json({ ok: true })
    }

    // --- Standard: start ny checkout ---
    const { tier, interval, origin } = bodyIn
    if (!['pluss', 'pro'].includes(tier) || !['month', 'year'].includes(interval)) return json({ error: 'Ugyldig valg' }, 400)

    const plan = (await (await fetch(`${URL}/rest/v1/plans?tier=eq.${tier}&select=price_month_id,price_year_id`, { headers: h })).json())?.[0]
    const price = interval === 'year' ? plan?.price_year_id : plan?.price_month_id
    if (!price) return json({ error: `Mangler Stripe-pris for ${tier}/${interval}. Legg price-id i plans-tabellen.` }, 400)

    const prof = (await (await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id,email`, { headers: h })).json())?.[0]
    // Ikke stol på lagret customer (kan stamme fra et annet Stripe-miljø).
    // Bruk e-post + la Stripe finne/lage riktig kunde i SITT miljø. Nullstill ev. gammel id.
    if (prof?.stripe_customer_id) {
      const chk = await fetch(`https://api.stripe.com/v1/customers/${prof.stripe_customer_id}`, { headers: { Authorization: `Bearer ${SECRET}` } })
      if (!chk.ok) await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}`, { method: 'PATCH', headers: { ...h, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ stripe_customer_id: null, stripe_subscription_id: null }) })
    }
    const email = user.email || prof?.email || undefined
    const base = origin || (req.headers.get('origin') ?? '')

    const session = await stripe('checkout/sessions', {
      mode: 'subscription',
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      'managed_payments[enabled]': 'false',
      customer_email: email,
      client_reference_id: user.id,
      'metadata[uid]': user.id,
      'metadata[tier]': tier,
      'subscription_data[metadata][uid]': user.id,
      'subscription_data[metadata][tier]': tier,
      allow_promotion_codes: 'true',
      success_url: `${base}/profil?betalt=1`,
      cancel_url: `${base}/priser?avbrutt=1`,
    }, SECRET)

    return json({ url: session.url })
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400)
  }
})
