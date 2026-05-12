import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const HOME_MARKDOWN = `# DoCourse — Platformă cursuri online România

> Platforma românească pentru creatori de cursuri online. Simplu, rapid, profesionist.

DoCourse este un SaaS pentru creatorii din România care vor să publice și să vândă cursuri online,
să construiască comunități și să ofere acces controlat la conținut — totul de la 9€/lună.

## Funcționalități principale

- Creare și publicare cursuri video, PDF, audio
- Hosting video securizat inclus — fără Vimeo sau YouTube extern
- Acces controlat pentru cursanți prin link sau cont
- Comunitate online integrată
- Sales page generat cu AI (Gemini) — plan Pro
- Email marketing și funneluri de vânzare — plan Pro
- Certificat de absolvire automatizat
- Domeniu propriu (white label)

## Prețuri

- **Starter**: 9€/lună — cursuri, comunitate, hosting video, certificat
- **Pro**: 19€/lună — Starter + sales page AI, Stripe, email marketing, funneluri

## Publicul țintă

Creatori de cursuri din România: coachi, traineri, psihologi, profesori, consultanți.

## Pagini utile

- [Prezentare](https://docourse.ro)
- [Prețuri](https://docourse.ro/pricing)
- [Cum să creezi un curs online](https://docourse.ro/cum-sa-creezi-un-curs-online)
- [Blog](https://docourse.ro/blog)
- [Contact](https://docourse.ro/contact)
`;

export async function middleware(request: NextRequest) {
  // Markdown for Agents (RFC agent-readiness) — returnează markdown când agentul cere text/markdown
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/markdown") && request.nextUrl.pathname === "/") {
    return new NextResponse(HOME_MARKDOWN, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — keeps auth token alive on every request
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
