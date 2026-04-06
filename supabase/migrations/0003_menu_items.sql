-- BROBROGID — Menu items (restaurant dishes)

CREATE TABLE IF NOT EXISTS public.menu_items (
  id           TEXT PRIMARY KEY,
  poi_id       TEXT NOT NULL REFERENCES public.pois(id) ON DELETE CASCADE,
  name         JSONB NOT NULL,       -- LocalizedText
  description  JSONB NOT NULL,       -- LocalizedText
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency     TEXT NOT NULL DEFAULT 'RUB',
  category     TEXT NOT NULL DEFAULT '',  -- menu section (e.g. "Осетинские пироги")
  photo        TEXT,
  is_popular   BOOLEAN NOT NULL DEFAULT false,
  tags         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_poi_id ON public.menu_items (poi_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_popular ON public.menu_items (is_popular) WHERE is_popular = true;

DROP TRIGGER IF EXISTS menu_items_set_updated_at ON public.menu_items;
CREATE TRIGGER menu_items_set_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;

COMMENT ON TABLE public.menu_items IS 'Restaurant menu items, linked to POIs with has_menu=true';
