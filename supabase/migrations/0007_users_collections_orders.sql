-- BROBROGID — User-related tables: collections (favorites), orders (cart), user_prefs

-- Collections: user-created groups of POIs (favorites)
CREATE TABLE IF NOT EXISTS public.collections (
  id          TEXT PRIMARY KEY,
  user_id     UUID,                    -- references auth.users via GoTrue (nullable for now)
  name        TEXT NOT NULL,
  poi_ids     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections (user_id);

DROP TRIGGER IF EXISTS collections_set_updated_at ON public.collections;
CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- Orders: restaurant cart + finalized orders
CREATE TABLE IF NOT EXISTS public.orders (
  id              TEXT PRIMARY KEY,
  user_id         UUID,                -- auth.users reference
  poi_id          TEXT NOT NULL REFERENCES public.pois(id) ON DELETE CASCADE,
  items           JSONB NOT NULL DEFAULT '[]'::JSONB,  -- Array<OrderItem>
  total           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status          order_status NOT NULL DEFAULT 'cart',
  payment_method  TEXT NOT NULL DEFAULT 'sbp',
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_poi_id ON public.orders (poi_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- User preferences (language, visited POIs, subscription)
CREATE TABLE IF NOT EXISTS public.user_prefs (
  user_id       UUID PRIMARY KEY,     -- auth.users reference
  language      TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  visited_pois  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  subscription  JSONB,                 -- { plan, price, startDate, endDate, features }
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS user_prefs_set_updated_at ON public.user_prefs;
CREATE TRIGGER user_prefs_set_updated_at
  BEFORE UPDATE ON public.user_prefs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_prefs TO authenticated;
GRANT ALL ON public.collections TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.user_prefs TO service_role;
