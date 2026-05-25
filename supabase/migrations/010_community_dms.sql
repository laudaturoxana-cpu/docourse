-- Migration 010: Direct Messages between community members

CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_plan_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages (recipient_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages (membership_plan_id, sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_plan_user ON direct_messages (membership_plan_id, LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id), created_at DESC);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages they sent or received
CREATE POLICY "dm_select_participant" ON direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "dm_insert_as_sender" ON direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Only recipient can mark as read
CREATE POLICY "dm_update_read" ON direct_messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- RPC: get conversation between two users in a community (paginated)
CREATE OR REPLACE FUNCTION get_dm_conversation(
  _plan_id UUID,
  _other_user_id UUID,
  _limit INTEGER DEFAULT 50,
  _before TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_name TEXT,
  sender_avatar TEXT,
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Mark messages from the other user as read
  UPDATE direct_messages
  SET read = TRUE
  WHERE membership_plan_id = _plan_id
    AND sender_id = _other_user_id
    AND recipient_id = auth.uid()
    AND read = FALSE;

  RETURN QUERY
  SELECT
    dm.id,
    dm.sender_id,
    COALESCE(p.full_name, 'User') AS sender_name,
    p.avatar_url AS sender_avatar,
    dm.content,
    dm.read,
    dm.created_at
  FROM direct_messages dm
  LEFT JOIN profiles p ON p.user_id = dm.sender_id
  WHERE dm.membership_plan_id = _plan_id
    AND (
      (dm.sender_id = auth.uid() AND dm.recipient_id = _other_user_id)
      OR
      (dm.sender_id = _other_user_id AND dm.recipient_id = auth.uid())
    )
    AND dm.created_at < _before
  ORDER BY dm.created_at DESC
  LIMIT _limit;
END;
$$;

-- RPC: send a DM
CREATE OR REPLACE FUNCTION send_direct_message(
  _plan_id UUID,
  _recipient_id UUID,
  _content TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO direct_messages (membership_plan_id, sender_id, recipient_id, content)
  VALUES (_plan_id, auth.uid(), _recipient_id, _content)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- RPC: get DM inbox — list of unique conversations with last message
CREATE OR REPLACE FUNCTION get_dm_inbox(_plan_id UUID)
RETURNS TABLE (
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH conversations AS (
    SELECT
      CASE WHEN dm.sender_id = auth.uid() THEN dm.recipient_id ELSE dm.sender_id END AS partner_id,
      dm.content,
      dm.created_at,
      dm.read,
      dm.recipient_id,
      ROW_NUMBER() OVER (
        PARTITION BY LEAST(dm.sender_id, dm.recipient_id), GREATEST(dm.sender_id, dm.recipient_id)
        ORDER BY dm.created_at DESC
      ) AS rn
    FROM direct_messages dm
    WHERE dm.membership_plan_id = _plan_id
      AND (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
  )
  SELECT
    c.partner_id AS other_user_id,
    COALESCE(p.full_name, 'User') AS other_user_name,
    p.avatar_url AS other_user_avatar,
    c.content AS last_message,
    c.created_at AS last_message_at,
    COUNT(*) FILTER (WHERE c.rn > 0 AND c.recipient_id = auth.uid() AND NOT c.read) AS unread_count
  FROM conversations c
  LEFT JOIN profiles p ON p.user_id = c.partner_id
  WHERE c.rn = 1
  GROUP BY c.partner_id, p.full_name, p.avatar_url, c.content, c.created_at
  ORDER BY c.created_at DESC;
END;
$$;

-- RPC: total unread DM count for current user across all communities
CREATE OR REPLACE FUNCTION get_unread_dm_count(_plan_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM direct_messages
  WHERE membership_plan_id = _plan_id
    AND recipient_id = auth.uid()
    AND read = FALSE;
  RETURN COALESCE(v_count, 0);
END;
$$;
