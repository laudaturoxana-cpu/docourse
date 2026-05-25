-- Migration 012: Fix community events functions
-- Rewrite create/delete event functions as SECURITY INVOKER so auth.uid() works correctly.
-- The RLS policies on community_events already enforce that only the creator can insert/delete.

-- DROP old SECURITY DEFINER versions first
DROP FUNCTION IF EXISTS create_community_event(UUID, TEXT, TEXT, TIMESTAMPTZ, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS create_community_event(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS delete_community_event(UUID);

-- Recreate as SECURITY INVOKER (default) — runs as the calling user
-- auth.uid() is guaranteed to return the correct UUID in this context.
CREATE OR REPLACE FUNCTION create_community_event(
  _plan_id     UUID,
  _title       TEXT,
  _event_date  TIMESTAMPTZ,
  _description TEXT    DEFAULT NULL,
  _location    TEXT    DEFAULT NULL,
  _is_online   BOOLEAN DEFAULT TRUE,
  _link_url    TEXT    DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_new_id UUID;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO community_events (
    membership_plan_id, creator_id, title, description,
    event_date, location, is_online, link_url
  )
  VALUES (
    _plan_id, v_caller, _title, _description,
    _event_date, _location, _is_online, _link_url
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_community_event(_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  v_caller UUID := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM community_events
  WHERE id = _event_id AND creator_id = v_caller;
END;
$$;

-- Also grant execute to authenticated and anon roles (Supabase default)
GRANT EXECUTE ON FUNCTION create_community_event(UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_community_event(UUID) TO authenticated;
