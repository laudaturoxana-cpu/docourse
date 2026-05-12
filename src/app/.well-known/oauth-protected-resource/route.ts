import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const data = {
    resource: "https://docourse.ro",
    authorization_servers: supabaseUrl ? [`${supabaseUrl}/auth/v1`] : [],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
    resource_signing_alg_values_supported: ["RS256"],
  };

  return NextResponse.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
