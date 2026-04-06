-- BROBROGID — POIs table

CREATE TABLE IF NOT EXISTS public.pois (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            JSONB NOT NULL,           -- { ru: string, en: string }
  category        poi_category NOT NULL,
  subcategory     TEXT NOT NULL DEFAULT '',
  cuisine_type    cuisine_type,
  location        JSONB NOT NULL,           -- { lat, lng, address: { ru, en } }
  description     JSONB NOT NULL,           -- { short: {ru,en}, medium: {ru,en}, full: {ru,en} }
  photos          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  hours           JSONB,                    -- { mon, tue, wed, thu, fri, sat, sun }
  phone           TEXT,
  website         TEXT,
  price_level     SMALLINT CHECK (price_level BETWEEN 1 AND 4),
  tags            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_chain        BOOLEAN NOT NULL DEFAULT false,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  visit_count     INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
  has_menu        BOOLEAN NOT NULL DEFAULT false,
  has_delivery    BOOLEAN NOT NULL DEFAULT false,
  external_order_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pois_slug ON public.pois (slug);
CREATE INDEX IF NOT EXISTS idx_pois_category ON public.pois (category);
CREATE INDEX IF NOT EXISTS idx_pois_subcategory ON public.pois (subcategory);
CREATE INDEX IF NOT EXISTS idx_pois_subscription_tier ON public.pois (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_pois_rating ON public.pois (rating DESC);
CREATE INDEX IF NOT EXISTS idx_pois_visit_count ON public.pois (visit_count DESC);
CREATE INDEX IF NOT EXISTS idx_pois_tags ON public.pois USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_pois_has_menu ON public.pois (has_menu) WHERE has_menu = true;

-- Full-text search indexes on localized names
CREATE INDEX IF NOT EXISTS idx_pois_name_ru_trgm
  ON public.pois USING GIN ((name->>'ru') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pois_name_en_trgm
  ON public.pois USING GIN ((name->>'en') gin_trgm_ops);

-- Updated_at trigger
DROP TRIGGER IF EXISTS pois_set_updated_at ON public.pois;
CREATE TRIGGER pois_set_updated_at
  BEFORE UPDATE ON public.pois
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT ON public.pois TO anon, authenticated;
GRANT ALL ON public.pois TO service_role;

COMMENT ON TABLE public.pois IS 'Points of Interest — attractions, restaurants, hotels, nature, etc.';
COMMENT ON COLUMN public.pois.name IS 'LocalizedText: { ru, en }';
COMMENT ON COLUMN public.pois.location IS '{ lat: number, lng: number, address: LocalizedText }';
COMMENT ON COLUMN public.pois.description IS '{ short, medium, full } — each is LocalizedText';
