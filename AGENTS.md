# AGENTS.md — Reguli non-negociabile pentru orice programator sau agent AI

## 1. Secrete și variabile de mediu

- Niciodată secrete în codul sursă, fișiere commituite sau variabile `NEXT_PUBLIC_` — acestea sunt vizibile în browser.
- `.env.local` pentru development. `.env.local` este în `.gitignore` (`env*`) — nu îl comita niciodată.
- Producția folosește variabile setate în **Vercel Dashboard → Settings → Environment Variables**, nu fișiere locale.
- `.env.example` commituit în repo cu placeholder-e — documentează ce variabile sunt necesare fără să expună valorile.
- **SEMNAL DE ALARMĂ înainte de orice push:** rulează `git status` și verifici că nu apare niciun `.env`, `.env.local`, `.env.production` sau variantă. Dacă apare — **STOP, nu faci push**. Un secret publicat pe GitHub trebuie considerat compromis și rotat imediat — boți scanează în timp real.
- Variabilele cu prefix `NEXT_PUBLIC_` sunt expuse în bundle-ul de browser. Nu pune niciodată un secret acolo, indiferent de context.

## 2. Bază de date (Supabase / PostgreSQL)

- **Row Level Security activat pe fiecare tabel** înainte de orice deployment. Policy default: `DENY ALL`. Adaugi `ALLOW` explicit și minim necesar.
- Queries scoped la `auth.uid()` — niciodată date ale unui alt user decât cel autentificat.
- Indexes pe toate coloanele folosite în `WHERE`, `JOIN`, `ORDER BY` pe tabele cu volum.
- Nicio migrație fără plan de rollback documentat.
- Niciun `UPDATE` sau `DELETE` fără clauză `WHERE`. Un bulk update fără WHERE pe tabelul `profiles` îl afectează pe toți userii.
- Operațiile care modifică mai multe tabele și trebuie să reușească sau să eșueze împreună folosesc tranzacții sau funcții RPC atomice.
- **Verifică schema înainte să scrii orice query nou.** Nu presupune că o coloană există — consultă `information_schema.columns` dacă nu ești sigur. Erorile de coloană inexistentă în producție sunt silențioase în unele contexte și cauzează date corupte.

## 3. Autentificare și autorizare

- Fiecare API route protejat verifică autentificarea **înainte** de orice logică de business.
- `401 Unauthorized` pentru requests neautentificate. `403 Forbidden` pentru autentificat dar fără permisiuni. Niciodată `200` cu body de eroare.
- Fiecare route care accesează o resursă cu ID verifică explicit că userul autentificat deține resursa — separat de verificarea autentificării.
- Cookies: `HttpOnly: true`, `Secure: true`, `SameSite: lax`.
- Tokeni de reset parolă: expiră în maxim 1 oră, single-use — invalidați după prima utilizare.

## 4. Input și output

- Niciodată input de la user concatenat în SQL. Folosești Supabase client cu parametri — nu construiești query-uri manual.
- `dangerouslySetInnerHTML` numai cu conținut trecut prin `DOMPurify.sanitize()`. Pachetul `dompurify` este instalat — folosește-l.
- Validare server-side obligatorie cu `zod` (instalat) — cea client-side este doar UX și poate fi ocolită.
- Upload-uri: validare prin magic bytes pe server (nu extensie), redenumire la UUID înainte de stocare, stocare în Supabase Storage pe bucket dedicat cu politici RLS.
- Nu reflecta niciodată input-ul utilizatorului direct în răspunsuri fără sanitizare.

## 5. API design

- Status codes corecte: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `422` Unprocessable Entity, `429` Too Many Requests, `500` Internal Server Error.
- Niciodată `200` cu body de eroare (ex: `{ error: "unauthorized" }` cu status 200). Returnezi codul HTTP corect.
- Toate listele au paginare. Fără endpoint care returnează un număr nelimitat de rânduri.
- Răspunsurile au formă consistentă — același endpoint returnează același shape indiferent de path.
- Niciodată stack traces, erori interne sau detalii de implementare în răspunsul trimis clientului.

