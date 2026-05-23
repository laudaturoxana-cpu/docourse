import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(50),
  creatorId: z.string().uuid(),
});

interface Coupon {
  id: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Cod invalid" }, { status: 400 });
  }

  const { code, creatorId } = parsed.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, discount_type, discount_value, max_uses, uses_count, valid_from, valid_until, active")
    .eq("code", code.toUpperCase())
    .eq("creator_id", creatorId)
    .maybeSingle() as { data: Coupon | null };

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Codul nu este valid" }, { status: 404 });
  }

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return NextResponse.json({ error: "Codul nu este activ încă" }, { status: 400 });
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json({ error: "Codul a expirat" }, { status: 400 });
  }
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ error: "Codul a atins limita de utilizări" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    coupon_id: coupon.id,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
  });
}
