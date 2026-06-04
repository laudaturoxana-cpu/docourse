import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!supabaseUrl || !serviceKey || !stripeKey) {
      return NextResponse.json({ error: "Server config missing" }, { status: 500 });
    }

    const { sessionId, userId } = await req.json();
    if (!sessionId || !userId) {
      return NextResponse.json({ error: "sessionId and userId required" }, { status: 400 });
    }

    // Retrieve Stripe session to get plan_type and customer_id
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    const session = await stripeRes.json();

    if (session.error) {
      return NextResponse.json({ error: "Stripe session not found" }, { status: 400 });
    }

    const planType = session.metadata?.plan_type || "starter";
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

    const admin = createClient(supabaseUrl, serviceKey);
    const update: Record<string, unknown> = {
      subscription_active: true,
      plan_type: planType,
      role: "creator",
    };
    if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId;

    await admin.from("profiles").update(update).eq("user_id", userId);

    return NextResponse.json({ success: true, planType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
