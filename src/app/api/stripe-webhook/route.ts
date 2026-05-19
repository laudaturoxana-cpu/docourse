import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing env vars:", { webhookSecret: !!webhookSecret, supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Only used for signature verification — no API calls needed
  const stripe = new Stripe("sk_placeholder");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
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
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        // Skip membership invoices
        if ((invoice as any).lines?.data?.[0]?.metadata?.membership_plan_id) break;
        const email = invoice.customer_email;
        if (!email) break;
        const planType = (invoice as any).lines?.data?.[0]?.price?.metadata?.plan_type || "starter";
        await activateByEmail(supabase, email, planType);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!(invoice as any).subscription) break;
        const email = invoice.customer_email;
        if (email) await deactivateByEmail(supabase, email);
        break;
      }
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function activateByEmail(supabase: ReturnType<typeof createClient>, email: string, planType: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, subscription_active")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !profile) {
    console.log(`No profile for ${email}`);
    return;
  }

  if (profile.subscription_active === false) {
    console.log(`Subscription manually canceled for ${email}, skipping`);
    return;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: true, plan_type: planType, stripe_status: "active" })
    .eq("user_id", profile.user_id);

  console.log(`Activated ${email}, plan=${planType}`);
}

async function deactivateByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !profile) return;

  await supabase
    .from("profiles")
    .update({ subscription_active: false, stripe_status: "canceled" })
    .eq("user_id", profile.user_id);

  console.log(`Deactivated ${email}`);
}
