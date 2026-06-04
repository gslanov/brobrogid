# Верификация partner scoping — чеклист (запускать НА СЕРВЕРЕ, НЕ локально)

Цель: подтвердить, что партнёр видит/правит только своё, чужое — нет, и что
публичный anon-read портала не сломан после миграции `0014_partners.sql`.

Предполагается, что миграция применена и `provision_partner.sh` отработал
(создан партнёр `partner-test@brobrogid.ru`, привязан к гиду `<GUIDE_SLUG>`).

Переменные:
```bash
API=https://api.brobrogid.ru          # PostgREST + GoTrue за nginx
# либо локально на сервере: GOTRUE=http://127.0.0.1:9999  REST=http://127.0.0.1:3000
P_EMAIL=partner-test@brobrogid.ru
P_PASS='<пароль из провижининга>'
MY_GUIDE=<id моего гида>              # guides.id (TEXT) принадлежащий партнёру
OTHER_GUIDE=<id чужого гида>         # любой guides.id с другим/NULL owner_id
```

## 0. Получить JWT партнёра (GoTrue signInWithPassword)
```bash
TOKEN=$(curl -fsS -X POST "$API/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$P_EMAIL\",\"password\":\"$P_PASS\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')
# Санити: claim app_metadata.role должен быть "partner"
python3 -c 'import sys,base64,json; t=sys.argv[1].split(".")[1]; print(json.loads(base64.urlsafe_b64decode(t+"=="*((4-len(t)%4)%4))))' "$TOKEN"
```
Ожидание: в payload `app_metadata.role == "partner"`, `aud == "authenticated"`.

## (а) SELECT — видит своего гида через partner-политику
```bash
curl -fsS "$API/rest/v1/guides?id=eq.$MY_GUIDE&select=id,owner_id" \
  -H "Authorization: Bearer $TOKEN"
```
Ожидание: 1 строка, `owner_id` = user_id партнёра.
(Примечание: из-за `guides_public_read` партнёр технически видит и чужих гидов по
SELECT — это поведение публичного портала, не регресс. Изоляция критична для UPDATE.)

## (б) UPDATE своего гида проходит, чужого — 0 строк
Свой (должно обновить 1 строку):
```bash
curl -fsS -X PATCH "$API/rest/v1/guides?id=eq.$MY_GUIDE" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"photo":"https://example.com/test.jpg"}'
```
Ожидание: HTTP 200, вернулась 1 строка.

Чужой (должно вернуть пусто / не обновить):
```bash
curl -fsS -X PATCH "$API/rest/v1/guides?id=eq.$OTHER_GUIDE" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"photo":"https://example.com/hack.jpg"}'
```
Ожидание: HTTP 200 с пустым `[]` (RLS USING отфильтровал строку; обновлено 0).
То же проверить для `tours` и `pois` (PATCH своего → 1, чужого → 0).

## (в) tour_bookings — видит свои, не видит чужие
Свои (заявки на туры партнёра ИЛИ где он guide):
```bash
curl -fsS "$API/rest/v1/tour_bookings?select=id,tour_id,guide_id,status" \
  -H "Authorization: Bearer $TOKEN"
```
Ожидание: только заявки, где `tour_id` → tours.owner_id = partner ИЛИ
`guide_id` → guides.owner_id = partner. Чужих заявок в ответе быть не должно.

UPDATE статуса своей заявки (только колонка status разрешена grant'ом 0012):
```bash
curl -fsS -X PATCH "$API/rest/v1/tour_bookings?id=eq.<MY_BOOKING_ID>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status":"contacted"}'
```
Ожидание: HTTP 200, 1 строка. Попытка PATCH чужой заявки → `[]` (0 строк).
Попытка PATCH `customer_name`/`tour_id` → ошибка (нет column-grant + immutable trigger).

## (г) Публичный anon-read портала НЕ сломан
Без токена (роль anon):
```bash
curl -fsS "$API/rest/v1/guides?select=id&limit=3"
curl -fsS "$API/rest/v1/tours?select=id&limit=3"
curl -fsS "$API/rest/v1/pois?select=id&limit=3"
```
Ожидание: HTTP 200, строки возвращаются как раньше (public_read нетронут).

anon НЕ может писать (как и до миграции):
```bash
curl -s -o /dev/null -w '%{http_code}\n' -X PATCH "$API/rest/v1/guides?id=eq.$MY_GUIDE" \
  -d '{"photo":"x"}' -H "Content-Type: application/json"
```
Ожидание: 401/403 либо 0 строк — никаких изменений от анонима.

anon INSERT в tour_bookings всё ещё работает (форма заявок не сломана):
```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$API/rest/v1/tour_bookings" \
  -H "Content-Type: application/json" \
  -d '{"tour_id":"<existing_tour>","customer_name":"Test","customer_phone":"+79990000000","group_size":1}'
```
Ожидание: 201 (или rate-limit 5xx при превышении) — anon_insert политика жива.

## (д) Регрессия админа
Залогиниться под `admin@brobrogid.ru`, повторить (б)/(в): админ по-прежнему
видит/правит ВСЁ (admin_write / admin_read политики не тронуты).

## Критерий приёмки
- партнёр: UPDATE своего → 1 строка; чужого → 0; видит только свои bookings.
- anon: read работает, write не работает, booking-insert работает.
- admin: полный доступ сохранён.
