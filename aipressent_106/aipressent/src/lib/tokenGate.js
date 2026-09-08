// Liten «buss» så «tom for tokens»-skjermen kan trigges fra hvor som helst.
let handler = null
export function onNoTokens(fn) { handler = fn; return () => { if (handler === fn) handler = null } }
export function fireNoTokens(info) { try { if (handler) handler(info || {}) } catch (_e) { /* ignore */ } }
