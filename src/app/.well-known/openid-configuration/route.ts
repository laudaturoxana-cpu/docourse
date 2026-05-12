import { NextResponse } from "next/server";

const BASE = "https://eecfmmijezfrnqeewhhr.supabase.co";

const config = {
  issuer: `${BASE}/auth/v1`,
  authorization_endpoint: `${BASE}/auth/v1/authorize`,
  token_endpoint: `${BASE}/auth/v1/token`,
  jwks_uri: `${BASE}/auth/v1/.well-known/jwks.json`,
  userinfo_endpoint: `${BASE}/auth/v1/user`,
  scopes_supported: ["openid", "email", "profile"],
  response_types_supported: ["code"],
  grant_types_supported: ["authorization_code", "refresh_token", "implicit"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  claims_supported: ["sub", "email", "email_verified", "name", "picture"],
  code_challenge_methods_supported: ["S256"],
};

const body = JSON.stringify(config, null, 2);

export async function GET() {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
