-- Migration 011: Gamification triggers for creator_community_posts and creator_community_comments
-- Uses community_id as the plan_id key (same award_community_points function)

CREATE OR REPLACE FUNCTION trg_award_creator_post_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM award_community_points(NEW.author_id, NEW.community_id, 10);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_points_on_creator_post ON creator_community_posts;
CREATE TRIGGER award_points_on_creator_post
  AFTER INSERT ON creator_community_posts
  FOR EACH ROW EXECUTE FUNCTION trg_award_creator_post_points();

CREATE OR REPLACE FUNCTION trg_award_creator_comment_points()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_community_id UUID;
BEGIN
  SELECT community_id INTO v_community_id
  FROM creator_community_posts
  WHERE id = NEW.post_id;

  IF v_community_id IS NOT NULL THEN
    PERFORM award_community_points(NEW.author_id, v_community_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_points_on_creator_comment ON creator_community_comments;
CREATE TRIGGER award_points_on_creator_comment
  AFTER INSERT ON creator_community_comments
  FOR EACH ROW EXECUTE FUNCTION trg_award_creator_comment_points();
