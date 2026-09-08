import { supabase } from './supabase'
import { fireNoTokens } from './tokenGate'

// Fang «tom for tokens» fra ALLE smart-task-kall ett sted, så skjermen popper opp
// uansett hvor i appen handlingen ble startet (omskriv, rediger, lag lysbilde osv.).
if (supabase?.functions && !supabase.functions.__tokenPatched) {
  const orig = supabase.functions.invoke.bind(supabase.functions)
  supabase.functions.invoke = async (name, opts) => {
    const res = await orig(name, opts)
    try { const d = res && res.data; if (d && d.noTokens) fireNoTokens({ needed: d.needed, have: d.tokens }) } catch (_e) { /* ignore */ }
    return res
  }
  supabase.functions.__tokenPatched = true
}
