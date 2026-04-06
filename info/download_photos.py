#!/usr/bin/env python3
"""Download photos from Wikimedia Commons for POIs."""
import json
import os
import sys
import time
import urllib.request
import urllib.parse

WIKI_API = "https://commons.wikimedia.org/w/api.php"
IMG_DIR = "images/pois"

def search_wikimedia(query, limit=3):
    """Search Wikimedia Commons for images."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": "6",  # File namespace
        "srlimit": str(limit),
        "format": "json"
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "BrobrogidBot/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return [r["title"] for r in data.get("query", {}).get("search", [])]
    except Exception as e:
        print(f"  Search error: {e}")
        return []


def get_image_url(title):
    """Get direct image URL from Wikimedia file title."""
    params = {
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "iiurlwidth": "1200",
        "format": "json"
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "BrobrogidBot/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                info = page.get("imageinfo", [{}])[0]
                # Prefer thumbnail (1200px) over original
                thumb = info.get("thumburl", info.get("url"))
                mime = info.get("mime", "")
                if mime.startswith("image/") and thumb:
                    return thumb
    except Exception as e:
        print(f"  URL error: {e}")
    return None


def download_image(url, filepath):
    """Download image to filepath."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "BrobrogidBot/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


def main():
    os.makedirs(IMG_DIR, exist_ok=True)

    with open("pois.json", "r") as f:
        pois = json.load(f)

    # Search queries by category
    query_templates = {
        "nature": "{name_en} North Ossetia",
        "culture": "{name_en} Vladikavkaz",
        "attractions": "{name_en} Vladikavkaz",
        "food": "{name_ru} Владикавказ ресторан",
        "accommodation": "{name_en} hotel Vladikavkaz",
    }

    total = len(pois)
    downloaded = 0
    skipped = 0

    for i, poi in enumerate(pois):
        slug = poi.get("slug", poi["id"])
        cat = poi.get("category", "other")
        name_ru = poi["name"]["ru"]
        name_en = poi["name"]["en"]

        # Check if already has real photo
        existing = [p for p in poi.get("photos", []) if os.path.exists(p.lstrip("/"))]
        if existing:
            skipped += 1
            continue

        print(f"[{i+1}/{total}] {name_ru} ({cat})")

        template = query_templates.get(cat, "{name_en} North Ossetia")
        query = template.format(name_ru=name_ru, name_en=name_en)

        titles = search_wikimedia(query)
        if not titles:
            # Fallback: try Russian name
            titles = search_wikimedia(f"{name_ru} Осетия")

        if not titles:
            print(f"  No images found")
            continue

        img_urls = []
        for title in titles[:2]:  # Max 2 photos per POI
            url = get_image_url(title)
            if url:
                img_urls.append(url)

        poi_photos = []
        for j, url in enumerate(img_urls):
            ext = url.split(".")[-1].split("?")[0][:4].lower()
            if ext not in ("jpg", "jpeg", "png", "webp"):
                ext = "jpg"
            filename = f"{slug}_{j+1}.{ext}"
            filepath = os.path.join(IMG_DIR, filename)

            if download_image(url, filepath):
                poi_photos.append(f"/images/pois/{filename}")
                downloaded += 1
                print(f"  Downloaded: {filename}")

        if poi_photos:
            poi["photos"] = poi_photos

        time.sleep(0.5)  # Rate limiting

    # Save updated pois.json
    with open("pois.json", "w") as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)

    print(f"\nDone: {downloaded} photos downloaded, {skipped} skipped (already had photos)")


if __name__ == "__main__":
    main()
