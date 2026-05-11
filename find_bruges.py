#!/usr/bin/env python3
import json, sys, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"

def search_place(query, lat, lng, radius=500):
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": float(radius)}},
        "languageCode": "ru"
    }).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.photos,places.websiteUri,places.nationalPhoneNumber,places.types"
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

# Жар-птица была на ул. Генерала Дзусова, 24/1
result = search_place("Bruges ресторан Владикавказ", 43.050839, 44.626077, 1000)
places = result.get("places", [])
print(f"Found {len(places)} results")
for i, p in enumerate(places[:3]):
    print(f"\n--- {i+1} ---")
    print(f"Name: {p.get('displayName',{}).get('text','?')}")
    print(f"Addr: {p.get('formattedAddress','?')}")
    print(f"Rating: {p.get('rating','?')} ({p.get('userRatingCount','?')} reviews)")
    print(f"Price: {p.get('priceLevel','?')}")
    print(f"Types: {p.get('types',[][:5])}")
    print(f"Phone: {p.get('nationalPhoneNumber','?')}")
    print(f"Web: {p.get('websiteUri','?')}")
    hours = p.get('regularOpeningHours',{}).get('weekdayDescriptions',[])
    for h in hours:
        print(f"  {h}")
    photos = p.get('photos',[])
    print(f"Photos: {len(photos)}")
