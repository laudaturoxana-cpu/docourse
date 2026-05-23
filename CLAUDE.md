@AGENTS.md

# CLAUDE.md — Reguli specifice proiectului DoCourse

## Proiect și scope

Lucrezi exclusiv pe **`docourse-next/`** — platforma Next.js de la `https://docourse.ro`.

**Nu atinge niciodată fără instrucțiune explicită:**
- `simple-course-link/` — proiect separat cu Edge Functions Deno/Supabase, reguli diferite
- Orice fișier `.env.local` sau fișier cu credențiale
- Tabelele din Supabase fără să verifici schema reală cu `information_schema.columns` înainte

## Înainte de orice push — în această ordine

```bash
# 1. Zero erori TypeScript
npx tsc --noEmit

# 2. Build complet fără erori webpack sau de tip
npm run build

# 3. Zero vulnerabilități HIGH sau CRITICAL
npm audit --audit-level=high

# 4. SEMNAL DE ALARMĂ — verifici că nu ai commitat secrete
git status
# Dacă apare orice fișier .env, .env.local, .env.production — STOP, nu faci push
```

Dacă oricare din primele trei eșuează — **nu push**. Rezolvi eroarea mai întâi.

## Stack tehnic identificat în proiect

| Strat | Tehnologie | Versiune |
|-------|-----------|---------|
| Framework | Next.js App Router | 15.5.15 |
| Limbaj | TypeScript | 5, `strict: true` |
| UI components | Radix UI + shadcn/ui | latest |
| Styling | Tailwind CSS | 3.4 |
| Rich text editor | TipTap | 3.22 |
| Formulare | React Hook Form + Zod | latest |
| Data fetching | TanStack Query | 5 |
| Sanitizare HTML | DOMPurify | 3.4 |
| Charts | Recharts | 2.15 |
| Bază de date | Supabase (PostgreSQL) | `@supabase/supabase-js` 2.105 |
| Auth | Supabase Auth | `@supabase/ssr` 0.10 |
| Storage | Supabase Storage | — |
| Plăți | Stripe webhooks (native crypto) | fără SDK instalat |
| Deploy | Vercel (auto-deploy din `main`) | — |
| Versionare | GitHub | — |

**Stripe SDK nu este instalat.** Verificarea webhook-urilor folosește `crypto` nativ din Node.js.

## Reguli specifice Supabase

**Schema tabelului `profiles` — coloane existente:**
```
id, full_name, bio, email, created_at, updated_at, user_id,
beta_tester, lifetime_access, subscription_active, activity,
avatar_url, stripe_customer_id, stripe_subscription_id, role, plan_type
```

**Nu există coloana `stripe_status`** — nu o include în niciun `update` sau `select`.

`profiles.email` poate fi `null` pentru useri mai vechi. Când ai nevoie de email garantat, join cu `auth.users`:
```sql
SELECT p.*, au.email
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = $1;
```

Nu apela niciodată `supabase.auth.admin.listUsers()` — face timeout pe volume mari. Interoghează direct tabelul `profiles` filtrat pe `email` sau `user_id`.

Clientul admin (service role) se creează cu `SUPABASE_SERVICE_ROLE_KEY`. Aceasta este o cheie JWT format `eyJ...` — **nu** este aceeași cu `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Reguli specifice Stripe

Webhook-ul de producție: `src/app/api/webhooks/stripe/route.ts` → `https://docourse.ro/api/webhooks/stripe`

**Verificarea semnăturii folosește `crypto` nativ Node.js** — nu importa pachetul `stripe` pentru asta.

Regula obligatorie pentru orice API route care verifică webhook-uri Stripe:
```typescript
export const runtime = "nodejs"; // necesar pentru crypto nativ și request.text()
```

Body-ul se citește cu `request.text()` **înainte** de `JSON.parse()`. Ordinea contează — semnătura se calculează pe body-ul raw.

