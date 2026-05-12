import { NextResponse } from "next/server";

const SUPABASE_ISSUER = "https://eecfmmijezfrnqeewhhr.supabase.co/auth/v1";

const data = {
  resource: "https://docourse.ro",
  authorization_servers: [SUPABASE_ISSUER],
  scopes_supported: ["openid", "email", "profile"],
  bearer_methods_supported: ["header"],
  resource_signing_alg_values_supported: ["RS256"],
};

const body = JSON.stringify(data, null, 2);

export async function GET() {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
