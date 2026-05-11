#!/usr/bin/env python3
"""Download more Google Places photos for food POIs missing facade shots."""
import json, os, sys, time, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"
OUT_DIR = r'C:\Users\OSSBA\AppData\Local\Temp\food_photos2'
os.makedirs(OUT_DIR, exist_ok=True)

# slug -> (specific_query, lat, lng)
TARGETS = {
    "man-gal":       ("Man Гал ресторан ул. Ватутина 50 Владикавказ", 43.027992, 44.690978),
    "cuprum":        ("Cuprum ресторан гостиница Владикавказ Коцоева 75", 43.0268,   44.674),
    "zhar-ptitsa":   ("Жар-птица ресторан Дзусова 24 Владикавказ", 43.050839, 44.626077),
    "limonchello":   ("Лимончелло ресторан проспект Мира 45 Владикавказ", 43.033155, 44.67979),
    "notre-ville":   ("Notre Ville бар Гибизова 3 Владикавказ", 43.027837, 44.678495),
    "shaurmaniya":   ("Шаурмания кафе Владикавказская 25б Владикавказ", 43.046262, 44.634043),
    "gorka":         ("Горка кафе Гадиева 2 Владикавказ", 43.018002, 44.679539),
}

def search_place(query, lat, lng):
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 500.0}},
        "languageCode": "ru"
    }).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.photos"
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        places = data.get("places", [])
        return places[0] if places else None

def download_photo(photo_name, filepath):
    url = f"https://places.googleapis.com/v1/{photo_name}/media?maxWidthPx=1920&key={API_KEY}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        if len(data) > 5000:
            with open(filepath, "wb") as f:
                f.write(data)
            return True
    return False

for slug, (query, lat, lng) in TARGETS.items():
    print(f"\n{slug}")
    try:
        place = search_place(query, lat, lng)
        if not place:
            print("  Not found")
            continue
        name = place.get('displayName', {}).get('text', '?')
        addr = place.get('formattedAddress', '?')
        print(f"  Found: {name}")
        print(f"  Addr:  {addr}")
        photos = place.get('photos', [])
        print(f"  {len(photos)} photos available")
        # Download up to 10 photos
        for i, ph in enumerate(photos[:10]):
            fname = f"{slug}_x{i}.jpg"
            fpath = os.path.join(OUT_DIR, fname)
            if download_photo(ph['name'], fpath):
                print(f"  Saved: {fname} ({os.path.getsize(fpath)//1024}KB)")
            time.sleep(0.2)
    except Exception as e:
        print(f"  ERROR: {e}")
    time.sleep(0.5)

print("\nDone. Check:", OUT_DIR)
