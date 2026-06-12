import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Statuses Stripe care înseamnă "nu a plătit"
const INACTIVE_STATUSES = ["past_due", "unpaid", "canceled", "incomplete_expired"];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const secret = process.env.ADMIN_SYNC_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Config missing" }, { status: 500 });
  }

  if (!stripeKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not set — sync requires Stripe API access" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const results = { deactivated: 0, alreadyInactive: 0, notFound: 0, errors: 0 };

  // Fetch toate subscripțiile cu status problematic din Stripe (paginate)
  for (const status of INACTIVE_STATUSES) {
    let hasMore = true;
    let startingAfter: string | null = null;

    while (hasMore) {
      const url = new URL("https://api.stripe.com/v1/subscriptions");
      url.searchParams.set("status", status);
      url.searchParams.set("limit", "100");
      if (startingAfter) url.searchParams.set("starting_after", startingAfter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const data = await res.json();

      if (!data.data) break;

      for (const sub of data.data) {
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) continue;

        // Caută profilul după stripe_customer_id
        let profile = null;
        const { data: byId } = await supabase
          .from("profiles")
          .select("user_id, email, subscription_active")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        profile = byId;

        // Fallback: caută după email din Stripe
        if (!profile) {
          const custRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${stripeKey}` },
          });
          const customer = await custRes.json();
          if (customer.email) {
            const { data: byEmail } = await supabase
              .from("profiles")
              .select("user_id, email, subscription_active")
              .eq("email", customer.email.toLowerCase())
              .maybeSingle();
            profile = byEmail;
            // Salvăm stripe_customer_id pentru viitor
            if (profile) {
              await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("user_id", profile.user_id);
            }
          }
        }

        if (!profile) {
          results.notFound++;
          continue;
        }

        if (!profile.subscription_active) {
          results.alreadyInactive++;
          continue;
        }

        const { error } = await supabase
          .from("profiles")
          .update({ subscription_active: false })
          .eq("user_id", profile.user_id);

        if (error) {
          results.errors++;
        } else {
          results.deactivated++;
          console.log(`Sync deactivated: ${profile.email} (status: ${status})`);
        }
      }

      hasMore = data.has_more;
      if (hasMore && data.data.length > 0) {
        startingAfter = data.data[data.data.length - 1].id;
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
