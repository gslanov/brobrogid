---
title: Launch Procedure — открытие индексации
type: runbook
audience: archimag, brobrogid-site-agent, user
owner: archimag
last_updated: 2026-04-07
---

# Launch Procedure — как открыть индексацию для brobrogid.ru

## Когда это запускать

**Триггер:** пользователь говорит "открываем индексацию" после того как:

- ✅ Контент финализирован (Спринты 1-3 завершены, блог написан)
- ✅ Все критичные security находки закрыты (или явно приняты как риск)
- ✅ Lighthouse 95+ на sample страницах
- ✅ JSON-LD валидируется в Google Rich Results Test
- ✅ Cross-sprint линки не ведут в 404 (sitemap curl loop)
- ✅ Pool 4 завершён (опционально — или принят решением оставить)

**НЕ запускать если:**

- ❌ Есть любые CRITICAL findings в `error.md` (открытые)
- ❌ Sprint 3 не полностью завершён
- ❌ Есть известные битые ссылки
- ❌ Russian slugs migration (Sprint 6) не завершён с обеих сторон
- ❌ `app.brobrogid.ru` должен СТАТЬ индексируемым (он остаётся noindex всегда — это app, не SEO target)

## Предусловия

**Нужен доступ:**

- SSH к Selectel VPS (ключ `/home/cosmo/.ssh/id_ed25519_selectel`)
- Git push в `gslanov/brobrogid-site` (через нового агента)
- Google аккаунт для Search Console
- Яндекс аккаунт для Webmaster
- Возможность редактировать DNS (для TXT-верификации, опционально)

**Что должно быть готово:**

- Актуальный bulid brobrogid.ru на проде
- Sitemap обновлён
- nginx configs без опечаток (`nginx -t` проходит)
- DB backup в пределах суток

## Архитектурная карта защиты от индексации

**Важно:** noindex обеспечен на нескольких уровнях. Нужно снять ВСЕ, иначе bots продолжат видеть noindex.

### 1. `robots.txt` (на сервере)

**Локация 1** — файл в `/var/www/brobrogid-site/robots.txt`:

```
User-agent: *
Disallow: /

# TEMPORARILY CLOSED FROM INDEXING
```

**Локация 2** — nginx override в `/etc/nginx/sites-available/brobrogid-site`:

```nginx
location = /robots.txt {
    return 200 "User-agent: *\nDisallow: /\n";
    add_header Content-Type text/plain;
    add_header Cache-Control "public, max-age=300";
}
```

Nginx override **приоритетнее** файла. Если есть `location = /robots.txt` — файл не используется.

### 2. `X-Robots-Tag` HTTP header (nginx)

Добавлен в `location ~* \.html$` и `location ~ ^/([^.]*)?$` в nginx config:

```nginx
add_header X-Robots-Tag "noindex, nofollow" always;
```

Этот заголовок перекрывает всё — даже если HTML говорит "index", этот говорит "noindex".

### 3. Meta tags в HTML (Astro `BaseLayout`)

В `src/layouts/BaseLayout.astro` нового агента:

```html
<meta name="robots" content="noindex, nofollow" />
<meta name="googlebot" content="noindex, nofollow" />
<meta name="yandex" content="noindex, nofollow" />
```

Контролируется константой `SITE_UNDER_CONSTRUCTION = true` в `src/lib/site.ts`.

### 4. `SITE_UNDER_CONSTRUCTION` константа

В `src/lib/site.ts` нового агента:

```typescript
export const SITE_UNDER_CONSTRUCTION = true
```

Это главный rubicon. При `true` BaseLayout emits noindex meta, возможно и `<link rel="canonical">` не ставится, возможно Astro skipет sitemap entries.

## Шаги открытия индексации

### Шаг 1: Финальная проверка что всё в порядке

```bash
# 1.1 Curl на несколько критических страниц
for url in \
  / \
  /ossetia/ \
  /ossetia/kuhnya/osetinskie-pirogi/ \
  /ossetia/mesta/ushchelya/tseyskoe-uschele/ \
  /ossetia/kak-dobratsya/iz-moskvy/na-samolete/ \
  /ossetia/vladikavkaz/pogoda/; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://brobrogid.ru$url")
  printf "  %-60s %s\n" "$url" "$STATUS"
done

# 1.2 Все должны быть 200. Если 301 — проверить куда редиректит.

# 1.3 JSON-LD валидация
# Открыть в браузере:
# https://search.google.com/test/rich-results?url=https://brobrogid.ru/ossetia/kuhnya/osetinskie-pirogi/
# Должно пройти без errors.

# 1.4 Проверить что sitemap.xml не содержит битых URL
curl -sk https://brobrogid.ru/sitemap-0.xml | \
  grep -oE '<loc>https://brobrogid\.ru[^<]*' | \
  sed 's|<loc>||' | \
  while read url; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$STATUS" != "200" ]; then
      echo "BROKEN: $STATUS $url"
    fi
  done
# Ничего не должно вывестись (все 200).

# 1.5 Lighthouse на ключевых страницах
# (Запустить локально или через PageSpeed Insights)
# https://pagespeed.web.dev/report?url=https%3A%2F%2Fbrobrogid.ru%2Fossetia%2F
```

