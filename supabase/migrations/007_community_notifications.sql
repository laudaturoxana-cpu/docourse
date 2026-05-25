-- Migration 007: Community Notifications (persistent bell notifications)

CREATE TYPE community_notification_type AS ENUM (
  'comment_on_post',
  'reply_to_comment',
  'post_liked',
  'mentioned',
  'new_post_in_community'
);

CREATE TABLE IF NOT EXISTS community_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_plan_id UUID NOT NULL,
  type community_notification_type NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  post_id UUID,
  comment_id UUID,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_notifs_user ON community_notifications (user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_notifs_plan ON community_notifications (membership_plan_id, created_at DESC);

ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "notifs_select_own" ON community_notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifs_update_own" ON community_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Only SECURITY DEFINER functions can insert
CREATE POLICY "notifs_no_direct_insert" ON community_notifications
  FOR INSERT WITH CHECK (false);

-- Trigger: notify post author when someone comments on their post
CREATE OR REPLACE FUNCTION trg_notify_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_post_author_id UUID;
  v_plan_id UUID;
  v_parent_author_id UUID;
BEGIN
  SELECT author_id, membership_plan_id INTO v_post_author_id, v_plan_id
  FROM community_posts
  WHERE id = NEW.post_id;

  -- Notify post author (not if commenting on own post)
  IF v_post_author_id IS NOT NULL AND v_post_author_id <> NEW.author_id THEN
    INSERT INTO community_notifications (user_id, membership_plan_id, type, from_user_id, post_id, comment_id)
    VALUES (v_post_author_id, v_plan_id, 'comment_on_post', NEW.author_id, NEW.post_id, NEW.id);
  END IF;

  -- Notify parent comment author on reply (if different from above)
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author_id
    FROM community_comments
    WHERE id = NEW.parent_comment_id;

    IF v_parent_author_id IS NOT NULL
       AND v_parent_author_id <> NEW.author_id
       AND v_parent_author_id <> v_post_author_id THEN
      INSERT INTO community_notifications (user_id, membership_plan_id, type, from_user_id, post_id, comment_id)
      VALUES (v_parent_author_id, v_plan_id, 'reply_to_comment', NEW.author_id, NEW.post_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_comment ON community_comments;
CREATE TRIGGER notify_on_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW EXECUTE FUNCTION trg_notify_on_comment();

-- Function to create a like notification (call this from toggle_post_like RPC or ad-hoc)
CREATE OR REPLACE FUNCTION create_post_like_notification(
  p_post_id UUID,
  p_liker_id UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_post_author_id UUID;
  v_plan_id UUID;
BEGIN
  SELECT author_id, membership_plan_id INTO v_post_author_id, v_plan_id
  FROM community_posts
  WHERE id = p_post_id;

  IF v_post_author_id IS NOT NULL AND v_post_author_id <> p_liker_id THEN
    -- Avoid duplicate like notifications (only one per liker per post)
    INSERT INTO community_notifications (user_id, membership_plan_id, type, from_user_id, post_id)
    VALUES (v_post_author_id, v_plan_id, 'post_liked', p_liker_id, p_post_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- RPC: get notifications for the current user in a community
CREATE OR REPLACE FUNCTION get_my_notifications(_plan_id UUID, _limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  type TEXT,
  from_user_name TEXT,
  from_user_avatar TEXT,
  post_id UUID,
  comment_id UUID,
  read BOOLEAN,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.type::TEXT,
    COALESCE(p.full_name, 'Cineva') AS from_user_name,
    p.avatar_url AS from_user_avatar,
    n.post_id,
    n.comment_id,
    n.read,
    n.created_at
  FROM community_notifications n
  LEFT JOIN profiles p ON p.user_id = n.from_user_id
  WHERE n.user_id = auth.uid()
    AND n.membership_plan_id = _plan_id
  ORDER BY n.created_at DESC
  LIMIT _limit;
END;
$$;

-- RPC: count unread notifications
CREATE OR REPLACE FUNCTION get_unread_notifications_count(_plan_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM community_notifications
  WHERE user_id = auth.uid()
    AND membership_plan_id = _plan_id
    AND read = FALSE;
  RETURN COALESCE(v_count, 0);
END;
$$;

-- RPC: mark all notifications as read for current user in a community
CREATE OR REPLACE FUNCTION mark_notifications_read(_plan_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE community_notifications
  SET read = TRUE
  WHERE user_id = auth.uid()
    AND membership_plan_id = _plan_id
    AND read = FALSE;
END;
$$;
