-- BROBROGID — Fix is_admin() helper to read role from app_metadata
-- and grant INSERT/UPDATE/DELETE to authenticated role (RLS still enforces is_admin check)
--
-- Background: GoTrue issues JWTs with `role: authenticated` at top level and
-- puts the admin role inside `app_metadata.role`. The previous is_admin() helper
-- only checked top-level `role`, which is always 'authenticated' for logged-in
-- users. This migration fixes it to also check app_metadata.role.
--
-- Also, migrations 0002-0006 granted only SELECT to `authenticated` role,
-- so PostgREST rejected writes even when RLS would have allowed them.

-- Fix is_admin helper: check both app_metadata.role and top-level role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role' = 'admin',
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin',
    false
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant write permissions to authenticated role on public content.
-- RLS policies still require is_admin() for actual writes — this just allows
-- PostgreSQL-level access so RLS can be evaluated.
GRANT INSERT, UPDATE, DELETE ON public.pois TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tours TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.transport_routes TO authenticated;
