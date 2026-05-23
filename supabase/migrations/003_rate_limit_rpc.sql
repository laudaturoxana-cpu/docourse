-- Atomic upsert function for rate limiting
-- Prevents race conditions when multiple requests come in simultaneously
-- Run this in Supabase SQL Editor AFTER migration 002

CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_ip text,
  p_endpoint text,
  p_window_start timestamptz
) RETURNS void AS $$
BEGIN
  INSERT INTO rate_limit_requests (ip, endpoint, window_start, request_count)
  VALUES (p_ip, p_endpoint, p_window_start, 1)
  ON CONFLICT (ip, endpoint, window_start)
  DO UPDATE SET request_count = rate_limit_requests.request_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
