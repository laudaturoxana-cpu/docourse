import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  const issuer = `${supabaseUrl}/auth/v1`;

  const config = {
    issuer,
    authorization_endpoint: `${supabaseUrl}/auth/v1/authorize`,
    token_endpoint: `${supabaseUrl}/auth/v1/token`,
    jwks_uri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    userinfo_endpoint: `${supabaseUrl}/auth/v1/user`,
    scopes_supported: ["openid", "email", "profile"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token", "implicit"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    claims_supported: ["sub", "email", "email_verified", "name", "picture"],
    code_challenge_methods_supported: ["S256"],
  };

  return NextResponse.json(config, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
