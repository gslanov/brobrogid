-- BROBROGID — Security hardening for tour_bookings
-- Fixes from SENTINEL + ARCHITECT audit (error.md):
--
-- 1. [ARCHITECT КРИТИЧНО] TOCTOU race condition in rate limit — add advisory lock
-- 2. [ARCHITECT КРИТИЧНО] Unbounded DoS — add global INSERT cap per minute
-- 3. [SENTINEL ВЫСОКО] anon writes ip_address/user_agent — column-level GRANT + DEFAULT
-- 4. [SENTINEL СРЕДНЕ] Phone enumeration via error message — generic error
-- 5. [SENTINEL ВЫСОКО] Stored XSS via comment field — block angle brackets
-- 6. [SENTINEL ВЫСОКО] No IP-based rate limit — add per-IP throttle in trigger

-- ============================================================================
-- FIX 3: Revoke broad INSERT, grant only safe columns. Set ip_address default
-- to inet_client_addr() so it can't be client-controlled.
-- ============================================================================

REVOKE INSERT ON public.tour_bookings FROM anon;

GRANT INSERT (
  tour_id,
  guide_id,
  customer_name,
  customer_phone,
  customer_email,
  preferred_date,
  group_size,
  comment,
  honeypot,
  source
) ON public.tour_bookings TO anon;

-- Column defaults — set server-side, can't be overridden by anon
ALTER TABLE public.tour_bookings
  ALTER COLUMN ip_address SET DEFAULT inet_client_addr();

-- user_agent stays NULL for anon (would need PostgREST to forward header,
-- not worth the complexity for low value). Admin can backfill from nginx logs
-- if needed for forensics.

-- ============================================================================
-- FIX 5: Block angle brackets in customer_name and comment to prevent stored XSS.
-- This is defense-in-depth — admin UI must also escape on render.
-- ============================================================================

ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_customer_name_check;

ALTER TABLE public.tour_bookings
  ADD CONSTRAINT tour_bookings_customer_name_check
  CHECK (
    length(customer_name) BETWEEN 2 AND 100
    AND customer_name !~ '[<>]'
  );

ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_comment_check;

ALTER TABLE public.tour_bookings
  ADD CONSTRAINT tour_bookings_comment_check
  CHECK (
    comment IS NULL
    OR (length(comment) <= 2000 AND comment !~ '[<>]')
  );

-- Also for customer_phone — only digits, +, -, spaces, parens
ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_customer_phone_check;

ALTER TABLE public.tour_bookings
  ADD CONSTRAINT tour_bookings_customer_phone_check
  CHECK (
    length(customer_phone) BETWEEN 5 AND 30
    AND customer_phone ~ '^[+\d\s()\-]+$'
  );

-- ============================================================================
-- FIXES 1, 2, 4, 6: Replace rate-limit trigger with hardened version.
--   - Advisory lock per-phone to serialize concurrent inserts (FIX 1 TOCTOU)
--   - Global cap: max 30 inserts per minute (FIX 2 DoS)
--   - Per-IP cap: max 5 inserts per hour (FIX 6 IP throttle)
--   - Generic error message (FIX 4 phone enumeration)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_booking_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_phone_count   INTEGER;
  recent_ip_count      INTEGER;
  recent_global_count  INTEGER;
  client_ip            INET;
BEGIN
  -- Acquire transactional advisory lock keyed on phone hash.
  -- Serializes concurrent inserts with the same phone — prevents TOCTOU race
  -- (FIX 1).
  PERFORM pg_advisory_xact_lock(hashtext(NEW.customer_phone));

  client_ip := COALESCE(NEW.ip_address, inet_client_addr());

  -- Also lock on IP if available (best-effort serialization for IP throttle)
  IF client_ip IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(host(client_ip)));
  END IF;

  -- FIX 2: Global cap — abort if too many bookings created site-wide recently.
  -- Defends against IP-rotating botnets that bypass per-IP/per-phone limits.
  SELECT COUNT(*)
    INTO recent_global_count
    FROM public.tour_bookings
    WHERE created_at > now() - INTERVAL '1 minute';

  IF recent_global_count >= 30 THEN
    RAISE EXCEPTION 'Too many requests'
      USING ERRCODE = '54000',
            HINT = 'Server is busy, please try again in a minute';
  END IF;

  -- FIX 6: Per-IP rate limit (in addition to nginx limit_req).
  -- nginx limit can be bypassed via X-Forwarded-For spoofing if proxy
  -- misconfig — DB-level check is the safety net.
  IF client_ip IS NOT NULL THEN
    SELECT COUNT(*)
      INTO recent_ip_count
      FROM public.tour_bookings
      WHERE ip_address = client_ip
        AND created_at > now() - INTERVAL '1 hour';

    IF recent_ip_count >= 5 THEN
      RAISE EXCEPTION 'Too many requests'
        USING ERRCODE = '54000',
              HINT = 'Wait before submitting another booking';
    END IF;
  END IF;

  -- Per-phone rate limit (existing logic, but with generic error).
  -- FIX 4: don't reveal "this phone has X bookings" — generic message.
  SELECT COUNT(*)
    INTO recent_phone_count
    FROM public.tour_bookings
    WHERE customer_phone = NEW.customer_phone
      AND created_at > now() - INTERVAL '1 hour';

  IF recent_phone_count >= 3 THEN
    RAISE EXCEPTION 'Too many requests'
      USING ERRCODE = '54000',
            HINT = 'Wait before submitting another booking';
  END IF;

  RETURN NEW;
END;
$$;

-- Re-grant execute (function definition was replaced, perms preserved by REPLACE
-- but make explicit for clarity)
REVOKE ALL ON FUNCTION public.check_booking_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_booking_rate_limit() TO anon, authenticated;

-- Trigger already exists from 0010, no need to recreate. But verify:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'booking_rate_limit'
      AND tgrelid = 'public.tour_bookings'::regclass
  ) THEN
    CREATE TRIGGER booking_rate_limit
      BEFORE INSERT ON public.tour_bookings
      FOR EACH ROW
      EXECUTE FUNCTION public.check_booking_rate_limit();
  END IF;
END $$;

-- ============================================================================
-- Add explicit policy that anon CANNOT update or delete (defense-in-depth)
-- ============================================================================

REVOKE UPDATE, DELETE ON public.tour_bookings FROM anon;

-- ============================================================================
-- Documentation comments
-- ============================================================================

COMMENT ON FUNCTION public.check_booking_rate_limit() IS
  'Hardened rate limit: TOCTOU-safe (advisory lock), per-phone (3/h), per-IP (5/h), global cap (30/min). Generic error messages to prevent enumeration.';

COMMENT ON COLUMN public.tour_bookings.ip_address IS
  'Server-set via inet_client_addr(). Anon cannot write this column directly.';
