// Stripe webhook: holder profiles oppdatert med abonnement-status og daglig token-kvote.
// Sett Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// I Stripe: send disse hendelsene hit:
//   checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const URL = Deno.env.get('SUPABASE_URL')!
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const h = { apikey: SRV, Authorization: `Bearer ${SRV}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }

async function planForPrice(priceId: string) {
  const r = await fetch(`${URL}/rest/v1/plans?or=(price_month_id.eq.${priceId},price_year_id.eq.${priceId})&select=tier,tokens_daily,price_month_id`, { headers: { apikey: SRV, Authorization: `Bearer ${SRV}` } })
  const row = (await r.json())?.[0]
  if (!row) return null
  return { tier: row.tier as string, tokens_daily: row.tokens_daily as number, interval: row.price_month_id === priceId ? 'month' : 'year' }
}
async function gratisTokens() {
  const r = await fetch(`${URL}/rest/v1/plans?tier=eq.gratis&select=tokens_daily`, { headers: { apikey: SRV, Authorization: `Bearer ${SRV}` } })
  return (await r.json())?.[0]?.tokens_daily ?? 5
}
async function patchProfile(uid: string, body: Record<string, unknown>) {
  await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
}
async function uidFromCustomer(customer: string): Promise<string | null> {
  const r = await fetch(`${URL}/rest/v1/profiles?stripe_customer_id=eq.${customer}&select=id`, { headers: { apikey: SRV, Authorization: `Bearer ${SRV}` } })
  return (await r.json())?.[0]?.id ?? null
}

Deno.serve(async (req) => {
  const SECRET = Deno.env.get('STRIPE_SECRET_KEY')
  const WH = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!SECRET || !WH) return new Response('mangler nøkler', { status: 500 })
  const stripe = new Stripe(SECRET, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() })

  const sig = req.headers.get('stripe-signature') || ''
  const raw = await req.text()
  let ev: Stripe.Event
  try {
    ev = await stripe.webhooks.constructEventAsync(raw, sig, WH)
  } catch (e) {
    return new Response(`Bad signature: ${e?.message}`, { status: 400 })
  }

  try {
    if (ev.type === 'checkout.session.completed') {
      const s = ev.data.object as Stripe.Checkout.Session
      const uid = s.client_reference_id || (s.metadata?.uid as string)
      const customer = String(s.customer)
      if (uid && customer) await patchProfile(uid, { stripe_customer_id: customer, email: s.customer_details?.email ?? undefined })
    }

    if (ev.type === 'customer.subscription.updated' || ev.type === 'customer.subscription.created') {
      const sub = ev.data.object as Stripe.Subscription
      const uid = (sub.metadata?.uid as string) || await uidFromCustomer(String(sub.customer))
      const price = sub.items.data[0]?.price?.id
      const plan = price ? await planForPrice(price) : null
      if (uid) {
        const active = sub.status === 'active' || sub.status === 'trialing'
        await patchProfile(uid, {
          stripe_customer_id: String(sub.customer),
          stripe_subscription_id: sub.id,
          sub_status: sub.status,
          sub_interval: plan?.interval ?? null,
          sub_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          plan: active && plan ? plan.tier : 'gratis',
          tokens_daily: active && plan ? plan.tokens_daily : await gratisTokens(),
        })
      }
    }

    if (ev.type === 'customer.subscription.deleted') {
      const sub = ev.data.object as Stripe.Subscription
      const uid = (sub.metadata?.uid as string) || await uidFromCustomer(String(sub.customer))
      if (uid) await patchProfile(uid, { sub_status: 'canceled', plan: 'gratis', tokens_daily: await gratisTokens(), stripe_subscription_id: null })
    }
  } catch (e) {
    return new Response(`handler error: ${e?.message}`, { status: 500 })
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
