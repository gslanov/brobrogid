#!/usr/bin/env python3
import json, os, sys, time, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"
OUT_DIR = r'C:\Users\OSSBA\AppData\Local\Temp\bruges_photos'
os.makedirs(OUT_DIR, exist_ok=True)

def search_place(query, lat, lng):
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 1000.0}},
        "languageCode": "ru"
    }).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.photos"
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read()).get("places", [])

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

places = search_place("Bruges ресторан Владикавказ", 43.050839, 44.626077)
if not places:
    print("Not found"); exit()

p = places[0]
loc = p.get('location', {})
print(f"Name: {p.get('displayName',{}).get('text')}")
print(f"Addr: {p.get('formattedAddress')}")
print(f"Lat:  {loc.get('latitude')}")
print(f"Lng:  {loc.get('longitude')}")
print(f"Rating: {p.get('rating')} ({p.get('userRatingCount')} reviews)")
print(f"Price: {p.get('priceLevel','?')}")
hours = p.get('regularOpeningHours',{}).get('weekdayDescriptions',[])
for h in hours: print(f"  {h}")

photos = p.get('photos', [])
print(f"\n{len(photos)} photos — downloading all...")
for i, ph in enumerate(photos[:10]):
    fname = f"bruges_{i}.jpg"
    fpath = os.path.join(OUT_DIR, fname)
    if download_photo(ph['name'], fpath):
        print(f"  Saved: {fname} ({os.path.getsize(fpath)//1024}KB)")
    time.sleep(0.2)

print("\nDone:", OUT_DIR)
