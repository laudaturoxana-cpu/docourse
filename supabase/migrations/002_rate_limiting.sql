-- Rate limiting table
-- Tracks request counts per IP per endpoint per time window
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rate_limit_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip          text NOT NULL,
  endpoint    text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE (ip, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint
  ON rate_limit_requests (ip, endpoint, window_start);

-- Auto-delete entries older than 1 hour
CREATE OR REPLACE FUNCTION delete_old_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_requests
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- RLS: service-role only
ALTER TABLE rate_limit_requests ENABLE ROW LEVEL SECURITY;
