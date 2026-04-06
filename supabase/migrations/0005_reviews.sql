-- BROBROGID — Reviews (polymorphic: target_type + target_id)

CREATE TABLE IF NOT EXISTS public.reviews (
  id            TEXT PRIMARY KEY,
  target_type   review_target_type NOT NULL,
  target_id     TEXT NOT NULL,
  author_name   TEXT NOT NULL,
  author_avatar TEXT,
  rating        NUMERIC(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  text          TEXT NOT NULL DEFAULT '',
  date          TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_generated  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON public.reviews (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON public.reviews (date DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews (rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_generated ON public.reviews (is_generated);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

COMMENT ON TABLE public.reviews IS 'Polymorphic reviews — targets can be POIs, tours, or guides';
COMMENT ON COLUMN public.reviews.target_type IS 'Discriminator: poi | tour | guide';
COMMENT ON COLUMN public.reviews.target_id IS 'ID of the reviewed entity in the corresponding table';