### Шаг 2: Переключить SITE_UNDER_CONSTRUCTION на клиенте (новый агент)

Передать новому агенту:

```
Открываем индексацию. Выполни атомарно:

1. Отредактируй src/lib/site.ts:
   - SITE_UNDER_CONSTRUCTION = false

2. Проверь что BaseLayout.astro больше НЕ эмитит meta noindex tags
   (должна быть условная логика — при SITE_UNDER_CONSTRUCTION=false не эмитит)

3. Если у тебя есть Astro sitemap filter — убедись что он не скипает
   страницы при SITE_UNDER_CONSTRUCTION=true (теперь false — должно
   попасть всё)

4. npm run build
5. npm run test / проверить что tsc и eslint чисты
6. Deploy (rsync)
7. Commit: "feat: open indexation — SITE_UNDER_CONSTRUCTION=false"
8. Push

Archimag параллельно снимает nginx-level noindex.

После твоего deploy и моих nginx изменений — verify:
  curl -I https://brobrogid.ru/ | grep -i x-robots  # не должно быть
  curl -sk https://brobrogid.ru/ | grep -i noindex  # не должно быть
  curl -sk https://brobrogid.ru/robots.txt  # должно быть Allow: /
```

### Шаг 3: Снять nginx-level noindex (Archimag)

```bash
# 3.1 SSH на сервер
ssh -i /home/cosmo/.ssh/id_ed25519_selectel root@87.228.33.68

# 3.2 Редактировать /etc/nginx/sites-available/brobrogid-site
# Удалить или закомментировать:
#   - X-Robots-Tag add_header строки в location ~* \.html$
#   - X-Robots-Tag add_header в location ~ ^/([^.]*)?$
#   - Server-level add_header X-Robots-Tag если есть
#   - location = /robots.txt { return 200 "User-agent: *\nDisallow: /\n"; }
#     (оставить если файл в /var/www/ уже правильный,
#      или обновить оба: nginx ИЛИ файл, но не противоречиво)

# 3.3 Обновить public/robots.txt в репо нового агента (или через sed на сервере)
# Должно быть:
cat > /var/www/brobrogid-site/robots.txt <<'EOF'
User-agent: *
Allow: /

Sitemap: https://brobrogid.ru/sitemap-index.xml
EOF

# 3.4 Test и reload
nginx -t && systemctl reload nginx

# 3.5 Verify
curl -sk https://brobrogid.ru/robots.txt
# → Allow: /

curl -sIk https://brobrogid.ru/ | grep -i x-robots
# → ничего (заголовка нет)

curl -sk https://brobrogid.ru/ossetia/kuhnya/osetinskie-pirogi/ | grep -o 'robots[^>]*>' | head
# → ничего про noindex
```

### Шаг 4: Google Search Console setup

1. Открыть https://search.google.com/search-console
2. **Add property** → URL prefix → `https://brobrogid.ru`
3. **Verify ownership:** выбрать HTML tag method, скопировать `<meta name="google-site-verification" content="...">`.
4. Передать мета-тег новому агенту:
   ```
   Добавь в src/layouts/BaseLayout.astro (в <head>) постоянно:
   <meta name="google-site-verification" content="..." />
   Deploy.
   ```
5. В Search Console → **Verify** (после деплоя).
6. **Sitemaps** → добавить `https://brobrogid.ru/sitemap-index.xml` (или `/sitemap-0.xml` в зависимости от @astrojs/sitemap версии).
7. Google начнёт crawling в течение 24-72 часов.

### Шаг 5: Yandex Webmaster setup

1. Открыть https://webmaster.yandex.ru
2. **Добавить сайт** → `https://brobrogid.ru`
3. **Подтвердить владение:** HTML-файл или мета-тег (выбрать что удобнее). Мета-тег — быстрее.
4. Передать мета-тег новому агенту аналогично Google.
5. После deploy — **Проверить**.
6. **Индексирование** → **Файлы Sitemap** → добавить sitemap URL.
7. **Индексирование** → **Скорость обхода** → установить на "Доверять Яндексу".

### Шаг 6: Проверить OG-превью (ручной)

Отправить ссылку на `https://brobrogid.ru/ossetia/kuhnya/osetinskie-pirogi/` в:

1. Telegram (самому себе в Saved Messages) — должна появиться карточка с картинкой, заголовком, описанием
2. WhatsApp — аналогично
3. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
4. LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

Все должны показывать правильные OG теги.

### Шаг 7: Мониторинг первых 24-72 часов

**День 1:**

- Проверить GSC → "Coverage" — должны появиться "Discovered" URLs
- Проверить Yandex Webmaster → "Статистика обхода" — робот начал ходить
- Watch `/var/log/nginx/brobrogid-site-access.log` на появление Googlebot/YandexBot

