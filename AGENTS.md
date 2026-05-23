# AGENTS.md — Reguli non-negociabile pentru orice programator sau agent AI

## 1. Secrete și variabile de mediu

- **Niciodată** nu hardcoda chei API, parole, JWT-uri sau URL-uri private în cod sau fișiere commituite.
- Toate secretele stau în `.env.local` (local) și în Vercel Environment Variables (producție). `.env.local` este în `.gitignore` și nu se commitează niciodată.
- Variabilele publice (expuse în browser) au prefix `NEXT_PUBLIC_`. Tot ce nu are acest prefix este server-side only.
- Înainte de orice push, verifică cu `git diff --staged` că nu ai commitat fișiere `.env`, chei sau credențiale.
- Nu loga niciodată valori din `process.env` în producție.

## 2. Bază de date (Supabase / PostgreSQL)

- **Verifică întotdeauna că o coloană există** înainte să o folosești într-un `update` sau `select`. Folosește `information_schema.columns` dacă nu ești sigur.
- Fiecare tabel nou are Row Level Security (RLS) activat din prima zi. Nicio tabelă fără RLS în producție.
- Politicile RLS sunt restrictive by default: `DENY ALL`, apoi adaugi `ALLOW` explicit.
- Nu folosi `supabase.auth.admin.listUsers()` — face timeout pe volume mari. Interoghează direct tabelul `profiles` filtrat pe coloana `email` sau `user_id`.
- Când `profiles.email` poate fi null, join-uiește cu `auth.users` pentru a obține emailul real: `JOIN auth.users au ON p.user_id = au.id`.
- Indexuri obligatorii pe coloanele folosite în `WHERE`, `JOIN` și `ORDER BY` pentru tabele > 1000 rânduri.
- Nicio migrație destructivă (DROP COLUMN, DROP TABLE) fără backup confirmat și fără aprobare explicită.
- Operațiile care modifică mai multe tabele se fac în tranzacție sau se folosesc funcții RPC atomice.

## 3. Autentificare și autorizare

- Orice endpoint care returnează sau modifică date ale unui user verifică că `user_id` din sesiune == `user_id` al resursei. Nu te baza pe date trimise de client.
- Erori de autentificare → 401. Erori de autorizare (ești logat dar nu ai voie) → 403. Nu returna 200 cu `{ error: "unauthorized" }`.
- Cookies de sesiune: `HttpOnly`, `Secure`, `SameSite=Strict`.
- Nu stoca niciodată parole în clar, nici în baza de date, nici în logs.
- Token-urile de reset parolă sunt single-use și expiră în maxim 1 oră.

## 4. Input și output

- Validare server-side pentru orice input, indiferent dacă există validare și pe client.
- Nicio interogare SQL construită prin concatenare de string-uri. Folosește întotdeauna query builders (Supabase client) sau parametri pregătiți.
- Tot HTML dinamic afișat în browser trece prin `DOMPurify.sanitize()` înainte de render. Proiectul are deja `dompurify` instalat — folosește-l.
- Upload-uri de fișiere: verifică extensia și MIME type pe server, nu doar pe client. Limita de mărime se impune înainte de procesare.
- Nu reflecta input-ul utilizatorului direct în răspunsuri API fără sanitizare.

## 5. API design

- Status codes corecte: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.
- Nu returna 200 când operația a eșuat. Returnează codul corect cu un mesaj de eroare structurat: `{ "error": "descriere" }`.
- Toate listele sunt paginate. Default: maxim 50 de elemente pe pagină. Returnează `{ data: [], total: N, page: N }`.
- Răspunsurile sunt consistente — același endpoint returnează întotdeauna același shape, indiferent de path (succes sau eroare).

## 6. Security headers și CORS

- Security headers sunt configurate în `next.config.ts` și se aplică pe toate rutele. Nu le modifica fără motiv bine justificat.
- CORS restrictiv: doar `https://docourse.ro` și `https://www.docourse.ro`. Niciodată `Access-Control-Allow-Origin: *` pe endpoint-uri autentificate.
- CSP este configurat și activ. Dacă adaugi o resursă externă nouă (CDN, font, iframe), actualizează CSP înainte de deploy.

