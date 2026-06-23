# AiPressent – kom i gang

## 1. Ny Supabase
1. Lag nytt prosjekt på supabase.com.
2. SQL Editor → lim inn alt fra `supabase/schema.sql` → Run.
3. Project Settings → API: kopier **Project URL** og **anon public key** (brukes i steg 3).

## 2. AI-funksjonen
1. Edge Functions → Create function → navn `ai-slides` → lim inn `supabase/functions/ai-slides/index.ts` → Deploy.
2. Edge Functions → Secrets → legg til `OPENAI_API_KEY` = din OpenAI-nøkkel.

## 3. GitHub + Vercel
1. Last opp hele mappa til et nytt GitHub-repo.
2. Vercel → New Project → importer repoet.
3. Framework: Vite. Legg inn miljøvariabler:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
4. Deploy.

## 4. (Viktig for e-post-innlogging)
Sett opp egen SMTP under Authentication → SMTP Settings (ellers når ikke bekreftelses-e-poster fram til andre enn deg selv).
