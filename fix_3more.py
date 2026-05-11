#!/usr/bin/env python3
import json, os, sys, time, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"
OUT_DIR = r'C:\Users\OSSBA\AppData\Local\Temp\food_photos3'
os.makedirs(OUT_DIR, exist_ok=True)

TARGETS = {
    "dendrarium":  ("Ресторан Дендрариум Владикавказ дендрарий", 42.980004, 44.667592),
    "berdinberg":  ("Berdinberg пивной ресторан проспект Мира Владикавказ", 43.028405, 44.6805),
    "zhar-ptitsa": ("Жар-птица ресторан Дзусова 24 Владикавказ", 43.050839, 44.626077),
}

def search_place(query, lat, lng):
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 300.0}},
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
        print(f"  Found: {place.get('displayName',{}).get('text','?')}")
        print(f"  Addr:  {place.get('formattedAddress','?')}")
        photos = place.get('photos', [])
        print(f"  {len(photos)} photos available")
        for i, ph in enumerate(photos[:10]):
            fname = f"{slug}_p{i}.jpg"
            fpath = os.path.join(OUT_DIR, fname)
            if download_photo(ph['name'], fpath):
                print(f"  Saved: {fname} ({os.path.getsize(fpath)//1024}KB)")
            time.sleep(0.2)
    except Exception as e:
        print(f"  ERROR: {e}")
    time.sleep(0.5)

print("\nDone:", OUT_DIR)