**День 2-3:**

- Первые страницы должны появиться в GSC как "Indexed"
- `site:brobrogid.ru` в Google — должны появиться первые страницы
- `host:brobrogid.ru` в Яндексе — то же

**Неделя 1:**

- GSC → Performance → первые impressions (не клики — до кликов 2-4 недели)
- Rich Results Test всё ещё валидирует

**Неделя 2-4:**

- Первые клики из поиска
- Coverage % растёт

## Rollback (если нужно)

**Сценарий:** Google начал индексировать, нашли критический баг, надо срочно откатить.

```bash
# 1. Снова закрыть nginx X-Robots-Tag (обратно то что сняли в Шаге 3)
ssh selectel "nano /etc/nginx/sites-available/brobrogid-site"
# Вернуть X-Robots-Tag noindex строки
# Заменить robots.txt на Disallow: /
nginx -t && systemctl reload nginx

# 2. На клиенте (передать новому агенту):
# SITE_UNDER_CONSTRUCTION = true
# npm run build && deploy

# 3. В Google Search Console:
# - Отправить запрос на "удаление URL" для проблемной страницы (temporary removal)
# - Или выставить Property → Settings → временно приостановить индексацию

# 4. В Yandex Webmaster:
# - Аналогично — "Переобход страниц" для конкретных URL если нужно

# ВАЖНО: Google держит индекс ~3-6 дней после noindex.
# Страницы исчезнут из выдачи, но не мгновенно.
```

## Типовые проблемы

### Страницы не появляются в GSC через неделю

**Причина:** sitemap не получен или Google не может обойти.

**Фикс:**
1. В GSC → Sitemaps → проверить статус. Если "Couldn't fetch" — URL неправильный или sitemap возвращает 404.
2. Проверить `curl https://brobrogid.ru/sitemap-index.xml` — должен быть валидный XML.
3. GSC → URL Inspection → ввести топ-URL → "Request Indexing" вручную.

### robots.txt всё ещё блокирует

**Причина:** Google кэширует robots.txt до 24 часов.

**Фикс:**
1. В GSC → Settings → Crawl stats → Open robots.txt Tester → Re-submit.
2. Или просто подождать сутки.

### Duplicate content warnings

**Причина:** Slug редиректы не работают (301 не возвращается), Google видит контент по двум URL.

**Фикс:** проверить `curl -I` старого URL — должен быть 301, не 200. Если 200 — nginx редиректы неправильны, вернуться к Sprint 6.

### Rich Results ошибки

**Причина:** Невалидный JSON-LD (отсутствуют required поля, rating out of range).

**Фикс:** https://search.google.com/test/rich-results — показывает конкретные ошибки. Передать новому агенту для фикса в шаблонах.

### Googlebot нашёл битую ссылку

**Причина:** крауш через пропущенный редирект, устаревший sitemap.

**Фикс:**
1. Добавить 301 редирект в nginx
2. Rebuild и deploy обоих сайтов
3. В GSC → URL Inspection → Request reindex

## Checklist перед запуском

- [ ] Все CRITICAL findings в error.md закрыты
- [ ] Lighthouse SEO 95+ на топ-5 страницах
- [ ] Rich Results Test валиден
- [ ] Sitemap curl check — все 200
- [ ] Оба сайта в одной версии данных (Supabase синхронизирована)
- [ ] Backup БД свежий (< 24 часа)
- [ ] DB rollback план готов (см. `09_workflows/rollback.md`)
- [ ] Google аккаунт открыт, готов к Search Console
- [ ] Yandex аккаунт открыт, готов к Webmaster
- [ ] Пользователь подтвердил готовность
- [ ] Новый агент в онлайне и готов сделать SITE_UNDER_CONSTRUCTION=false
- [ ] Archimag готов снять nginx noindex
- [ ] Запланировано время начала (желательно не на выходных и не ночью)

## Post-launch monitoring

**Первые 48 часов — пристальный мониторинг:**

- Uptime: `curl -o /dev/null -s -w "%{http_code}\n" https://brobrogid.ru/` раз в 10 минут (cron)
- `/var/log/nginx/brobrogid-site-access.log` — crawler activity
- Supabase API load — не должен вырасти (SSG всё предсгенерировано)
- DB connections — не должны расти (кроме rebuild при deploy)

**Первая неделя:**

- Ежедневный чек GSC → Coverage, Performance, Mobile Usability
- Ежедневный чек Yandex Webmaster → Статистика обхода

**Первый месяц:**

- Еженедельно: топ queries в GSC (появляются к концу первой недели)
- Выявлять страницы которые получают impressions но не клики → улучшать мета-теги
- Проверять что Core Web Vitals в зелёной зоне

## Related

- `../06_security/known_issues.md` — open security findings
- `../07_seo/robots_and_noindex.md` — детали noindex механизма
- `../09_workflows/rollback.md` — откат изменений
- `../09_workflows/deploy.md` — стандартный deploy
- `../02_database/backup_restore.md` — DB операции