## 6. Security headers și CORS

- Security headers configurate în `next.config.ts` pe toate rutele: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy`.
- CORS: niciodată `Access-Control-Allow-Origin: *` pe endpoint-uri autentificate. Folosești allowlist explicit.
- Dacă adaugi o resursă externă nouă (CDN, font, iframe, API), actualizezi CSP în același commit — nu după.

## 7. Rate limiting

- Endpoint-urile de autentificare (login, register, reset-parolă) au rate limiting.
- Orice endpoint care trimite email are limită per IP și per adresă de email.
- Depășirea limitei returnează `429` cu header `Retry-After`.

## 8. Plăți (Stripe)

- Verificare semnătură webhook pe fiecare request înainte de procesare. Niciun event neautentificat nu modifică baza de date.
- Body-ul requestului webhook se citește ca text raw (`request.text()`) înainte de orice altă operație. Parsarea JSON vine **după** verificarea semnăturii.
- Procesare idempotentă: același event Stripe procesat de două ori nu dublează efectele.
- Niciodată prețul, planul sau statusul abonamentului citit din request-ul clientului. Sursa de adevăr este Supabase, actualizată exclusiv de webhook.
- Signing secret (`whsec_...`) per endpoint webhook — nu reutilizezi același secret pentru endpoint-uri diferite.
- Nu stochezi numere de card, CVV sau date de plată complete — Stripe gestionează asta.

## 9. Cod curat

- O funcție = un singur scop.
- Ținta: sub 30 linii per funcție. Peste 40 linii = semnal clar că trebuie divizată.
- Nesting maxim 3 nivele — aplatizezi cu early returns.
- Fără magic numbers sau magic strings. Constantele au nume descriptive: `const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024`, nu `if (size > 10485760)`.
- Fără dead code — cod comentat, funcții nefolosite, importuri inutile. Ștergi, nu comentezi.
- Variabile cu nume descriptive. `userData` spune mai puțin decât `creatorProfile`.

## 10. TypeScript

- `strict: true` activ în `tsconfig.json` — nu îl modifici.
- Fără `any` explicit. ESLint îl marchează ca warning — tratează warning-urile ca erori în code review.
- Fără non-null assertion operator (`x!` sau `x!.prop`). Folosești optional chaining (`?.`) și nullish coalescing (`??`).
- Tipuri explicite pe toate funcțiile publice și exportate.
- `zod` este instalat — pentru validare și inferența tipurilor din schemele de validare.

## 11. React / Next.js (App Router)

- Server Components sunt default în App Router. Adaugi `"use client"` numai când e strict necesar (hooks, event listeners, browser APIs).
- Niciodată fetch de date în Client Component dacă se poate face în Server Component.
- `key` în liste: stabil, unic, din baza de date — niciodată index array.
- `useEffect` cu subscripții sau timere returnează cleanup function.
- Imagini: `next/image` cu dimensiuni explicite (`width`, `height` sau `fill`). Niciodată `<img>` fără `next/image` pentru imagini din aplicație.
- Navigare internă: `next/link`. Niciodată `<a href>` pentru rute interne.
- `loading.tsx` și `error.tsx` pentru orice segment cu fetch de date async.

## 12. Performanță

- Niciodată `SELECT *` — selectezi doar coloanele necesare.
- Niciodată query fără `LIMIT` pe tabele cu volum.
- N+1 queries rezolvate cu batch sau join — niciodată fetch în loop.
- Imagini în formate moderne (WebP/AVIF configurate în `next.config.ts`).
- Pachete noi > 50KB verificate dacă există alternativă nativă sau mai mică.
- Componente grele (editoare, charts, modals complexe) importate cu `dynamic()` și `ssr: false` dacă nu sunt necesare la prima randare.

## 13. Accesibilitate WCAG 2.1 AA

- `alt` pe orice `<img>`. Imagini decorative: `alt=""`.
- `<label>` asociat oricărui `<input>` prin `htmlFor`/`id`.
- Navigare completă prin tastatură — testezi Tab, Enter, Space, Escape pe toate elementele interactive.
- Contrast minim 4.5:1 pentru text normal, 3:1 pentru text mare (≥18px bold sau ≥24px normal).
- Fără `outline: none` fără alternativă vizibilă de focus.
- HTML semantic: `<button>` pentru acțiuni, `<a>` pentru navigare, `<nav>`, `<main>`, `<header>`, `<footer>`. Niciodată `<div onClick>` sau `<span onClick>` fără `role` și `tabIndex`.
- Mesajele de eroare din formulare asociate cu câmpul prin `aria-describedby`.

## 14. Gestionarea erorilor

- Niciodată stack traces sau detalii interne în răspunsul API — clientul vede mesaj generic, serverul loghează detaliile.
- `catch {}` gol interzis. Fiecare eroare prinsă este logată, aruncată mai departe sau tratată explicit.
- Erorile de la Supabase (`.error` din response) se verifică după fiecare operație critică — nu ignori `.error`.
- API routes au try/catch în jurul întregii funcții handler — returnezi întotdeauna un răspuns, inclusiv în cazuri neașteptate.

## 15. Logging

- Niciodată parole, tokeni, numere de card sau date personale complete în logs.
- JSON structurat în producție: `{ level, message, timestamp, context }`.
- Niveluri: `debug` (dev only), `info` (evenimente normale), `warn` (situații recuperabile), `error` (erori reale).
- Nu logi body-ul complet al requesturilor Stripe — pot conține date sensibile.

## 16. Dependențe

- `package-lock.json` commituit întotdeauna — nu îl adaugi în `.gitignore`.
- `npm audit --audit-level=high` înainte de fiecare release. Vulnerabilități HIGH sau CRITICAL se remediază înainte de deploy.
- Nu adaugi dependențe noi fără să verifici dacă există o alternativă nativă sau cu bibliotecile deja instalate.
- Lock files commituite. `npm ci` în CI/CD, nu `npm install`.

## 17. Git și review

- Commit-uri atomice: un commit = o schimbare logică. Nu amesteci refactoring cu bugfix cu feature în același commit.
- Mesaje de commit în prezent imperativ: `Fix webhook signature mismatch`, nu `fixed webhook`.
- `force-push` pe `main` interzis.
- PR-uri maxim 400 linii modificate. Dacă depășești, împarți.
- **Înainte de orice push: `git status` — verifici că nu apare niciun fișier `.env`.**

## 18. SSRF

- Dacă aplicația face fetch la URL-uri furnizate de utilizatori: blochezi IP-uri private (10.x, 172.16-31.x, 192.168.x, 127.x, ::1) și metadata cloud (169.254.169.254).
- Permiți doar schemele `http://` și `https://`.
- Rezolvi hostname-ul și verifici IP-ul înainte de request.

## 19. Testare

- Testezi comportament observabil, nu implementare internă.
- Teste deterministe — fără date random sau timp real fără mock.
- Testezi și error paths, nu doar happy path.
- Un test care eșuează = bug real. Nu îl comentezi sau skip-uiești.

## 20. Documentație și comentarii

- Comentariile explică **DE CE**, niciodată **CE** face codul. Codul bine scris explică singur ce face.
- Fără `TODO` în cod de producție — creezi ticket. Un TODO fără ticket nu există.
- Fără docstrings pentru cod auto-explicativ.

## 21. Environments

- `.env.local` pentru development — niciodată commituit.
- Producția folosește variabile setate în **Vercel Dashboard** — niciodată fișiere `.env` pe server.
- `.env.example` commituit cu placeholder-e — oricine clonează repo-ul știe ce variabile să configureze.

## 22. Când nu ești sigur

Dacă nu ești sigur de implementarea corectă pentru autentificare, plăți sau baza de date — **OPREȘTI și întrebi**. Nu improvizezi în aceste zone. Plauzibil nu înseamnă corect. O greșeală în autentificare sau webhook-uri Stripe poate afecta toți userii platformei.
