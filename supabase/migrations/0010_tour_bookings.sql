-- BROBROGID — Tour bookings table
-- Принимает заявки на туры из формы на brobrogid.ru/ossetia/tury-ekskursii/[slug]/
--
-- Защита от спама — три уровня:
--   1) DB CHECK constraints (длины, формат email, дата не в прошлом, group_size диапазон)
--   2) Honeypot field — невидимое поле в форме, заполнение = бот, CHECK блокирует
--   3) Rate limit trigger — не более 3 заявок с одного телефона за час (SECURITY DEFINER
--      чтобы trigger мог читать таблицу от роли anon)
--
-- Также на уровне nginx добавлен limit_req для /rest/v1/tour_bookings (5 req/min/IP) —
-- см. /etc/nginx/sites-available/api-brobrogid

CREATE TABLE IF NOT EXISTS public.tour_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id         TEXT REFERENCES public.tours(id) ON DELETE SET NULL,
  guide_id        TEXT REFERENCES public.guides(id) ON DELETE SET NULL,

  -- Customer info (validated)
  customer_name   TEXT NOT NULL CHECK (length(customer_name) BETWEEN 2 AND 100),
  customer_phone  TEXT NOT NULL CHECK (length(customer_phone) BETWEEN 5 AND 30),
  customer_email  TEXT CHECK (
    customer_email IS NULL OR
    customer_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),

  -- Booking details
  preferred_date  DATE CHECK (
    preferred_date IS NULL OR
    preferred_date >= CURRENT_DATE - INTERVAL '1 day'
  ),
  group_size      INTEGER NOT NULL DEFAULT 1 CHECK (group_size BETWEEN 1 AND 50),
  comment         TEXT CHECK (comment IS NULL OR length(comment) <= 2000),

  -- Honeypot — должно остаться пустым (форма прячет это поле через CSS)
  -- Боты заполняют все поля формы → CHECK блокирует insert
  honeypot        TEXT CHECK (honeypot IS NULL OR honeypot = ''),

  -- Metadata
  source          TEXT NOT NULL DEFAULT 'website',
  status          TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled', 'spam')
  ),
  ip_address      INET,
  user_agent      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_id ON public.tour_bookings (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_guide_id ON public.tour_bookings (guide_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON public.tour_bookings (status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_created_at ON public.tour_bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_phone ON public.tour_bookings (customer_phone);

-- Updated-at trigger
DROP TRIGGER IF EXISTS tour_bookings_set_updated_at ON public.tour_bookings;
CREATE TRIGGER tour_bookings_set_updated_at
  BEFORE UPDATE ON public.tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Rate limit trigger function
-- SECURITY DEFINER: запускается от owner (postgres), bypassing RLS на SELECT.
-- Это нужно, потому что anon роль не имеет SELECT grant на tour_bookings,
-- и без SECURITY DEFINER COUNT всегда вернёт 0.
CREATE OR REPLACE FUNCTION public.check_booking_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*)
    INTO recent_count
    FROM public.tour_bookings
    WHERE customer_phone = NEW.customer_phone
      AND created_at > now() - INTERVAL '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many bookings from this phone in the last hour'
      USING HINT = 'Wait 1 hour before submitting another booking with the same phone number';
  END IF;

  RETURN NEW;
END;
$$;

-- Lock down ownership of the function so it can't be tampered with
ALTER FUNCTION public.check_booking_rate_limit() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.check_booking_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_booking_rate_limit() TO anon, authenticated;

DROP TRIGGER IF EXISTS booking_rate_limit ON public.tour_bookings;
CREATE TRIGGER booking_rate_limit
  BEFORE INSERT ON public.tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_rate_limit();

-- Row Level Security
ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT only (no SELECT, no UPDATE, no DELETE)
GRANT INSERT ON public.tour_bookings TO anon;

DROP POLICY IF EXISTS tour_bookings_anon_insert ON public.tour_bookings;
CREATE POLICY tour_bookings_anon_insert ON public.tour_bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admin can SELECT, UPDATE all bookings
GRANT SELECT, UPDATE ON public.tour_bookings TO authenticated;

DROP POLICY IF EXISTS tour_bookings_admin_read ON public.tour_bookings;
CREATE POLICY tour_bookings_admin_read ON public.tour_bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS tour_bookings_admin_update ON public.tour_bookings;
CREATE POLICY tour_bookings_admin_update ON public.tour_bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- service_role bypasses RLS for backups, exports
GRANT ALL ON public.tour_bookings TO service_role;

COMMENT ON TABLE public.tour_bookings IS 'Заявки на туры с brobrogid.ru. Anon может только INSERT, admin читает.';
COMMENT ON COLUMN public.tour_bookings.honeypot IS 'Невидимое поле в форме — должно быть пустым. Заполнено = бот.';
COMMENT ON COLUMN public.tour_bookings.status IS 'new → contacted → confirmed → completed | cancelled | spam';
