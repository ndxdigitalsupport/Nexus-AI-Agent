-- ============================================================================
-- NEXUS AI AGENT — Supabase Row Level Security (RLS)
--
-- Run this ONCE in the Supabase Dashboard → SQL Editor → New query → Run.
-- (Copy the whole file into the editor and press "Run".)
--
-- Why: the app's publishable key ships in the browser bundle. Without RLS,
-- ANY visitor can read/delete every row in `conversations`/`tasks` and edit
-- their own `profiles.role` to become admin. These policies lock all of that.
--
-- After this runs:
--   * Users can only read/write/delete their OWN rows (user_id = auth.uid()).
--   * Users can never set role = 'admin' or plan = 'pro' from the app.
--   * Admins can read all rows (for the /admin dashboard).
--   * The Dashboard/SQL Editor can still manage everything directly.
-- ============================================================================

-- ---------- 1) Enable Row Level Security -----------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ---------- 2) Admin helper (SECURITY DEFINER avoids RLS recursion) ----------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$;

-- ---------- 3) Force safe role/plan values on client writes -----------------
-- Requests with a real user session (the browser app) can never change
-- role/plan. Owner / dashboard / SQL-editor writes (no auth context) are
-- allowed, which is how you grant admin from the dashboard.
CREATE OR REPLACE FUNCTION public.sanitize_profile_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'user';
      NEW.plan := 'free';
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.role := OLD.role;
      NEW.plan := OLD.plan;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_profile_role ON public.profiles;
CREATE TRIGGER trg_sanitize_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_profile_role();

-- ---------- 4) profiles -----------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT
  USING (id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid()::text);

-- Needed so the app's profile upsert works on re-login. The trigger above
-- preserves the existing role/plan, so it can never be used to escalate.
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- ---------- 5) conversations: owner-only (admins may read all) --------------
DROP POLICY IF EXISTS "conversations_select_own_or_admin" ON public.conversations;
CREATE POLICY "conversations_select_own_or_admin" ON public.conversations
  FOR SELECT
  USING (user_id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;
CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "conversations_delete_own" ON public.conversations;
CREATE POLICY "conversations_delete_own" ON public.conversations
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ---------- 6) tasks: owner-only (admins may read all) ----------------------
DROP POLICY IF EXISTS "tasks_select_own_or_admin" ON public.tasks;
CREATE POLICY "tasks_select_own_or_admin" ON public.tasks
  FOR SELECT
  USING (user_id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
CREATE POLICY "tasks_insert_own" ON public.tasks
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- ============================================================================
-- HOW TO GRANT AN ADMIN ACCOUNT (run manually, when needed)
--
-- 1. Get the user's UUID:
--      Dashboard → Authentication → Users  (copy the UUID)
--    or run:  SELECT id, email FROM auth.users;
--
-- 2. Run (replacing <UUID> and the email):
--      INSERT INTO public.profiles (id, email, role, plan, created_at)
--      VALUES ('<UUID>', 'admin@company.com', 'admin', 'pro',
--              (SELECT (extract(epoch from now()) * 1000)::bigint))
--      ON CONFLICT (id) DO UPDATE SET role = 'admin', plan = 'pro';
--
--    The admin then signs in and gets the 👑 dashboard at /admin.
-- ============================================================================

-- ============================================================================
-- MIGRATION NOTE FOR OLD (PRE-RLS) TEST ROWS
--
-- Rows created before RLS used the EMAIL string as user_id / profiles.id.
-- Under RLS those rows now belong to nobody and won't be visible, because
-- ownership is the real auth UUID. This only affects old phantom test users
-- (e.g. testuser@company.com created via the old rate-limit workaround, which
-- were never real Supabase accounts anyway). You can safely delete them:
--
--    DELETE FROM public.conversations WHERE user_id NOT IN (SELECT id::text FROM auth.users);
--    DELETE FROM public.tasks        WHERE user_id NOT IN (SELECT id::text FROM auth.users);
--    DELETE FROM public.profiles     WHERE id NOT IN (SELECT id::text FROM auth.users);
-- ============================================================================

-- ============================================================================
-- PRO BILLING — Admin-only plan toggle (GRANT / REVOKE)
--
-- Run this ONCE after the RLS policies above. It lets admins flip a user's
-- plan between 'free' and 'pro' without needing direct Dashboard access.
-- ============================================================================

-- 1) Update the sanitize trigger to allow the bypass flag set by admin_set_plan.
DROP TRIGGER IF EXISTS trg_sanitize_profile_role ON public.profiles;
CREATE TRIGGER trg_sanitize_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_profile_role();

CREATE OR REPLACE FUNCTION public.sanitize_profile_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'user';
      NEW.plan := 'free';
    ELSIF TG_OP = 'UPDATE' THEN
      NEW.role := OLD.role;
      -- Allow plan change only when admin_set_plan sets the bypass flag.
      IF current_setting('app.bypass_plan_sanitize', true) <> 'true' THEN
        NEW.plan := OLD.plan;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Admin-only function to grant/revoke PRO.
-- Uses SECURITY DEFINER + the bypass flag to override the sanitize trigger.
-- Only callers with role='admin' in profiles can execute it.
CREATE OR REPLACE FUNCTION public.admin_set_plan(target_id text, new_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF new_plan NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'invalid plan: %', new_plan;
  END IF;
  PERFORM set_config('app.bypass_plan_sanitize', 'true', true);
  UPDATE public.profiles SET plan = new_plan WHERE id = target_id;
END;
$$;

-- 3) Allow authenticated users (admins) to call admin_set_plan via the API.
GRANT EXECUTE ON FUNCTION public.admin_set_plan(text, text) TO authenticated;
