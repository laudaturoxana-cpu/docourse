import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const LIMITS: Record<string, { max: number; windowMinutes: number }> = {
  "/api/auth/login":         { max: 5,  windowMinutes: 15 },
  "/api/auth/register":      { max: 3,  windowMinutes: 60 },
  "/api/auth/reset-password":{ max: 3,  windowMinutes: 60 },
  "/api/auth/resend":        { max: 3,  windowMinutes: 60 },
  "default":                 { max: 60, windowMinutes: 1  },
};

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function checkRateLimit(
  request: NextRequest,
  endpoint: string
): Promise<NextResponse | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;

  const limit = LIMITS[endpoint] ?? LIMITS["default"];
  const ip = getIp(request);
  const windowStart = new Date(
    Math.floor(Date.now() / (limit.windowMinutes * 60_000)) * (limit.windowMinutes * 60_000)
  ).toISOString();

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data } = await supabase
    .from("rate_limit_requests")
    .select("request_count")
    .eq("ip", ip)
    .eq("endpoint", endpoint)
    .eq("window_start", windowStart)
    .maybeSingle();

  const count = data?.request_count ?? 0;

  if (count >= limit.max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.windowMinutes * 60),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Upsert atomically
  await supabase.rpc("increment_rate_limit", {
    p_ip: ip,
    p_endpoint: endpoint,
    p_window_start: windowStart,
  });

  return null;
}
