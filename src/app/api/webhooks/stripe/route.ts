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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function isAlreadyProcessed(supabase: any, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from("processed_stripe_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  return !!data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function markAsProcessed(supabase: any, eventId: string, eventType: string): Promise<void> {
  await supabase
    .from("processed_stripe_events")
    .insert({ event_id: eventId, event_type: eventType });
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
  console.log("Stripe event:", event.type, event.id);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Idempotency: skip duplicate events
  if (await isAlreadyProcessed(supabase, event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }

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
        // subscription_details.metadata e setat la creare și persiste pe toată durata
        // price.metadata e gol dacă nu a fost setat explicit în Stripe dashboard
        const planType =
          invoice.subscription_details?.metadata?.plan_type ||
          invoice.lines?.data?.[0]?.price?.metadata?.plan_type ||
          "starter";
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

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const email = subscription.customer_email || subscription.metadata?.customer_email;
        if (email) await deactivateByEmail(supabase, email);
        else {
          // Look up email by stripe_customer_id
          const customerId = subscription.customer;
          if (customerId) await deactivateByCustomerId(supabase, customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const status = subscription.status;
        const customerId = subscription.customer;
        if (["canceled", "unpaid", "past_due"].includes(status)) {
          await deactivateByCustomerId(supabase, customerId);
        } else if (status === "active") {
          const planType = subscription.metadata?.plan_type || "starter";
          await activateByCustomerId(supabase, customerId, planType);
        }
        break;
      }
    }

    await markAsProcessed(supabase, event.id, event.type);
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
    .select("user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile) {
    console.log(`No profile for ${email}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: true, plan_type: planType })
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
    .update({ subscription_active: false })
    .eq("user_id", profile.user_id);

  console.log(`Deactivated ${email}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deactivateByCustomerId(supabase: any, customerId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.log(`No profile for customer ${customerId}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: false })
    .eq("user_id", profile.user_id);

  console.log(`Deactivated customer ${customerId} (${profile.email})`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function activateByCustomerId(supabase: any, customerId: string, planType: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    console.log(`No profile for customer ${customerId}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: true, plan_type: planType })
    .eq("user_id", profile.user_id);

  console.log(`Activated customer ${customerId} (${profile.email}), plan=${planType}`);
}
