"""
Скачивает фото источников из Wikimedia, конвертирует в webp 800x600,
сохраняет в public/images/pois/, обновляет photos[] в pois.json
"""
import json, os, requests
from PIL import Image
from io import BytesIO

BASE = r"C:\Users\OSSBA\Desktop\бро\brobrogid"
IMAGES_DIR = os.path.join(BASE, "public", "images", "pois")
POIS_JSON = os.path.join(BASE, "public", "content", "pois.json")
SCRIPTS = os.path.join(BASE, "scripts")

os.makedirs(IMAGES_DIR, exist_ok=True)

# Читаем pois.json
with open(POIS_JSON, encoding="utf-8") as f:
    pois = json.load(f)

slug_map = {p["id"]: p["slug"] for p in pois}

# Мержим все 6 батчей
all_photos = {}
for i in range(1, 7):
    path = os.path.join(SCRIPTS, f"photo_springs_{i}.json")
    if not os.path.exists(path):
        print(f"photo_springs_{i}.json не найден — пропуск")
        continue
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    all_photos.update(data)

found = {k: v for k, v in all_photos.items() if v}
print(f"Найдено фото: {len(found)} / {len(all_photos)}")

HEADERS = {
    "User-Agent": "BrobrogidBot/1.0 (https://brobrogid.ru; slanovbv@gmail.com)"
}

saved = {}
for poi_id, info in found.items():
    url = info.get("url") if isinstance(info, dict) else None
    if not url:
        continue

    slug = slug_map.get(poi_id, poi_id)
    filename = f"{slug}_gp.webp"
    out_path = os.path.join(IMAGES_DIR, filename)

    if os.path.exists(out_path):
        print(f"SKIP {poi_id} — уже есть")
        saved[poi_id] = f"/images/pois/{filename}"
        continue

    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        r.raise_for_status()
        img = Image.open(BytesIO(r.content)).convert("RGB")
        img = img.resize((800, 600), Image.LANCZOS)
        img.save(out_path, "webp", quality=85)
        saved[poi_id] = f"/images/pois/{filename}"
        print(f"OK   {poi_id} → {filename}")
    except Exception as e:
        print(f"ERR  {poi_id}: {e}")

# Обновляем pois.json
updated = 0
for poi in pois:
    if poi["id"] in saved:
        photo_path = saved[poi["id"]]
        if photo_path not in poi.get("photos", []):
            poi["photos"] = [photo_path] + [p for p in poi.get("photos", []) if p != photo_path]
            updated += 1

with open(POIS_JSON, "w", encoding="utf-8") as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"\nСохранено: {len(saved)} фото, обновлено POI: {updated}")
