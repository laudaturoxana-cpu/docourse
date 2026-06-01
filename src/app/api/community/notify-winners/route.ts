import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  communityId: z.string().uuid(),
  bookingUrl: z.string().url("URL invalid — verifică linkul Calendly"),
  communityName: z.string().min(1),
  rewardText: z.string().min(1),
});

interface WinnerRow {
  user_id: string;
  full_name: string;
  points: number;
}

interface ProfileRow {
  user_id: string;
  full_name: string;
  email: string | null;
}

function buildWinnerEmail(params: {
  winnerName: string;
  rank: number;
  communityName: string;
  rewardText: string;
  bookingUrl: string;
  points: number;
}): { html: string; text: string } {
  const medal = ["🥇", "🥈", "🥉"][params.rank - 1];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', sans-serif; background: #f9f9f9; margin: 0; padding: 32px 16px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a2f4e 0%, #0f1d30 100%); padding: 32px; text-align: center;">
      <p style="font-size: 48px; margin: 0;">${medal}</p>
      <h1 style="color: #f5c842; font-size: 22px; margin: 12px 0 4px;">Felicitări, ${params.winnerName}!</h1>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">Ești în Top 3 în ${params.communityName}</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Ai terminat luna aceasta pe locul <strong>${params.rank}</strong> cu <strong>${params.points} puncte</strong>.
        Ca recunoaștere, câștigați:
      </p>
      <div style="background: #fffbeb; border: 1px solid #f5c842; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #92620e; font-weight: 600; font-size: 15px;">🎁 ${params.rewardText}</p>
      </div>
      <a href="${params.bookingUrl}"
         style="display: block; background: #f5c842; color: #1a2f4e; text-decoration: none; text-align: center;
                font-weight: 700; font-size: 16px; padding: 14px 24px; border-radius: 10px; margin: 24px 0;">
        Rezervă-ți ședința →
      </a>
      <p style="color: #888; font-size: 13px; text-align: center;">
        Continuă să postezi și să comentezi în comunitate pentru a rămâne în top luna viitoare!
      </p>
    </div>
    <div style="background: #f5f5f5; padding: 16px; text-align: center;">
      <p style="color: #aaa; font-size: 12px; margin: 0;">
        Comunitate pe <a href="https://docourse.ro" style="color: #f5c842;">DoCourse</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Felicitări ${params.winnerName}!\n\nEști pe locul ${params.rank} în ${params.communityName} cu ${params.points} puncte.\n\nPremiul tău: ${params.rewardText}\n\nRezervă-ți ședința: ${params.bookingUrl}`;

  return { html, text };
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  }

  // Verify authenticated user
  const userSupabase = await createServerClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate body
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? (err as z.ZodError).issues[0]?.message : "Date invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { communityId, bookingUrl, communityName, rewardText } = body;

  // Verify user is the creator of this community
  const { data: community } = await userSupabase
    .from("creator_communities")
    .select("id")
    .eq("id", communityId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!community) {
    return NextResponse.json({ error: "Nu ești creatorul acestei comunități" }, { status: 403 });
  }

  // Use service role to get winners + emails
  const admin = createClient(supabaseUrl, serviceKey);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: winners, error: winnersError } = await (admin.rpc as any)(
    "get_monthly_leaderboard",
    { _plan_id: communityId, _limit: 3 }
  );

  if (winnersError || !winners || winners.length === 0) {
    return NextResponse.json({ error: "Nu există câștigători luna aceasta" }, { status: 400 });
  }

  const winnerIds = (winners as WinnerRow[]).map((w) => w.user_id);

  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, full_name, email")
    .in("user_id", winnerIds);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "Nu s-au găsit profilurile câștigătorilor" }, { status: 500 });
  }

  // Save booking_url for next time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.rpc as any)("set_community_monthly_reward", {
    _plan_id: communityId,
    _reward_text: rewardText,
    _booking_url: bookingUrl,
  }).catch(() => null);

  if (!resendKey) {
    return NextResponse.json({ error: "Email service neconfigurat (RESEND_API_KEY)" }, { status: 500 });
  }

  const sent: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < (winners as WinnerRow[]).length; i++) {
    const winner = (winners as WinnerRow[])[i];
    const profile = (profiles as ProfileRow[]).find((p) => p.user_id === winner.user_id);
    const email = profile?.email;

    if (!email) { failed.push(winner.full_name); continue; }

    const { html, text } = buildWinnerEmail({
      winnerName: profile.full_name || "Câștigător",
      rank: i + 1,
      communityName,
      rewardText,
      bookingUrl,
      points: winner.points,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "DoCourse <noreply@docourse.ro>",
        to: [email],
        subject: `🏆 Ai câștigat! Ești în Top 3 în ${communityName}`,
        html,
        text,
      }),
    });

    if (res.ok) {
      sent.push(winner.full_name);
    } else {
      failed.push(winner.full_name);
    }
  }

  return NextResponse.json({ sent, failed });
}
