-- Migration 006: Community Gamification (points + levels + leaderboard)

CREATE TABLE IF NOT EXISTS community_member_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_plan_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, membership_plan_id)
);

CREATE INDEX IF NOT EXISTS idx_community_member_points_plan ON community_member_points (membership_plan_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_community_member_points_user ON community_member_points (user_id);

-- RLS: users see all leaderboard entries for communities they belong to;
-- updates only via SECURITY DEFINER functions
ALTER TABLE community_member_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_points_select" ON community_member_points
  FOR SELECT USING (true);

CREATE POLICY "community_points_no_direct_write" ON community_member_points
  FOR ALL USING (false);

-- Atomic upsert to add points (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION award_community_points(
  p_user_id UUID,
  p_membership_plan_id UUID,
  p_points INTEGER
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO community_member_points (user_id, membership_plan_id, points)
  VALUES (p_user_id, p_membership_plan_id, p_points)
  ON CONFLICT (user_id, membership_plan_id)
  DO UPDATE SET
    points = community_member_points.points + p_points,
    updated_at = NOW();
END;
$$;

-- Trigger: +10 points when user creates a post
CREATE OR REPLACE FUNCTION trg_award_post_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM award_community_points(NEW.author_id, NEW.membership_plan_id, 10);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_points_on_post ON community_posts;
CREATE TRIGGER award_points_on_post
  AFTER INSERT ON community_posts
  FOR EACH ROW EXECUTE FUNCTION trg_award_post_points();

-- Trigger: +5 points when user creates a comment
CREATE OR REPLACE FUNCTION trg_award_comment_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  SELECT membership_plan_id INTO v_plan_id
  FROM community_posts
  WHERE id = NEW.post_id;

  IF v_plan_id IS NOT NULL THEN
    PERFORM award_community_points(NEW.author_id, v_plan_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_points_on_comment ON community_comments;
CREATE TRIGGER award_points_on_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW EXECUTE FUNCTION trg_award_comment_points();

-- RPC: leaderboard for a community plan
-- Returns top members ordered by points with level 1-5
CREATE OR REPLACE FUNCTION get_community_leaderboard(
  _plan_id UUID,
  _limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  points INTEGER,
  level INTEGER,
  level_name TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    cmp.user_id,
    COALESCE(p.full_name, 'User') AS full_name,
    p.avatar_url,
    cmp.points,
    CASE
      WHEN cmp.points >= 1000 THEN 5
      WHEN cmp.points >= 400  THEN 4
      WHEN cmp.points >= 150  THEN 3
      WHEN cmp.points >= 40   THEN 2
      ELSE 1
    END AS level,
    CASE
      WHEN cmp.points >= 1000 THEN 'Legendă'
      WHEN cmp.points >= 400  THEN 'Expert'
      WHEN cmp.points >= 150  THEN 'Veteran'
      WHEN cmp.points >= 40   THEN 'Activ'
      ELSE 'Începător'
    END AS level_name
  FROM community_member_points cmp
  LEFT JOIN profiles p ON p.user_id = cmp.user_id
  WHERE cmp.membership_plan_id = _plan_id
  ORDER BY cmp.points DESC
  LIMIT _limit;
END;
$$;

-- RPC: get current user's points and level in a community
CREATE OR REPLACE FUNCTION get_my_community_points(_plan_id UUID)
RETURNS TABLE (points INTEGER, level INTEGER, level_name TEXT, rank BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      cmp.user_id,
      cmp.points,
      CASE
        WHEN cmp.points >= 1000 THEN 5
        WHEN cmp.points >= 400  THEN 4
        WHEN cmp.points >= 150  THEN 3
        WHEN cmp.points >= 40   THEN 2
        ELSE 1
      END AS level,
      CASE
        WHEN cmp.points >= 1000 THEN 'Legendă'
        WHEN cmp.points >= 400  THEN 'Expert'
        WHEN cmp.points >= 150  THEN 'Veteran'
        WHEN cmp.points >= 40   THEN 'Activ'
        ELSE 'Începător'
      END AS level_name,
      ROW_NUMBER() OVER (ORDER BY cmp.points DESC) AS rank
    FROM community_member_points cmp
    WHERE cmp.membership_plan_id = _plan_id
  )
  SELECT r.points, r.level, r.level_name, r.rank
  FROM ranked r
  WHERE r.user_id = auth.uid();
END;
$$;
