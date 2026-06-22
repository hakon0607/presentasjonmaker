import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// envPrefix gjør at både VITE_* og NEXT_PUBLIC_* (fra Supabase-Vercel-integrasjonen) blir lest.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
