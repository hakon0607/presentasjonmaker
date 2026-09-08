// Starter en Stripe Checkout-økt for et abonnement.
// Body: { tier: 'pluss'|'pro', interval: 'month'|'year', origin: 'https://din-app.no' }
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const SECRET = Deno.env.get('STRIPE_SECRET_KEY')
    const URL = Deno.env.get('SUPABASE_URL')!
    const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!SECRET) return json({ error: 'STRIPE_SECRET_KEY mangler' }, 500)
    const stripe = new Stripe(SECRET, { apiVersion: '2024-06-20', httpClient: Stripe.createFetchHttpClient() })

    // hvem er brukeren? (fra JWT)
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const ures = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: SRV, Authorization: `Bearer ${jwt}` } })
    const user = await ures.json().catch(() => null)
    if (!user?.id) return json({ error: 'Ikke innlogget' }, 401)

    const { tier, interval, origin } = await req.json()
    if (!['pluss', 'pro'].includes(tier) || !['month', 'year'].includes(interval)) return json({ error: 'Ugyldig valg' }, 400)

    // finn price-id fra plans
    const h = { apikey: SRV, Authorization: `Bearer ${SRV}` }
    const pres = await fetch(`${URL}/rest/v1/plans?tier=eq.${tier}&select=price_month_id,price_year_id`, { headers: h })
    const plan = (await pres.json())?.[0]
    const price = interval === 'year' ? plan?.price_year_id : plan?.price_month_id
    if (!price) return json({ error: `Mangler Stripe-pris for ${tier}/${interval}. Legg inn price-id i plans-tabellen.` }, 400)

    // gjenbruk kundens Stripe-customer hvis vi har den
    const prof = await (await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id,email`, { headers: h })).json()
    let customer = prof?.[0]?.stripe_customer_id || undefined

    const base = origin || (req.headers.get('origin') ?? '')
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      customer,
      customer_email: customer ? undefined : (user.email || prof?.[0]?.email || undefined),
      client_reference_id: user.id,
      metadata: { uid: user.id, tier },
      subscription_data: { metadata: { uid: user.id, tier } },
      allow_promotion_codes: true,
      success_url: `${base}/profil?betalt=1`,
      cancel_url: `${base}/priser?avbrutt=1`,
    })
    return json({ url: session.url })
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500)
  }
})