Evenimentele procesate:
- `checkout.session.completed` → activează user dacă `session.mode === "subscription"` și nu are `metadata.membership_plan_id`
- `invoice.payment_succeeded` / `invoice.paid` → activează user
- `invoice.payment_failed` → dezactivează user

Activarea/dezactivarea scrie **exclusiv** pe coloanele `subscription_active` și `plan_type` din `profiles`. Nicio altă coloană.

## Reguli specifice Next.js / App Router

URL-ul de producție este **`https://docourse.ro`** (fără `www.`). Nu hardcoda `www.docourse.ro` nicăieri — provoacă redirect 301 care sparge webhook-urile Stripe (semnătura nu mai e validă după redirect).

Security headers configurate în `next.config.ts` — aplicate pe toate rutele. Dacă adaugi o resursă externă nouă (API, font, CDN, iframe), actualizezi `Content-Security-Policy` în același PR.

`export const runtime = "nodejs"` necesar în orice route care:
- Folosește `crypto` din Node.js
- Citește body-ul ca text raw (`request.text()`)
- Folosește module Node.js indisponibile în Edge runtime

## Reguli specifice TypeScript

`strict: true` activ. `skipLibCheck: true` activ (pentru compatibilitate cu tipuri Supabase).

ESLint marchează `any` ca **warning** (nu error) — în code review tratezi warning-urile ca erori. Nu lăsa `any` fără comentariu explicit care explică de ce e necesar.

`ReturnType<typeof createClient>` din `@supabase/supabase-js` generează incompatibilități de generics la pasarea clientului ca parametru de funcție. Soluție acceptată: tipează parametrul ca `any` cu comentariul `// Supabase generic mismatch — ReturnType incompatible across versions`.

## Validare

`zod` este instalat. Folosește-l pentru:
- Validarea body-ului în API routes
- Tiparea formularelor cu `react-hook-form` + `@hookform/resolvers/zod`
- Inferarea tipurilor TypeScript din scheme: `z.infer<typeof MySchema>`

Nu creezi tipuri manual pentru date care vin din input extern — definești schema Zod și inferezi tipul.

## HTML dinamic și rich text

TipTap generează HTML. Înainte de `dangerouslySetInnerHTML` cu output TipTap, treci conținutul prin `DOMPurify.sanitize()`. `dompurify` este instalat.

## Environment variables

**Locale (development):** `.env.local` — gitignore activ prin `.env*` în `.gitignore`.

**Producție:** Vercel Dashboard → Settings → Environment Variables.

Variabile necesare în producție:
- `NEXT_PUBLIC_SUPABASE_URL` — URL public Supabase (sigur în browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — cheie anonimă Supabase (sigură în browser)
- `SUPABASE_SERVICE_ROLE_KEY` — cheie admin Supabase (server-side only, format `eyJ...`)
- `STRIPE_WEBHOOK_SECRET` — signing secret webhook Stripe (server-side only, format `whsec_...`)

**Nu există `.env.example` în repo** — dacă adaugi o variabilă nouă, creezi `.env.example` cu placeholder și îl commiți.

## Comportamente non-negociabile

1. **Nu scrie în baza de date coloane care nu există.** Verifică schema cu `information_schema.columns` înainte de orice update care implică coloane noi sau necunoscute.
2. **Nu face push fără `tsc --noEmit` și `npm run build` cu succes.**
3. **Nu hardcoda URL cu `www.`** — platforma redirectează www → non-www și asta invalidează semnăturile Stripe.
4. **Nu importa pachetul `stripe`** în Next.js pentru verificarea webhook-urilor — nu e instalat, folosești `crypto` nativ.
5. **Nu loga body-ul complet al requesturilor Stripe** — conțin date de plată.
6. **Nu activa sau dezactiva subscripții pe baza datelor din request** — sursa de adevăr este Supabase, actualizată exclusiv de webhook după verificarea semnăturii.
7. **Nu apela `supabase.auth.admin.listUsers()`** — face timeout. Folosești `profiles` table direct.
