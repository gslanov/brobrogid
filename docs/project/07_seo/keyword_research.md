---
title: Keyword Research — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 1
estimated_time: 2-3 hours
---

# 🔴 ЗАДАЧА ДЛЯ SEO АГЕНТА — keyword_research.md

> **Это файл-заглушка с заданием.** Прочитай задание, выполни, замени содержимое.

## Что нужно сделать

Написать **полную документацию по семантическому ядру** проекта BROBROGID. Это reference документ для всех будущих агентов которые будут работать с контентом, SEO, новыми регионами.

## Источники данных (читай в этом порядке)

1. **`/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json`** — основной файл, 13 кластеров после очистки от Турции
2. **`/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.backup_20260407.json`** — версия до очистки (для diff)
3. **`/home/cosmo/SOFT/COSMO/BROMARKET/data/wordstat_searchvolume.json`** — сырые данные Wordstat
4. **`/home/cosmo/SOFT/COSMO/BROMARKET/SEO/SEO_AUDIT_brobrogid.md`** — внешний аудит, в нём есть таблица топ-кластеров
5. **`/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md`** — структура спроектирована из этих ключей

## Структура документа (обязательно следуй)

```markdown
---
title: Keyword Research — семантическое ядро BROBROGID
type: reference
audience: seo, content, brobrogid-site-agent
owner: <твой агент>
last_updated: 2026-04-07
---

# Семантическое ядро BROBROGID

## TL;DR

3-4 предложения: общий объём, главные кластеры, фокус.

## Источник данных

- Откуда собрано (Wordstat, Rush Analytics)
- Когда (даты)
- Какие фильтры применены
- Сколько было до очистки vs после

## Очистка от мусора

### "Алания Турция" — 268 ключей удалено

Объясни почему "алания" амбивалентен (Северная Осетия-Алания vs турецкая Аланья), какие маркеры использовались для фильтрации, что осталось.

### Другие исключения

Если есть.

## Кластеры (13 штук)

Для каждого кластера — секция с:

- Название
- Размер (число ключей)
- Суммарная частотность
- ТОП-10 запросов с числами
- Релевантность для BROBROGID (полная / частичная / низкая)
- Какие URL покрывают этот кластер
- Open opportunities (что не покрыто)

Кластеры (порядок из clusters_filtered.json):
1. история_культура
2. места
3. другое
4. еда_кухня
5. транспорт
6. ущелья_природа
7. отдых_проживание
8. туры
9. погода_когда
10. достопримечательности
11. маршруты
12. карты_навигация
13. фото_видео

## Топ-50 запросов по точной частотности

Таблица: запрос | частотность | кластер | целевой URL | sprint когда покрыт

## Conversion intent

Какие кластеры — горячая аудитория (готовы купить/поехать), какие — холодная (просто исследуют). Маркеры:

- Горячие: "тур в осетию", "москва владикавказ авиабилеты", "отель владикавказ"
- Тёплые: "что посмотреть владикавказ", "осетинские пироги москва"
- Холодные: "горы кавказа фото", "осетия на карте"

## Semantic gaps — что пропущено

Запросы которые есть в ядре но нет в нашем контенте. Список с приоритетами.

## Региональное расширение

Кратко: какие топонимы для будущих регионов уже встречаются (Кабарда, Дагестан, Чечня) — можно ли начать резервировать структуру.

## Methodology notes

- Как собирали (один раз через скрипты в `/home/cosmo/SOFT/COSMO/BROMARKET/`)
- Какие пайплайны существуют (`collect_wordstat.py`, `cluster_keywords.py`, `filter_keywords.py`)
- Как обновить (когда нужно)

## Related

- Список cross-references
```

## Конкретные требования

1. **Все числа — реальные**, не "приблизительно". Запусти Python если нужно посчитать:

   ```python
   import json
   with open('/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json') as f:
       data = json.load(f)
   for cluster, items in data.items():
       total = sum(item.get('displays', 0) for item in items)
       print(f"{cluster}: {len(items)} keys, {total:,} displays")
   ```

2. **Топ-10 по каждому кластеру** — не "важные запросы", а конкретные с цифрами

3. **Маппинг на URL** — для каждого топ-запроса укажи целевой URL на текущем сайте (`curl https://brobrogid.ru/sitemap-0.xml` или смотри `BRIEFING_sprint{1,2,3}.md`)

4. **Не предлагай новую URL структуру** — она уже зафиксирована в `ossetia-structure.md` и реализована

5. **Итоговый размер:** 1500-2500 слов

## После завершения

1. Удали этот блок "ЗАДАЧА ДЛЯ SEO АГЕНТА" целиком
2. Замени frontmatter:
   - `type: reference` (вместо `stub`)
   - `audience: seo, content, brobrogid-site-agent`
   - `owner: <твой агент>`
   - убрать `status: empty`, `priority`, `estimated_time`
3. Обнови `07_seo/README.md` — отметь файл как ✅ заполнен
4. Обнови `07_seo/TASKS.md` — отметь задачу 1 выполненной
5. Сообщи archimag через пользователя

## Координация

Если нужны дополнительные данные (например, текущие impressions из Google Search Console когда индексация откроется) — напиши в TASKS.md секцию "Open questions" и продолжай с тем что есть.