## 7. Rate limiting

- Endpoint-urile publice (login, register, reset-password, webhook-uri externe) au rate limiting.
- Endpoint-urile care trimit email au limită strictă per IP și per adresă de email.
- Depășirea limitei → 429 cu header `Retry-After`.

## 8. Plăți (Stripe)

- **Niciodată** nu acorda acces premium pe baza unui răspuns de la client. Verifică statusul abonamentului doar din Supabase (coloana `subscription_active` din `profiles`).
- Webhook-urile Stripe se verifică criptografic prin HMAC-SHA256 cu signing secret (`whsec_...`). Folosește native `crypto` din Node.js, nu Stripe SDK, pentru verificare.
- Body-ul requestului webhook trebuie citit ca text raw (`request.text()`) înainte de orice altă procesare. Parsarea JSON se face după verificarea semnăturii.
- Fiecare endpoint Stripe webhook are propriul signing secret. Nu reutiliza același secret pentru endpoint-uri diferite.
- Evenimentele Stripe se procesează idempotent — același eveniment procesat de două ori nu trebuie să dubleze efectele.
- Nu stoca numere de card, CVV sau date de plată complete. Stripe gestionează asta — tu stochezi doar `stripe_customer_id` și `stripe_subscription_id`.
- Înainte să scrii un update pe `profiles` legat de abonament, verifică că toate coloanele din update există în tabel.

## 9. Cod curat

- O funcție = un singur scop. Dacă funcția face două lucruri, împarte-o.
- Maxim 30 de linii per funcție. Dacă depășești, extrage logica în funcții helper cu nume descriptive.
- Fără magic numbers sau magic strings. Constantele au nume: `const MAX_FILE_SIZE_MB = 10`, nu `if (size > 10485760)`.
- Fără dead code — cod comentat, funcții nefolosite, importuri inutile. Șterge, nu comenta.
- Fără duplicare. Dacă o bucată de logică apare de două ori, extrage-o.

## 10. TypeScript

- `strict: true` este activat în `tsconfig.json`. Nu îl dezactiva.
- Fără `any` explicit, cu excepția cazurilor unde tipul Supabase client generează incompatibilități de generics documentate. În acel caz, adaugă comentariu `// Supabase generic mismatch` pe linia respectivă.
- Fără non-null assertion (`!`) fără verificare anterioară explicită. Folosește optional chaining (`?.`) și nullish coalescing (`??`).
- Tipurile se definesc cu `interface` pentru forme de date și cu `type` pentru uniuni și aliasuri. Nu amesteca arbitrar.
- `ReturnType<typeof createClient>` din `@supabase/supabase-js` generează tipuri generice complexe — când pasezi clientul ca parametru de funcție, tipează-l ca `ReturnType<typeof createClient>` sau folosește `any` cu comentariu explicit.

## 11. React / Next.js

- Componentele server-side (Server Components) sunt default în App Router. Adaugă `"use client"` doar când e strict necesar (hooks, event listeners, browser APIs).
- Listele cu `.map()` au întotdeauna `key` stabil și unic (ID din baza de date, nu index array).
- `useEffect` cu subscripții sau timers returnează întotdeauna cleanup function.
- Imaginile folosesc `next/image`, nu `<img>`. Dacă sursa e externă, adaugă domeniul în `remotePatterns` din `next.config.ts`.
- `loading.tsx` și `error.tsx` există pentru fiecare segment de rută cu fetch de date.
- Datele sensibile nu se pun niciodată în `searchParams` sau URL.

## 12. Performanță

- N+1 queries sunt interzise. Dacă faci un fetch într-un loop, refactorizează cu `IN` clause sau join.
- Bundle size: nu importa biblioteci întregi când ai nevoie de o funcție. `import { format } from 'date-fns'`, nu `import * as dateFns`.
- Lazy loading pentru componente grele (editoare rich text, charts, modals mari): `dynamic(() => import(...), { ssr: false })`.
- Imaginile mari au `priority` doar pe above-the-fold. Restul se încarcă lazy (default Next.js).

