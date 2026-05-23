@AGENTS.md

# CLAUDE.md — Reguli specifice proiectului DoCourse

## Proiect și scope

Lucrezi exclusiv pe **`docourse-next/`** — platforma Next.js de la `https://docourse.ro`.

**Nu atinge niciodată:**
- `simple-course-link/` — proiect separat cu Edge Functions Deno/Supabase
- Fișiere `.env.local`, chei API, credențiale Stripe sau Supabase
- Tabelele din Supabase fără să verifici schema reală cu `information_schema.columns`

## Înainte de orice push

Rulează obligatoriu în ordine:

```bash
npx tsc --noEmit          # zero erori TypeScript
npm run build             # build complet fără erori webpack
```

Dacă oricare din comenzi eșuează, **nu push**. Rezolvă eroarea mai întâi.

## Stack tehnic exact

| Strat | Tehnologie |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Limbaj | TypeScript 5, strict mode |
| UI | Tailwind CSS + Radix UI + shadcn/ui |
| Rich text | TipTap 3 |
| Data fetching | TanStack Query 5 |
| Sanitizare HTML | DOMPurify (instalat, folosește-l) |
| Bază de date | Supabase (PostgreSQL) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Storage | Supabase Storage |
| Plăți | Stripe (subscripții, webhooks, checkout) |
| Deploy | Vercel (auto-deploy din `main`) |
| Edge Functions | Deno (în `simple-course-link/supabase/functions/`) |

## Reguli Supabase

**Schema profiles — coloane existente:**
`id, full_name, bio, email, created_at, updated_at, user_id, beta_tester, lifetime_access, subscription_active, activity, avatar_url, stripe_customer_id, stripe_subscription_id, role, plan_type`

**Nu există coloana `stripe_status`** — nu o include în niciun `update` sau `select`.

Când cauți un user după email, verifică că `profiles.email` nu e null. Dacă poate fi null, join cu `auth.users`:
```sql
SELECT p.*, au.email
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = $1;
```

Nu apela niciodată `supabase.auth.admin.listUsers()` — face timeout. Interoghează direct `profiles`.

Clientul Supabase cu service role (pentru operații admin) se creează cu `SUPABASE_SERVICE_ROLE_KEY`, nu cu `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role key este format JWT (`eyJ...`).

## Reguli Stripe

Webhook-ul de producție este la `/api/webhooks/stripe` (ruta: `src/app/api/webhooks/stripe/route.ts`).

Verificarea semnăturii folosește **native Node.js `crypto`**, nu Stripe SDK:
- Body-ul se citește cu `request.text()` — niciodată `request.json()` înainte de verificare
- Signing secret vine din `process.env.STRIPE_WEBHOOK_SECRET`
- Variabilele de mediu Stripe stau în Vercel, nu în cod

Evenimentele procesate de webhook:
- `checkout.session.completed` → activează user dacă `session.mode === "subscription"`
- `invoice.payment_succeeded` / `invoice.paid` → activează user
- `invoice.payment_failed` → dezactivează user

Activarea/dezactivarea se face prin update pe `profiles` cu coloanele `subscription_active` și `plan_type` — **nimic altceva**.

## Reguli Next.js / App Router

- `export const runtime = "nodejs"` în orice API route care folosește `crypto` nativ sau citește body raw.
- Server Components sunt default. `"use client"` doar când e strict necesar.
- URL-ul de producție este `https://docourse.ro` (fără `www.`). Nu hardcoda `www.docourse.ro` — provoacă redirect 301 care sparge webhook-urile Stripe.
- Security headers sunt în `next.config.ts`. Dacă adaugi o resursă externă nouă, actualizează CSP în același PR.

## Reguli TypeScript

- `strict: true` activ — nu îl dezactiva.
- `ReturnType<typeof createClient>` din Supabase generează incompatibilități de generics. Când pasezi clientul ca parametru, tipează-l cu `any` și adaugă comentariul `// Supabase generic mismatch`.
- Rulează `npx tsc --noEmit` local înainte de push — build-ul pe Vercel eșuează pe erori de tip.

## Reguli Vercel / deploy

- Variabilele de mediu se setează în Vercel Dashboard → Settings → Environment Variables.
- Variabile necesare în producție: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Orice variabilă nouă adăugată în cod trebuie adăugată și în Vercel înainte de push — altfel build-ul trece dar runtime-ul eșuează.
- Deploy-ul se face automat la push pe `main`. Verifică în Vercel că build-ul a trecut înainte să anunți că fix-ul e live.

## Comportamente non-negociabile

1. **Nu scrie în baza de date coloane care nu există.** Verifică schema cu SQL înainte de orice update nou.
2. **Nu face push dacă `tsc --noEmit` sau `npm run build` eșuează.**
3. **Nu hardcoda URL-uri cu `www.`** — platforma redirectează www → non-www și asta sparge webhook-urile.
4. **Nu importa pachetul `stripe`** în Next.js pentru verificarea webhook-urilor — folosește `crypto` nativ.
5. **Nu loga body-ul complet al requesturilor Stripe** în producție.
6. **Nu activa sau dezactiva subscripții pe baza datelor din request** — verifică întotdeauna din Supabase.
