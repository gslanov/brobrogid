---
title: Robots and Noindex — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 6
estimated_time: 30 min
---

# 🟢 ЗАДАЧА ДЛЯ SEO АГЕНТА — robots_and_noindex.md

> Заглушка с заданием.

## Что нужно сделать

Описать **полную defense-in-depth стратегию закрытости от индексации** на `brobrogid.ru` (3-4 уровня) и как её снять при запуске.

## Источники

1. **`docs/project/07_seo/launch_procedure.md`** — там уже описана процедура снятия
2. **Live проверка:**
   ```bash
   curl -sk https://brobrogid.ru/robots.txt
   curl -sIk https://brobrogid.ru/ | grep -i x-robots
   curl -sk https://brobrogid.ru/ | grep -i 'meta name="robots"'
   ```
3. **`SITE_UNDER_CONSTRUCTION` константа** в `src/data/site.ts` (brobrogid-site репо)
4. **Nginx config** на сервере — попроси archimag показать `/etc/nginx/sites-available/brobrogid-site`

## Структура документа

```markdown
---
title: Robots & Noindex — defense-in-depth
type: reference
audience: seo, brobrogid-site-agent, archimag
owner: <твой агент>
last_updated: 2026-04-07
---

# Defense-in-depth noindex стратегия

## Зачем

Сайт находится в pre-launch стадии — контент наполняется, URL могут меняться, мы не хотим чтобы Google индексировал unfinished версию. Решение — **закрыть в нескольких местах одновременно**, чтобы случайная ошибка в одном не открыла индексацию всему сайту.

## Уровни защиты

### Уровень 1: HTML meta tags

В `BaseLayout.astro` (или эквивалент) в `<head>` встроены:

\`\`\`html
<meta name="robots" content="noindex, nofollow" />
<meta name="googlebot" content="noindex, nofollow" />
<meta name="yandex" content="noindex, nofollow" />
\`\`\`

Контролируется константой `SITE_UNDER_CONSTRUCTION = true` в `src/data/site.ts`. При `false` мета-теги не emit-ятся.

### Уровень 2: HTTP header X-Robots-Tag

Nginx добавляет header в HTML responses:

\`\`\`nginx
location ~* \.html$ {
    add_header X-Robots-Tag "noindex, nofollow" always;
}
location ~ ^/([^.]*)?$ {
    add_header X-Robots-Tag "noindex, nofollow" always;
}
\`\`\`

Этот заголовок перекрывает meta tags в HTML — даже если HTML говорит "index", header говорит "noindex" и Google слушает header.

### Уровень 3: robots.txt

`robots.txt` запрещает crawling всего сайта. Может быть в двух местах:

**Файл `/var/www/brobrogid-site/robots.txt`:**
\`\`\`
User-agent: *
Disallow: /
\`\`\`

**ИЛИ nginx override (приоритетнее файла):**
\`\`\`nginx
location = /robots.txt {
    return 200 "User-agent: *\nDisallow: /\n";
    add_header Content-Type text/plain;
}
\`\`\`

Если есть nginx override — он используется, файл игнорируется. Проверь:
\`\`\`bash
curl -sk https://brobrogid.ru/robots.txt
\`\`\`

### Уровень 4: SITE_UNDER_CONSTRUCTION константа

Master switch в `src/data/site.ts`:

\`\`\`typescript
export const SITE_UNDER_CONSTRUCTION = true
\`\`\`

При `true`:
- BaseLayout эмитит noindex meta tags
- (возможно) sitemap не включает страницы или включает с noindex флагом — попроси brobrogid-site agent подтвердить
- (возможно) blog/landing pages пропускаются
- preflight в `scripts/deploy.sh` валидирует синхронизацию между этой константой и nginx snippets

При `false` (после launch):
- Мета-теги не эмитятся
- Sitemap содержит все страницы
- Сайт открыт

## Почему 3-4 уровня вместо 1

Defense-in-depth защищает от:
1. **Случайной правки кода** — если кто-то переключил константу но не задеплоил → nginx ещё блокирует
2. **Случайной правки nginx** — если кто-то снял header но не задеплоил front → meta всё ещё блокирует
3. **Кэширования robots.txt** — Google кэширует robots.txt до 24h, meta + header работают мгновенно
4. **Несогласованности файла и override** — если оба в конфликте, header выигрывает

## Текущий статус (2026-04-07)

| Уровень | Состояние |
|---|---|
| HTML meta tags | ✅ noindex (4 мета-тега в HTML) |
| X-Robots-Tag header | ✅ noindex (через nginx) |
| robots.txt | ✅ Disallow: / |
| SITE_UNDER_CONSTRUCTION | ✅ true |

Все 4 уровня согласованы. Сайт надёжно закрыт.

## Как снять (при launch)

См. `launch_procedure.md` для полного runbook. Кратко 4 действия:

1. Снять `SITE_UNDER_CONSTRUCTION = false` в `src/data/site.ts`, rebuild + deploy
2. Убрать `add_header X-Robots-Tag` в nginx config + reload
3. Обновить `robots.txt` (файл или nginx override) на `Allow: /` + sitemap reference
4. Подтвердить через curl что все 3 уровня сняты

## Особые case'ы

### app.brobrogid.ru — ВСЕГДА noindex

`app.brobrogid.ru` — это интерактивное PWA приложение, не SEO target. Должен оставаться `noindex` навсегда.

Защита:
- robots.txt: Disallow: /
- meta tags в `index.html`: noindex, nofollow, googlebot, yandex
- BASE_URL в SEO компоненте указывает на app.brobrogid.ru (canonical правильный)

### api.brobrogid.ru — не индексируется по факту

API возвращает JSON, не HTML — Google не будет индексировать. Никаких специальных мер не нужно.

## Open issues

Если найдёшь несогласованность между уровнями — отметь.

## Related

- `launch_procedure.md` — процедура открытия
- `../00_overview/architecture.md` — три домена
```

## Правила

1. Прогони все 3 curl команды и зафиксируй реальный output
2. Опиши именно текущее состояние, не идеальное
3. ~800-1200 слов

## После

Стандартно.
