import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function verifyStripeSignature(body: string, signature: string, secret: string): boolean {
  const parts: Record<string, string> = {};
  for (const part of signature.split(",")) {
    const [k, v] = part.split("=");
    parts[k] = v;
  }
  if (!parts.t || !parts.v1) return false;
  const signed = `${parts.t}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = verifyStripeSignature(body, signature, webhookSecret);
  } catch {
    valid = false;
  }

  if (!valid) {
    console.error("Invalid Stripe signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Stripe event:", event.type);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;
        if (session.metadata?.membership_plan_id) break;
        const email = session.customer_email || session.customer_details?.email;
        if (!email) break;
        const planType = session.metadata?.plan_type || "starter";
        await activateByEmail(supabase, email, planType);
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const email = invoice.customer_email;
        if (!email) break;
        const planType = invoice.lines?.data?.[0]?.price?.metadata?.plan_type || "starter";
        await activateByEmail(supabase, email, planType);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const email = invoice.customer_email;
        if (email) await deactivateByEmail(supabase, email);
        break;
      }
    }
  } catch (err) {
    console.error("Error processing event:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function activateByEmail(supabase: any, email: string, planType: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, subscription_active")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile) {
    console.log(`No profile for ${email}`);
    return;
  }

  if (profile.subscription_active === false) {
    console.log(`Manually canceled for ${email}, skipping`);
    return;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: true, plan_type: planType, stripe_status: "active" })
    .eq("user_id", profile.user_id);

  console.log(`Activated ${email}, plan=${planType}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deactivateByEmail(supabase: any, email: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile) return;

  await supabase
    .from("profiles")
    .update({ subscription_active: false, stripe_status: "canceled" })
    .eq("user_id", profile.user_id);

  console.log(`Deactivated ${email}`);
}
