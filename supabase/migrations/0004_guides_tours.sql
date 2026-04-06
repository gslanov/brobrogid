-- BROBROGID — Guides + Tours

CREATE TABLE IF NOT EXISTS public.guides (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE,
  name            JSONB NOT NULL,          -- LocalizedText
  bio             JSONB NOT NULL,          -- LocalizedText
  photo           TEXT,
  languages       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  tour_count      INTEGER NOT NULL DEFAULT 0 CHECK (tour_count >= 0),
  specializations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guides_slug ON public.guides (slug);
CREATE INDEX IF NOT EXISTS idx_guides_languages ON public.guides USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_guides_specializations ON public.guides USING GIN (specializations);
CREATE INDEX IF NOT EXISTS idx_guides_rating ON public.guides (rating DESC);

DROP TRIGGER IF EXISTS guides_set_updated_at ON public.guides;
CREATE TRIGGER guides_set_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.guides TO anon, authenticated;
GRANT ALL ON public.guides TO service_role;


CREATE TABLE IF NOT EXISTS public.tours (
  id                 TEXT PRIMARY KEY,
  slug               TEXT UNIQUE,
  name               JSONB NOT NULL,       -- LocalizedText
  description        JSONB NOT NULL,       -- LocalizedText
  guide_id           TEXT REFERENCES public.guides(id) ON DELETE SET NULL,
  price              NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration           TEXT NOT NULL DEFAULT '',
  type               tour_type NOT NULL,
  max_group_size     INTEGER NOT NULL DEFAULT 0 CHECK (max_group_size >= 0),
  current_group_size INTEGER NOT NULL DEFAULT 0 CHECK (current_group_size >= 0),
  status             tour_status NOT NULL DEFAULT 'recruiting',
  dates              TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],   -- ISO dates
  meeting_point      JSONB NOT NULL,       -- Location
  route              JSONB NOT NULL DEFAULT '[]'::JSONB,        -- Array<{lat,lng}>
  rating             NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count       INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  photos             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  category           TEXT NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tours_slug ON public.tours (slug);
CREATE INDEX IF NOT EXISTS idx_tours_guide_id ON public.tours (guide_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON public.tours (status);
CREATE INDEX IF NOT EXISTS idx_tours_type ON public.tours (type);
CREATE INDEX IF NOT EXISTS idx_tours_category ON public.tours (category);
CREATE INDEX IF NOT EXISTS idx_tours_rating ON public.tours (rating DESC);

DROP TRIGGER IF EXISTS tours_set_updated_at ON public.tours;
CREATE TRIGGER tours_set_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.tours TO anon, authenticated;
GRANT ALL ON public.tours TO service_role;
