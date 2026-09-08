// Admin-API (Deno-vennlig, fetch): statistikk, kundeliste, avbestilling. Kun for admin.
// Body: { action: 'stats' | 'list' | 'cancel', uid?, immediate? }
const URL = Deno.env.get('SUPABASE_URL')!
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })
const rh = { apikey: SRV, Authorization: `Bearer ${SRV}` }

async function stripe(path: string, body: Record<string, string>, key: string, method = 'POST') {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'POST' ? new URLSearchParams(body).toString() : undefined,
  })
  return await r.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const jwt = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const u = await (await fetch(`${URL}/auth/v1/user`, { headers: { apikey: SRV, Authorization: `Bearer ${jwt}` } })).json().catch(() => null)
    if (!u?.id) return json({ error: 'Ikke innlogget' }, 401)
    const me = await (await fetch(`${URL}/rest/v1/profiles?id=eq.${u.id}&select=is_admin`, { headers: rh })).json()
    if (!me?.[0]?.is_admin) return json({ error: 'Kun for admin' }, 403)

    const { action, uid, immediate } = await req.json()

    if (action === 'stats' || action === 'list') {
      const rows = await (await fetch(`${URL}/rest/v1/profiles?select=id,email,plan,tokens_daily,sub_status,sub_interval,sub_period_end,stripe_subscription_id&order=sub_period_end.desc.nullslast`, { headers: rh })).json()
      const plans = await (await fetch(`${URL}/rest/v1/plans?select=tier,name,price_month_nok,price_year_nok`, { headers: rh })).json()
      const priceOf = (tier: string, interval: string) => {
        const p = plans.find((x: any) => x.tier === tier); if (!p) return 0
        return interval === 'year' ? Math.round((p.price_year_nok || 0) / 12) : (p.price_month_nok || 0)
      }
      const active = rows.filter((r: any) => r.sub_status === 'active' || r.sub_status === 'trialing')
      const mrr = active.reduce((s: number, r: any) => s + priceOf(r.plan, r.sub_interval || 'month'), 0)
      const byPlan: Record<string, number> = {}
      for (const r of active) byPlan[r.plan] = (byPlan[r.plan] || 0) + 1
      if (action === 'stats') return json({ activeCount: active.length, mrr, byPlan, totalUsers: rows.length })
      return json({ customers: rows })
    }

    if (action === 'cancel') {
      if (!uid) return json({ error: 'Mangler uid' }, 400)
      const prof = await (await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}&select=stripe_subscription_id`, { headers: rh })).json()
      const subId = prof?.[0]?.stripe_subscription_id
      const SECRET = Deno.env.get('STRIPE_SECRET_KEY')
      if (subId && SECRET) {
        if (immediate) await stripe(`subscriptions/${subId}`, {}, SECRET, 'DELETE')
        else await stripe(`subscriptions/${subId}`, { cancel_at_period_end: 'true' }, SECRET, 'POST')
      }
      if (immediate) await fetch(`${URL}/rest/v1/profiles?id=eq.${uid}`, { method: 'PATCH', headers: { ...rh, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ plan: 'gratis', sub_status: 'canceled', stripe_subscription_id: null }) })
      return json({ ok: true })
    }
    return json({ error: 'Ukjent handling' }, 400)
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400)
  }
})
