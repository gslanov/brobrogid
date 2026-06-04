#!/usr/bin/env bash
# BROBROGID — Провижининг тест-партнёра (НЕ запускать локально; запускать НА СЕРВЕРЕ).
#
# Что делает:
#   1. Создаёт пользователя в GoTrue через Admin API
#      (email_confirm=true, app_metadata.role=partner) — обходит закрытый signup.
#   2. Вставляет строку в public.partners (user_id, type='guide', name).
#   3. Проставляет owner_id выбранному гиду (по slug) и всем его турам = новому user_id.
#
# Запускать на сервере 87.228.33.68 (brobrogid.ru), где доступны:
#   - GoTrue на http://127.0.0.1:9999  (Admin API; см. docker-compose.yml)
#   - Postgres на 127.0.0.1:5432       (psql внутри контейнера brobrogid-postgres)
#   - /opt/supabase/.env               (секреты: JWT_SECRET, POSTGRES_PASSWORD, ...)
#
# Доступ / секреты:
#   GoTrue Admin API защищён service_role JWT (HS256, подписан JWT_SECRET из .env).
#   SERVICE_ROLE_KEY — это JWT с claim role=service_role. Если он не лежит в .env
#   как SERVICE_ROLE_KEY, сгенерируй его из JWT_SECRET (см. helper ниже).
#   Никакие секреты в этом скрипте НЕ хардкодятся и НЕ печатаются.
#
# Использование (на сервере):
#   sudo ./provision_partner.sh \
#     --email partner-test@brobrogid.ru \
#     --password 'СГЕНЕРИРОВАННЫЙ_ПАРОЛЬ' \
#     --name 'Тест Гид' \
#     --guide-slug some-guide-slug \
#     [--type guide]
#
set -euo pipefail

# ---- параметры ----
EMAIL=""; PASSWORD=""; NAME=""; GUIDE_SLUG=""; PTYPE="guide"
ENV_FILE="/opt/supabase/.env"
GOTRUE_URL="http://127.0.0.1:9999"
PG_CONTAINER="brobrogid-postgres"
PG_DB="brobrogid"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email)      EMAIL="$2"; shift 2;;
    --password)   PASSWORD="$2"; shift 2;;
    --name)       NAME="$2"; shift 2;;
    --guide-slug) GUIDE_SLUG="$2"; shift 2;;
    --type)       PTYPE="$2"; shift 2;;
    --env-file)   ENV_FILE="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 1;;
  esac
done

[[ -z "$EMAIL" || -z "$PASSWORD" || -z "$NAME" || -z "$GUIDE_SLUG" ]] && {
  echo "Required: --email --password --name --guide-slug [--type guide|lodging]" >&2
  exit 1
}

# ---- секреты из /opt/supabase/.env (не печатаем) ----
[[ -f "$ENV_FILE" ]] || { echo "env file not found: $ENV_FILE" >&2; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

# GoTrue Admin API token: GoTrue на этом сервере настроен с
# GOTRUE_JWT_ADMIN_ROLES=admin (НЕ service_role), aud=authenticated.
# Поэтому минтим HS256 JWT с claim role=admin (а не service_role), иначе 403.
# SERVICE_ROLE_KEY из .env, если уже задан корректно, тоже подойдёт.
if [[ -z "${SERVICE_ROLE_KEY:-}" ]]; then
  if [[ -z "${JWT_SECRET:-}" ]]; then
    echo "Neither SERVICE_ROLE_KEY nor JWT_SECRET present in $ENV_FILE" >&2; exit 1
  fi
  # минимальный HS256 JWT-генератор на python3 (без внешних зависимостей)
  SERVICE_ROLE_KEY="$(JWT_SECRET="$JWT_SECRET" python3 - <<'PY'
import os, json, base64, hmac, hashlib, time
secret = os.environ["JWT_SECRET"].encode()
def b64(d): return base64.urlsafe_b64encode(d).rstrip(b"=")
hdr = b64(json.dumps({"alg":"HS256","typ":"JWT"}, separators=(",",":")).encode())
now = int(time.time())
pl  = b64(json.dumps({"role":"admin","aud":"authenticated","iss":"supabase","iat":now,"exp":now+600}, separators=(",",":")).encode())
sig = b64(hmac.new(secret, hdr+b"."+pl, hashlib.sha256).digest())
print((hdr+b"."+pl+b"."+sig).decode())
PY
)"
fi

echo ">> [1/3] Создаю пользователя в GoTrue..."
CREATE_RESP="$(curl -fsS -X POST "$GOTRUE_URL/admin/users" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 - "$EMAIL" "$PASSWORD" <<'PY'
import sys, json
print(json.dumps({
  "email": sys.argv[1],
  "password": sys.argv[2],
  "email_confirm": True,
  "app_metadata": {"role": "partner"}
}))
PY
)")"

USER_ID="$(printf '%s' "$CREATE_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')"
[[ -z "$USER_ID" ]] && { echo "Не удалось получить user id из GoTrue" >&2; exit 1; }
echo "   user_id=$USER_ID"

# ---- psql helper (внутри контейнера, под postgres-суперюзером) ----
psql_exec() {
  docker exec -i -e PGPASSWORD="${POSTGRES_PASSWORD}" "$PG_CONTAINER" \
    psql -v ON_ERROR_STOP=1 -U postgres -d "$PG_DB" "$@"
}

echo ">> [2/3] Вставляю строку в public.partners..."
psql_exec <<SQL
INSERT INTO public.partners (user_id, type, name, status)
VALUES ('${USER_ID}'::uuid, '${PTYPE}', \$name\$${NAME}\$name\$, 'active')
ON CONFLICT (user_id) DO UPDATE
  SET type = EXCLUDED.type, name = EXCLUDED.name, status = 'active';
SQL

echo ">> [3/3] Проставляю owner_id гиду '${GUIDE_SLUG}' и его турам..."
psql_exec <<SQL
DO \$do\$
DECLARE gid TEXT;
BEGIN
  SELECT id INTO gid FROM public.guides WHERE slug = \$slug\$${GUIDE_SLUG}\$slug\$;
  IF gid IS NULL THEN
    RAISE EXCEPTION 'guide with slug % not found', \$slug\$${GUIDE_SLUG}\$slug\$;
  END IF;
  UPDATE public.guides SET owner_id = '${USER_ID}'::uuid WHERE id = gid;
  UPDATE public.tours  SET owner_id = '${USER_ID}'::uuid WHERE guide_id = gid;
  RAISE NOTICE 'owner_id проставлен гиду % и его турам', gid;
END
\$do\$;
SQL

echo "Готово. Партнёр ${EMAIL} (role=partner) создан и привязан к гиду ${GUIDE_SLUG}."
echo "Проверить scoping: см. supabase/scripts/verify_partner_scoping.md"
