#!/usr/bin/env python3
"""Enrich POIs using Google Places API (New) with real data."""
import json
import os
import sys
import time
import urllib.request
import urllib.parse

API_KEY = "AIzaSyDwM86dOS0GTWsawBU6vvC4MsKEh3ISrUw"
PLACES_API = "https://places.googleapis.com/v1/places"
IMG_DIR = "images/pois"

os.makedirs(IMG_DIR, exist_ok=True)


def search_place(query, lat=43.03, lng=44.68):
    """Search for a place using Google Places Text Search."""
    url = f"{PLACES_API}:searchText"
    body = json.dumps({
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 50000.0
            }
        },
        "languageCode": "ru"
    }).encode()

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.types,places.editorialSummary"
    }

    try:
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            places = data.get("places", [])
            return places[0] if places else None
    except Exception as e:
        print(f"  Search error: {e}")
        return None


def download_place_photo(photo_name, filepath, max_width=1200):
    """Download a photo from Google Places Photos API."""
    url = f"https://places.googleapis.com/v1/{photo_name}/media?maxWidthPx={max_width}&key={API_KEY}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) > 5000:
                with open(filepath, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"  Photo download error: {e}")
    return False


def parse_hours(opening_hours):
    """Parse Google opening hours into our format."""
    if not opening_hours:
        return None

    periods = opening_hours.get("periods", [])
    weekdays = opening_hours.get("weekdayDescriptions", [])

    if not periods and not weekdays:
        return None

    day_map = {0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat"}
    hours = {}

    for period in periods:
        open_info = period.get("open", {})
        close_info = period.get("close", {})
        day = open_info.get("day", 0)

        open_time = f"{open_info.get('hour', 0):02d}:{open_info.get('minute', 0):02d}"
        close_time = f"{close_info.get('hour', 23):02d}:{close_info.get('minute', 0):02d}"

        day_key = day_map.get(day, "mon")
        hours[day_key] = f"{open_time}-{close_time}"

    return hours if hours else None


def enrich_poi(poi, place_data):
    """Apply Google Places data to POI."""
    if not place_data:
        return False

    changed = False

    # Location
    loc = place_data.get("location", {})
    if loc.get("latitude") and loc.get("longitude"):
        poi["location"]["lat"] = round(loc["latitude"], 6)
        poi["location"]["lng"] = round(loc["longitude"], 6)
        changed = True

    # Address
    addr = place_data.get("formattedAddress", "")
    if addr and len(addr) > 5:
        poi["location"]["address"]["ru"] = addr
        # Keep English as is or translate later
        changed = True

    # Phone
    phone = place_data.get("internationalPhoneNumber", "")
    if phone:
        poi["phone"] = phone
        changed = True

    # Website
    website = place_data.get("websiteUri", "")
    if website:
        poi["website"] = website
        changed = True

    # Rating
    rating = place_data.get("rating")
    if rating:
        poi["rating"] = rating
        changed = True

    review_count = place_data.get("userRatingCount")
    if review_count:
        poi["reviewCount"] = review_count
        changed = True

    # Hours
    hours = parse_hours(place_data.get("currentOpeningHours"))
    if hours:
        poi["hours"] = hours
        changed = True

    # Price level
    price_level = place_data.get("priceLevel")
    price_map = {"PRICE_LEVEL_FREE": 1, "PRICE_LEVEL_INEXPENSIVE": 1, "PRICE_LEVEL_MODERATE": 2, "PRICE_LEVEL_EXPENSIVE": 3, "PRICE_LEVEL_VERY_EXPENSIVE": 4}
    if price_level and price_level in price_map:
        poi["priceLevel"] = price_map[price_level]
        changed = True

    return changed


def main():
    with open("pois.json", "r") as f:
        pois = json.load(f)

    mode = sys.argv[1] if len(sys.argv) > 1 else "all"

    enriched = 0
    photos_downloaded = 0
    total = len(pois)

    for i, poi in enumerate(pois):
        name_ru = poi["name"]["ru"]
        name_en = poi["name"]["en"]
        cat = poi.get("category", "")
        slug = poi.get("slug", poi["id"])

        # Skip if already has phone + hours (already enriched)
        if mode == "missing" and poi.get("phone") and poi.get("hours"):
            continue

        # Build search query
        if cat == "food":
            query = f"{name_ru} ресторан Владикавказ"
        elif cat in ("nature", "culture"):
            query = f"{name_ru} Северная Осетия"
        elif cat == "attractions":
            query = f"{name_ru} Владикавказ"
        else:
            query = f"{name_ru} Владикавказ Осетия"

        print(f"[{i+1}/{total}] {name_ru} ({cat})")

        place = search_place(query, poi["location"].get("lat", 43.03), poi["location"].get("lng", 44.68))

        if place:
            if enrich_poi(poi, place):
                enriched += 1
                print(f"  -> Enriched (rating: {place.get('rating', '?')}, reviews: {place.get('userRatingCount', '?')})")

            # Download photo
            photos = place.get("photos", [])
            if photos:
                photo_name = photos[0].get("name", "")
                if photo_name:
                    filepath = os.path.join(IMG_DIR, f"{slug}_gp.jpg")
                    if not os.path.exists(filepath):
                        if download_place_photo(photo_name, filepath):
                            poi["photos"] = [f"/images/pois/{slug}_gp.jpg"]
                            photos_downloaded += 1
                            print(f"  -> Photo downloaded")
        else:
            print(f"  -> Not found on Google")

        time.sleep(0.3)  # Rate limiting

    with open("pois.json", "w") as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Enriched: {enriched}/{total}")
    print(f"Photos downloaded: {photos_downloaded}")


if __name__ == "__main__":
    main()
