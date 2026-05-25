-- Migration 008: Community Events + Categories

-- ── CATEGORIES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_plan_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (membership_plan_id, name)
);

CREATE INDEX IF NOT EXISTS idx_community_categories_plan ON community_categories (membership_plan_id, sort_order);

ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON community_categories
  FOR SELECT USING (true);

-- Only creator can manage categories (enforced in app layer; direct writes allowed)
CREATE POLICY "categories_insert_any_auth" ON community_categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "categories_update_any_auth" ON community_categories
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "categories_delete_any_auth" ON community_categories
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Add optional category to posts (nullable — posts without category show in All)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES community_categories(id) ON DELETE SET NULL;

-- RPC: get categories for a community
CREATE OR REPLACE FUNCTION get_community_categories(_plan_id UUID)
RETURNS TABLE (id UUID, name TEXT, emoji TEXT, sort_order INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT cc.id, cc.name, cc.emoji, cc.sort_order
  FROM community_categories cc
  WHERE cc.membership_plan_id = _plan_id
  ORDER BY cc.sort_order, cc.name;
END;
$$;

-- ── EVENTS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_plan_id UUID NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_events_plan ON community_events (membership_plan_id, event_date);

ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_all" ON community_events
  FOR SELECT USING (true);

CREATE POLICY "events_insert_auth" ON community_events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "events_update_own" ON community_events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "events_delete_own" ON community_events
  FOR DELETE USING (auth.uid() = creator_id);

-- RPC: get upcoming events for a community (next 90 days)
CREATE OR REPLACE FUNCTION get_community_events(_plan_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  is_online BOOLEAN,
  link_url TEXT,
  creator_name TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.description,
    e.event_date,
    e.location,
    e.is_online,
    e.link_url,
    COALESCE(p.full_name, 'Creator') AS creator_name
  FROM community_events e
  LEFT JOIN profiles p ON p.user_id = e.creator_id
  WHERE e.membership_plan_id = _plan_id
    AND e.event_date >= NOW() - INTERVAL '1 hour'
  ORDER BY e.event_date ASC
  LIMIT 20;
END;
$$;

-- RPC: create event (creator only — enforced in app layer via creator_id check)
CREATE OR REPLACE FUNCTION create_community_event(
  _plan_id UUID,
  _title TEXT,
  _description TEXT,
  _event_date TIMESTAMPTZ,
  _location TEXT DEFAULT NULL,
  _is_online BOOLEAN DEFAULT TRUE,
  _link_url TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_id UUID;
BEGIN
  INSERT INTO community_events (membership_plan_id, creator_id, title, description, event_date, location, is_online, link_url)
  VALUES (_plan_id, auth.uid(), _title, _description, _event_date, _location, _is_online, _link_url)
  RETURNING id INTO v_new_id;
  RETURN v_new_id;
END;
$$;

-- RPC: delete event (only creator)
CREATE OR REPLACE FUNCTION delete_community_event(_event_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM community_events
  WHERE id = _event_id AND creator_id = auth.uid();
END;
$$;