## 13. Accesibilitate WCAG 2.1 AA

- Contrast minim 4.5:1 pentru text normal, 3:1 pentru text mare.
- Toate elementele interactive sunt accesibile de la tastatură (Tab, Enter, Space, Escape).
- Imaginile decorative au `alt=""`. Imaginile informative au `alt` descriptiv.
- Formularele au `<label>` asociat fiecărui `<input>` prin `htmlFor`/`id`.
- Nu folosi `div` sau `span` cu `onClick` fără `role` și `tabIndex`. Folosește elemente native (`button`, `a`, `input`).
- Mesajele de eroare din formulare sunt asociate cu câmpul prin `aria-describedby`.

## 14. Gestionarea erorilor

- Niciun `catch` gol. Fiecare eroare prinsă este fie logată, fie aruncată mai departe, fie tratată explicit.
- Stack trace-urile nu ajung niciodată la client. Clientul vede un mesaj generic; serverul logează detaliile.
- Erorile din Supabase (`.error`) se verifică după fiecare operație critică. Nu ignora `.error` returnat de client.
- API routes returnează întotdeauna un răspuns, chiar și în cazuri de eroare neașteptate (try/catch în jurul întregii funcții).

## 15. Logging

- Nicio informație sensibilă în logs: parole, token-uri, numere de card, date personale complete.
- Logurile sunt structurate JSON în producție: `{ level, message, timestamp, context }`.
- Niveluri: `debug` (dev only), `info` (evenimente normale), `warn` (situații recuperabile), `error` (erori reale).
- Nu loga body-ul complet al requesturilor Stripe — conțin date de plată.

## 16. Dependențe

- Versiunile din `package.json` sunt fixate cu `^` pentru minor updates. Nu folosi `*` sau `latest`.
- `package-lock.json` se commitează întotdeauna. Nu îl adăuga în `.gitignore`.
- `npm audit` înainte de orice release. Vulnerabilitățile critice sau înalte se remediază înainte de deploy.
- Nu adăuga dependențe noi fără să verifici că nu există deja o modalitate nativă sau cu bibliotecile existente.

## 17. Git și review

- Commit-urile sunt atomice: un commit = o schimbare logică. Nu amesteca refactoring cu bugfix cu feature.
- Mesajele de commit urmează formatul: `type: descriere scurtă` (ex: `fix: remove stripe_status from profiles update`).
- `force-push` pe `main` este interzis. Dacă ai greșit, creează un nou commit de revert.
- PR-urile au maxim 400 de linii modificate. Dacă e mai mare, împarte.
- Niciodată nu mergi direct pe `main` fără PR review pentru schimbări în producție.

## 18. SSRF

- Nu face fetch la URL-uri furnizate direct de utilizatori fără validare.
- Blochează explicit URL-urile cu IP-uri private (10.x.x.x, 192.168.x.x, 172.16-31.x.x, 127.x.x.x, ::1) și metadata cloud (169.254.169.254).
- Validează că URL-urile externe sunt `https://` și aparțin domeniilor așteptate.

## 19. Testare

- Testele verifică comportamentul observabil, nu implementarea internă. Nu testa metode private sau structura internă a funcțiilor.
- Testele sunt deterministe — nu depind de ordinea de execuție, timp real sau state global.
- Fiecare test acoperă și cazul de eroare, nu doar happy path.
- Datele de test sunt izolate — fiecare test creează și curăță propriile date.

## 20. Documentație și comentarii

- Comentariile explică **DE CE**, niciodată **CE** face codul. Codul bine scris explică singur ce face.
- Nu adăuga comentarii care parafrazează codul: `// incrementează i` peste `i++` este zgomot.
- Documentează constrângerile ascunse, invariantele subtile sau workaround-urile pentru bug-uri specifice.
- Nu lăsa `TODO` sau `FIXME` în cod fără un issue creat. Dacă nu e într-un issue, nu există.
