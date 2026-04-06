-- BROBROGID — Row Level Security policies
-- Principles:
--   * Public content (pois, tours, guides, reviews, menu, emergency, transport) — readable by anon
--   * Writes require service_role OR admin JWT (authenticated with 'admin' role claim)
--   * User data (collections, orders, user_prefs) — owner-only via auth.uid()

-- Enable RLS on all public content tables
ALTER TABLE public.pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prefs ENABLE ROW LEVEL SECURITY;

-- Helper: check if JWT has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper: get current user_id from JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  )::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;


-- POIs: public read, admin write
DROP POLICY IF EXISTS pois_public_read ON public.pois;
CREATE POLICY pois_public_read ON public.pois
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS pois_admin_write ON public.pois;
CREATE POLICY pois_admin_write ON public.pois
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Menu items
DROP POLICY IF EXISTS menu_items_public_read ON public.menu_items;
CREATE POLICY menu_items_public_read ON public.menu_items
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS menu_items_admin_write ON public.menu_items;
CREATE POLICY menu_items_admin_write ON public.menu_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Guides
DROP POLICY IF EXISTS guides_public_read ON public.guides;
CREATE POLICY guides_public_read ON public.guides
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS guides_admin_write ON public.guides;
CREATE POLICY guides_admin_write ON public.guides
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Tours
DROP POLICY IF EXISTS tours_public_read ON public.tours;
CREATE POLICY tours_public_read ON public.tours
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS tours_admin_write ON public.tours;
CREATE POLICY tours_admin_write ON public.tours
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Reviews: public read, admin write (reviews from users will be allowed via separate policy later)
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_public_read ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS reviews_admin_write ON public.reviews;
CREATE POLICY reviews_admin_write ON public.reviews
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Emergency
DROP POLICY IF EXISTS emergency_public_read ON public.emergency_contacts;
CREATE POLICY emergency_public_read ON public.emergency_contacts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS emergency_admin_write ON public.emergency_contacts;
CREATE POLICY emergency_admin_write ON public.emergency_contacts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Transport
DROP POLICY IF EXISTS transport_public_read ON public.transport_routes;
CREATE POLICY transport_public_read ON public.transport_routes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS transport_admin_write ON public.transport_routes;
CREATE POLICY transport_admin_write ON public.transport_routes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Collections: owner-only + admin sees all
DROP POLICY IF EXISTS collections_owner ON public.collections;
CREATE POLICY collections_owner ON public.collections
  FOR ALL TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_user_id() OR public.is_admin());


-- Orders: owner-only + admin
DROP POLICY IF EXISTS orders_owner ON public.orders;
CREATE POLICY orders_owner ON public.orders
  FOR ALL TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_user_id() OR public.is_admin());


-- User prefs: owner-only + admin
DROP POLICY IF EXISTS user_prefs_owner ON public.user_prefs;
CREATE POLICY user_prefs_owner ON public.user_prefs
  FOR ALL TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_user_id() OR public.is_admin());
