"""
Парсер афиши Владикавказа.
Источники: gorodzovet.ru/vladikavkaz/ + vkz.afishagoroda.ru/events
Запуск: python scripts/fetch-events.py
"""

import json
import re
import time
import unicodedata
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Установите зависимости: pip install requests beautifulsoup4")
    raise

OUTPUT = Path(__file__).parent.parent / "public" / "content" / "events.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text).strip("-")[:80]

def dedup_key(title: str, date: str) -> str:
    return f"{slugify(title)}_{date[:7]}"  # title + year-month

# ── gorodzovet.ru ──────────────────────────────────────────────────────────────

def parse_gorodzovet_date(text: str) -> str:
    """Приводит дату из gorodzovet к формату YYYY-MM-DD."""
    months = {
        "января": "01", "февраля": "02", "марта": "03", "апреля": "04",
        "мая": "05", "июня": "06", "июля": "07", "августа": "08",
        "сентября": "09", "октября": "10", "ноября": "11", "декабря": "12",
    }
    text = text.strip().lower()
    # формат: "23 мая 2025"
    m = re.search(r"(\d{1,2})\s+(\w+)\s+(\d{4})", text)
    if m:
        day, month_word, year = m.groups()
        month = months.get(month_word, "01")
        return f"{year}-{month}-{day.zfill(2)}"
    # формат: "23.05.2025"
    m = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", text)
    if m:
        day, month, year = m.groups()
        return f"{year}-{month}-{day}"
    return datetime.today().strftime("%Y-%m-%d")

def fetch_gorodzovet(max_pages: int = 5) -> list[dict]:
    base = "https://gorodzovet.ru/vladikavkaz/"
    events = []
    seen = set()

    for page in range(1, max_pages + 1):
        url = base if page == 1 else f"{base}?page={page}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                print(f"  gorodzovet page {page}: HTTP {resp.status_code}")
                break
            soup = BeautifulSoup(resp.text, "html.parser")

            # Карточки событий — ищем разные варианты разметки
            cards = (
                soup.select("article.event-card") or
                soup.select(".event-item") or
                soup.select(".events-list__item") or
                soup.select("[class*='event']") or
                soup.select("article")
            )

            if not cards:
                print(f"  gorodzovet page {page}: карточки не найдены")
                break

            page_count = 0
            for card in cards:
                title_el = card.find(["h2", "h3", "h4"]) or card.find("a")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                if not title or len(title) < 5:
                    continue

                # Дата
                date_el = card.find("time") or card.find(class_=re.compile(r"date|time", re.I))
                date_text = (date_el.get("datetime") or date_el.get_text(strip=True)) if date_el else ""
                date = parse_gorodzovet_date(date_text) if date_text else datetime.today().strftime("%Y-%m-%d")

                # Ссылка на событие
                link_el = card.find("a", href=True)
                source_url = urljoin("https://gorodzovet.ru", link_el["href"]) if link_el else url

                # Картинка
                img_el = card.find("img", src=True)
                image = urljoin("https://gorodzovet.ru", img_el["src"]) if img_el else ""

                # Место
                venue_el = card.find(class_=re.compile(r"venue|place|location|address", re.I))
                venue = venue_el.get_text(strip=True) if venue_el else "Владикавказ"

                # Цена
                price_el = card.find(class_=re.compile(r"price|cost|ticket", re.I))
                price = price_el.get_text(strip=True) if price_el else None

                # Описание
                desc_el = card.find(class_=re.compile(r"desc|text|summary|anon", re.I))
                description = desc_el.get_text(strip=True) if desc_el else ""

                key = dedup_key(title, date)
                if key in seen:
                    continue
                seen.add(key)

                events.append({
                    "title": title,
                    "date": date,
                    "image": image,
                    "venue": venue,
                    "price": price,
                    "description": description,
                    "sourceUrl": source_url,
                    "source": "gorodzovet",
                })
                page_count += 1

            print(f"  gorodzovet page {page}: {page_count} событий")
            if page_count == 0:
                break
            time.sleep(1)

        except Exception as e:
            print(f"  gorodzovet page {page}: ошибка — {e}")
            break

    return events


# ── afishagoroda.ru ────────────────────────────────────────────────────────────

def fetch_afishagoroda() -> list[dict]:
    url = "https://vkz.afishagoroda.ru/events"
    events = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  afishagoroda: HTTP {resp.status_code}")
            return events

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = (
            soup.select(".event-card") or
            soup.select(".announce-item") or
            soup.select(".events-item") or
            soup.select("article") or
            soup.select("[class*='event']")
        )

        for card in cards:
            title_el = card.find(["h2", "h3", "h4"]) or card.find("a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not title or len(title) < 5:
                continue

            date_el = card.find("time") or card.find(class_=re.compile(r"date|time", re.I))
            date_text = (date_el.get("datetime") or date_el.get_text(strip=True)) if date_el else ""
            date = parse_gorodzovet_date(date_text) if date_text else datetime.today().strftime("%Y-%m-%d")

            link_el = card.find("a", href=True)
            source_url = urljoin("https://vkz.afishagoroda.ru", link_el["href"]) if link_el else url

            img_el = card.find("img", src=True)
            image = urljoin("https://vkz.afishagoroda.ru", img_el["src"]) if img_el else ""

            venue_el = card.find(class_=re.compile(r"venue|place|location|address", re.I))
            venue = venue_el.get_text(strip=True) if venue_el else "Владикавказ"

            price_el = card.find(class_=re.compile(r"price|cost|ticket", re.I))
            price = price_el.get_text(strip=True) if price_el else None

            desc_el = card.find(class_=re.compile(r"desc|text|summary|anon", re.I))
            description = desc_el.get_text(strip=True) if desc_el else ""

            events.append({
                "title": title,
                "date": date,
                "image": image,
                "venue": venue,
                "price": price,
                "description": description,
                "sourceUrl": source_url,
                "source": "afishagoroda",
            })

        print(f"  afishagoroda: {len(events)} событий")
    except Exception as e:
        print(f"  afishagoroda: ошибка — {e}")

    return events


# ── Основной блок ──────────────────────────────────────────────────────────────

def main():
    print("Загрузка событий...")

    all_events: list[dict] = []
    seen_keys: set[str] = set()

    print("\n[1/2] gorodzovet.ru")
    for e in fetch_gorodzovet(max_pages=8):
        k = dedup_key(e["title"], e["date"])
        if k not in seen_keys:
            seen_keys.add(k)
            all_events.append(e)

    print("\n[2/2] afishagoroda.ru")
    for e in fetch_afishagoroda():
        k = dedup_key(e["title"], e["date"])
        if k not in seen_keys:
            seen_keys.add(k)
            all_events.append(e)

    # Генерируем ID и финализируем
    fetched_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    result = []
    for i, e in enumerate(all_events, 1):
        result.append({
            "id": f"evt-{i:04d}",
            "title": e["title"],
            "description": e.get("description", ""),
            "date": e["date"],
            "endDate": e.get("endDate"),
            "time": e.get("time"),
            "image": e.get("image", ""),
            "venue": e.get("venue", ""),
            "address": e.get("address"),
            "price": e.get("price"),
            "category": e.get("category"),
            "source": e["source"],
            "sourceUrl": e["sourceUrl"],
            "fetchedAt": fetched_at,
        })

    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nГотово. Сохранено событий: {len(result)} -> {OUTPUT}")

if __name__ == "__main__":
    main()
