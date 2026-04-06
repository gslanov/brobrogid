-- BROBROGID — Emergency contacts + Transport routes

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id          TEXT PRIMARY KEY,
  type        emergency_type NOT NULL,
  name        JSONB NOT NULL,     -- LocalizedText
  phone       TEXT NOT NULL,
  location    JSONB NOT NULL,     -- Location
  is_24h      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_type ON public.emergency_contacts (type);

DROP TRIGGER IF EXISTS emergency_set_updated_at ON public.emergency_contacts;
CREATE TRIGGER emergency_set_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.emergency_contacts TO anon, authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;


CREATE TABLE IF NOT EXISTS public.transport_routes (
  id          TEXT PRIMARY KEY,
  number      TEXT NOT NULL,
  name        JSONB NOT NULL,     -- LocalizedText
  type        transport_type NOT NULL,
  stops       JSONB NOT NULL DEFAULT '[]'::JSONB,
              -- Array<{ name: LocalizedText, location: { lat, lng } }>
  schedule    JSONB,              -- { weekday: string, weekend: string } — optional
  color       TEXT NOT NULL DEFAULT '#3B82F6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transport_type ON public.transport_routes (type);
CREATE INDEX IF NOT EXISTS idx_transport_number ON public.transport_routes (number);

DROP TRIGGER IF EXISTS transport_set_updated_at ON public.transport_routes;
CREATE TRIGGER transport_set_updated_at
  BEFORE UPDATE ON public.transport_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.transport_routes TO anon, authenticated;
GRANT ALL ON public.transport_routes TO service_role;
