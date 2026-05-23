-- Coupon / discount code system
-- Supports percentage and fixed-amount discounts
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code            text NOT NULL,
  discount_type   text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  numeric NOT NULL CHECK (discount_value > 0),
  max_uses        integer,            -- null = unlimited
  uses_count      integer NOT NULL DEFAULT 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_creator ON coupons (creator_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code    ON coupons (code);

-- Track which user used which coupon
CREATE TABLE IF NOT EXISTS coupon_uses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id)           -- one use per user per coupon
);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- Creators manage their own coupons
CREATE POLICY "Creators manage own coupons"
  ON coupons FOR ALL
  USING (auth.uid() = creator_id);

-- Anyone can read active coupons (needed for validation at checkout)
CREATE POLICY "Anyone can validate coupons"
  ON coupons FOR SELECT
  USING (active = true);

-- Users see their own coupon uses
CREATE POLICY "Users see own coupon uses"
  ON coupon_uses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own coupon uses"
  ON coupon_uses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
