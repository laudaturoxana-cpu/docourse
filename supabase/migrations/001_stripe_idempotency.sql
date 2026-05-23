-- Stripe webhook idempotency
-- Prevents duplicate processing when Stripe retries events
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     text NOT NULL UNIQUE,
  event_type   text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by event_id
CREATE INDEX IF NOT EXISTS idx_processed_stripe_events_event_id
  ON processed_stripe_events (event_id);

-- Auto-delete events older than 30 days (Stripe retries stop after 3 days)
CREATE OR REPLACE FUNCTION delete_old_stripe_events() RETURNS void AS $$
BEGIN
  DELETE FROM processed_stripe_events
  WHERE processed_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- RLS: table is service-role only, no public access
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies = deny all for anon/authenticated roles (service role bypasses RLS)
