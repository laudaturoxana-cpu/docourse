-- Migration 009: Community Reactions + Polls

-- ── EMOJI REACTIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('❤️','🔥','👏','😂','🙌','💡','🎉','😮')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON community_post_reactions (post_id);

ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_select_all" ON community_post_reactions
  FOR SELECT USING (true);

CREATE POLICY "reactions_insert_own" ON community_post_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own" ON community_post_reactions
  FOR DELETE USING (user_id = auth.uid());

-- RPC: toggle a reaction on a post
CREATE OR REPLACE FUNCTION toggle_post_reaction(_post_id UUID, _emoji TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM community_post_reactions
    WHERE post_id = _post_id AND user_id = auth.uid() AND emoji = _emoji
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM community_post_reactions
    WHERE post_id = _post_id AND user_id = auth.uid() AND emoji = _emoji;
    RETURN FALSE;
  ELSE
    INSERT INTO community_post_reactions (post_id, user_id, emoji)
    VALUES (_post_id, auth.uid(), _emoji);
    RETURN TRUE;
  END IF;
END;
$$;

-- RPC: get reaction counts for a list of post IDs
CREATE OR REPLACE FUNCTION get_post_reactions(_post_ids UUID[])
RETURNS TABLE (post_id UUID, emoji TEXT, count BIGINT, user_reacted BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.post_id,
    r.emoji,
    COUNT(*) AS count,
    BOOL_OR(r.user_id = auth.uid()) AS user_reacted
  FROM community_post_reactions r
  WHERE r.post_id = ANY(_post_ids)
  GROUP BY r.post_id, r.emoji
  ORDER BY r.post_id, COUNT(*) DESC;
END;
$$;

-- ── POLLS ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{ "id": "uuid", "text": "..." }, ...]
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON community_poll_votes (poll_id);

ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "polls_select_all" ON community_polls FOR SELECT USING (true);
CREATE POLICY "polls_insert_auth" ON community_polls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "poll_votes_select_all" ON community_poll_votes FOR SELECT USING (true);
CREATE POLICY "poll_votes_insert_own" ON community_poll_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "poll_votes_delete_own" ON community_poll_votes FOR DELETE USING (user_id = auth.uid());

-- RPC: vote or change vote on a poll
CREATE OR REPLACE FUNCTION vote_on_poll(_poll_id UUID, _option_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ends_at TIMESTAMPTZ;
BEGIN
  SELECT ends_at INTO v_ends_at FROM community_polls WHERE id = _poll_id;
  IF v_ends_at IS NOT NULL AND v_ends_at < NOW() THEN
    RAISE EXCEPTION 'Poll has ended';
  END IF;

  INSERT INTO community_poll_votes (poll_id, user_id, option_id)
  VALUES (_poll_id, auth.uid(), _option_id)
  ON CONFLICT (poll_id, user_id)
  DO UPDATE SET option_id = _option_id;
END;
$$;

-- RPC: get poll results with vote counts
CREATE OR REPLACE FUNCTION get_poll_results(_poll_id UUID)
RETURNS TABLE (option_id TEXT, option_text TEXT, vote_count BIGINT, user_voted BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    opt->>'id' AS option_id,
    opt->>'text' AS option_text,
    COALESCE(counts.cnt, 0) AS vote_count,
    COALESCE(user_vote.voted, FALSE) AS user_voted
  FROM community_polls p,
       LATERAL jsonb_array_elements(p.options) AS opt
  LEFT JOIN (
    SELECT option_id, COUNT(*) AS cnt
    FROM community_poll_votes
    WHERE poll_id = _poll_id
    GROUP BY option_id
  ) counts ON counts.option_id = opt->>'id'
  LEFT JOIN (
    SELECT option_id, TRUE AS voted
    FROM community_poll_votes
    WHERE poll_id = _poll_id AND user_id = auth.uid()
  ) user_vote ON user_vote.option_id = opt->>'id'
  WHERE p.id = _poll_id;
END;
$$;
