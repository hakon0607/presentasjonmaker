import { createClient } from '@supabase/supabase-js'

const env = import.meta.env
// Støtter både egne VITE_-variabler og Supabase-Vercel-integrasjonens NEXT_PUBLIC_-variabler.
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Mangler Supabase-variabler. Sett VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, eller bruk Supabase-integrasjonen (NEXT_PUBLIC_...).')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
