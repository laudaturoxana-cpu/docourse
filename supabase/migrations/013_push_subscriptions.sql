-- Migration 013: Push notification subscriptions table

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL,
  endpoint     TEXT NOT NULL,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, community_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_community ON push_subscriptions (community_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_select_own" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "push_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_update_own" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "push_delete_own" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
