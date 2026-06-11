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
        const planType = session.metadata?.plan_type || "starter";
        const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
        const userId = session.client_reference_id || null;
        // Preferăm lookup după userId (client_reference_id) — mai sigur decât email
        if (userId) {
          await activateByUserId(supabase, userId, planType, stripeCustomerId);
        } else if (email) {
          await activateByEmail(supabase, email, planType, stripeCustomerId);
        }
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const email = invoice.customer_email;
        if (!email) break;
        const planType =
          invoice.subscription_details?.metadata?.plan_type ||
          invoice.lines?.data?.[0]?.price?.metadata?.plan_type ||
          "starter";
        const invoiceCustomerId = typeof invoice.customer === "string" ? invoice.customer : null;
        await activateByEmail(supabase, email, planType, invoiceCustomerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const email = invoice.customer_email;
        if (email) {
          await deactivateByEmail(supabase, email);
          await sendPaymentFailedEmail(email);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        if (customerId) {
          const deactivatedEmail = await deactivateByCustomerId(supabase, customerId);
          if (deactivatedEmail) await sendSubscriptionCancelledEmail(deactivatedEmail);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const status = subscription.status;
        const customerId = subscription.customer;
        // Trial canceled → cancel_at_period_end:true while still trialing
        // means Stripe won't charge but the user has canceled — deactivate immediately
        if (subscription.cancel_at_period_end && status === "trialing") {
          await deactivateByCustomerId(supabase, customerId);
        } else if (["canceled", "unpaid", "past_due"].includes(status)) {
          await deactivateByCustomerId(supabase, customerId);
        } else if (status === "active" && !subscription.cancel_at_period_end) {
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
async function activateByUserId(supabase: any, userId: string, planType: string, stripeCustomerId: string | null) {
  const update: Record<string, unknown> = { subscription_active: true, plan_type: planType };
  if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId;
  await supabase.from("profiles").update(update).eq("user_id", userId);
  console.log(`Activated userId=${userId}, plan=${planType}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function activateByEmail(supabase: any, email: string, planType: string, stripeCustomerId: string | null = null) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile) {
    console.log(`No profile for ${email}`);
    return;
  }

  const update: Record<string, unknown> = { subscription_active: true, plan_type: planType };
  if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId;
  await supabase.from("profiles").update(update).eq("user_id", profile.user_id);
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
async function deactivateByCustomerId(supabase: any, customerId: string): Promise<string | null> {
  let profile = null;

  // Caută după stripe_customer_id
  const { data: byId } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  profile = byId;

  // Fallback: caută email-ul clientului direct din Stripe și deactivează după email
  if (!profile) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const customer = await res.json();
      const email = customer.email;
      if (email) {
        const { data: byEmail } = await supabase
          .from("profiles")
          .select("user_id, email")
          .eq("email", email.toLowerCase())
          .maybeSingle();
        profile = byEmail;
        // Salvăm stripe_customer_id pentru data viitoare
        if (profile) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("user_id", profile.user_id);
        }
      }
    }
  }

  if (!profile) {
    console.log(`No profile for customer ${customerId}`);
    return null;
  }

  await supabase
    .from("profiles")
    .update({ subscription_active: false })
    .eq("user_id", profile.user_id);

  console.log(`Deactivated customer ${customerId} (${profile.email})`);
  return profile.email ?? null;
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

async function sendPaymentFailedEmail(email: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: "DoCourse <noreply@docourse.ro>",
      to: email,
      subject: "Plata nu a putut fi procesată — contul tău DoCourse a fost suspendat",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a2332">
          <img src="https://docourse.ro/logo.svg" alt="DoCourse" style="height:36px;margin-bottom:24px" />
          <h2 style="margin:0 0 16px">Plata nu a putut fi procesată</h2>
          <p>Bună,</p>
          <p>Din păcate, ultima plată pentru abonamentul DoCourse nu a putut fi procesată și contul tău a fost suspendat temporar.</p>
          <p style="background:#fef9ec;border-left:4px solid #d4a017;padding:12px 16px;border-radius:4px">
            <strong>Toate cursurile, studenții și datele tale sunt în siguranță</strong> — nu se șterge nimic.
            Contul se reactivează imediat după ce plata este rezolvată.
          </p>
          <p>Pentru a relua accesul, actualizează metoda de plată:</p>
          <a href="https://docourse.ro/subscription-required"
             style="display:inline-block;background:#d4a017;color:#0a192f;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin:8px 0 24px">
            Reactivează abonamentul
          </a>
          <p style="color:#5a6a7a;font-size:13px">Dacă ai întrebări, răspunde la acest email sau scrie la <a href="mailto:contact@docourse.ro">contact@docourse.ro</a>.</p>
          <p style="color:#5a6a7a;font-size:13px">Echipa DoCourse</p>
        </div>
      `,
    }),
  });
}

async function sendSubscriptionCancelledEmail(email: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({
      from: "DoCourse <noreply@docourse.ro>",
      to: email,
      subject: "Abonamentul tău DoCourse a fost anulat",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a2332">
          <img src="https://docourse.ro/logo.svg" alt="DoCourse" style="height:36px;margin-bottom:24px" />
          <h2 style="margin:0 0 16px">Abonamentul tău a fost anulat</h2>
          <p>Bună,</p>
          <p>Abonamentul tău DoCourse a fost anulat și accesul la platformă a fost suspendat.</p>
          <p style="background:#fef9ec;border-left:4px solid #d4a017;padding:12px 16px;border-radius:4px">
            <strong>Cursurile, studenții și toate datele tale sunt păstrate</strong> — nu se șterge nimic.
            Poți reveni oricând și vei găsi totul exact cum l-ai lăsat.
          </p>
          <p>Dacă te-ai răzgândit sau anularea a fost o greșeală, te poți reabona oricând:</p>
          <a href="https://docourse.ro/pricing"
             style="display:inline-block;background:#d4a017;color:#0a192f;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin:8px 0 24px">
            Reactivează contul
          </a>
          <p style="color:#5a6a7a;font-size:13px">Ai întrebări? Scrie la <a href="mailto:contact@docourse.ro">contact@docourse.ro</a> — suntem aici.</p>
          <p style="color:#5a6a7a;font-size:13px">Echipa DoCourse</p>
        </div>
      `,
    }),
  });
}
