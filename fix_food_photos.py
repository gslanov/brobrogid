#!/usr/bin/env python3
"""Download multiple Google Places photos for problematic food POIs."""
import json, os, sys, time, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"
POIS_PATH = r'C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json'
OUT_DIR = r'C:\Users\OSSBA\AppData\Local\Temp\food_photos'
os.makedirs(OUT_DIR, exist_ok=True)

TARGETS = [
    'poi-072', 'poi-074', 'poi-075', 'poi-080', 'poi-082',
    'poi-085', 'poi-086', 'poi-089', 'poi-092', 'poi-098',
]

def search_place(query, lat, lng):
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 30000.0}},
        "languageCode": "ru"
    }).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.photos"
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

with open(POIS_PATH, encoding='utf-8') as f:
    pois = json.load(f)

for poi in pois:
    if poi['id'] not in TARGETS:
        continue
    name = poi['name']['ru']
    slug = poi['slug']
    lat = poi['location']['lat']
    lng = poi['location']['lng']
    print(f"\n{poi['id']} — {name}")

    try:
        place = search_place(f"{name} Владикавказ", lat, lng)
        if not place:
            print("  Not found")
            continue
        print(f"  Found: {place.get('displayName', {}).get('text', '?')}")
        photos = place.get('photos', [])
        print(f"  {len(photos)} photos available")
        # Download first 4 photos
        for i, ph in enumerate(photos[:4]):
            fname = f"{slug}_opt{i}.jpg"
            fpath = os.path.join(OUT_DIR, fname)
            if download_photo(ph['name'], fpath):
                print(f"  Saved: {fname} ({os.path.getsize(fpath)//1024}KB)")
            time.sleep(0.2)
    except Exception as e:
        print(f"  ERROR: {e}")
    time.sleep(0.5)

print("\nDone. Check:", OUT_DIR)
