#!/usr/bin/env python3
"""Validate all content JSON files for BROBROGID."""
import json
import os
import sys

ERRORS = []
WARNINGS = []

def err(msg): ERRORS.append(msg)
def warn(msg): WARNINGS.append(msg)

def load_json(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        err(f"{path}: Invalid JSON - {e}")
        return None
    except FileNotFoundError:
        err(f"{path}: File not found")
        return None

def check_localized(obj, field_path):
    if not isinstance(obj, dict):
        err(f"{field_path}: not a dict")
        return False
    if not obj.get('ru'):
        err(f"{field_path}.ru: empty or missing")
        return False
    if not obj.get('en'):
        err(f"{field_path}.en: empty or missing")
        return False
    return True

def check_coords(lat, lng, field_path):
    # North Ossetia bounds (generous)
    if not (42.2 <= lat <= 43.5):
        warn(f"{field_path}: lat {lat} outside North Ossetia range [42.2, 43.5]")
    if not (43.3 <= lng <= 45.1):
        warn(f"{field_path}: lng {lng} outside North Ossetia range [43.3, 45.1]")

def validate_pois(pois):
    print("=== Validating POIs ===")
    ids = set()
    slugs = set()
    valid_cats = {'attractions','food','accommodation','nature','culture','shopping','nightlife','transport','activities','practical'}

    for p in pois:
        pid = p.get('id', '?')
        prefix = f"POI {pid}"

        # Unique ID
        if pid in ids:
            err(f"{prefix}: duplicate ID")
        ids.add(pid)

        # Unique slug
        slug = p.get('slug')
        if slug:
            if slug in slugs:
                warn(f"{prefix}: duplicate slug '{slug}'")
            slugs.add(slug)
        else:
            err(f"{prefix}: missing slug")

        # Name
        check_localized(p.get('name', {}), f"{prefix}.name")

        # Category
        cat = p.get('category')
        if cat not in valid_cats:
            err(f"{prefix}: invalid category '{cat}'")

        # Location
        loc = p.get('location', {})
        if loc:
            check_coords(loc.get('lat', 0), loc.get('lng', 0), f"{prefix}.location")
            check_localized(loc.get('address', {}), f"{prefix}.location.address")

        # Description
        desc = p.get('description', {})
        for level in ('short', 'medium', 'full'):
            d = desc.get(level, {})
            check_localized(d, f"{prefix}.description.{level}")
            # Check truncation
            for lang in ('ru', 'en'):
                text = d.get(lang, '')
                if text and not text[-1] in '.!?»)"':
                    warn(f"{prefix}.description.{level}.{lang}: may be truncated (ends with '{text[-1]}')")

        # Tags
        tags = p.get('tags', [])
        if len(tags) != len(set(tags)):
            warn(f"{prefix}: duplicate tags")
        if not tags:
            warn(f"{prefix}: no tags")

        # Food-specific
        if cat == 'food':
            if not p.get('cuisineType'):
                warn(f"{prefix}: food POI missing cuisineType")
            if not p.get('priceLevel'):
                warn(f"{prefix}: food POI missing priceLevel")
            if not p.get('hours'):
                warn(f"{prefix}: food POI missing hours")
            if not p.get('phone'):
                warn(f"{prefix}: food POI missing phone")

        # Photos
        if not p.get('photos'):
            warn(f"{prefix}: no photos")

    print(f"  Total: {len(pois)}, Unique IDs: {len(ids)}")
    cats = {}
    for p in pois:
        c = p.get('category', '?')
        cats[c] = cats.get(c, 0) + 1
    for c, n in sorted(cats.items()):
        print(f"    {c}: {n}")

    missing = valid_cats - set(cats.keys())
    if missing:
        warn(f"Missing categories: {missing}")

    return ids

def validate_tours(tours, guide_ids):
    print("=== Validating Tours ===")
    ids = set()
    for t in tours:
        tid = t.get('id', '?')
        prefix = f"Tour {tid}"

        if tid in ids:
            err(f"{prefix}: duplicate ID")
        ids.add(tid)

        check_localized(t.get('name', {}), f"{prefix}.name")
        check_localized(t.get('description', {}), f"{prefix}.description")

        gid = t.get('guideId')
        if gid and gid not in guide_ids:
            err(f"{prefix}: guideId '{gid}' not found in guides")

        if not t.get('meetingPoint'):
            warn(f"{prefix}: missing meetingPoint")
        if not t.get('route'):
            warn(f"{prefix}: missing route")

        price = t.get('price', 0)
        if price <= 0:
            warn(f"{prefix}: invalid price {price}")

    print(f"  Total: {len(tours)}")
    return ids

def validate_guides(guides):
    print("=== Validating Guides ===")
    ids = set()
    for g in guides:
        gid = g.get('id', '?')
        prefix = f"Guide {gid}"

        if gid in ids:
            err(f"{prefix}: duplicate ID")
        ids.add(gid)

        check_localized(g.get('name', {}), f"{prefix}.name")
        check_localized(g.get('bio', {}), f"{prefix}.bio")

        if not g.get('languages'):
            warn(f"{prefix}: no languages")
        if not g.get('specializations'):
            warn(f"{prefix}: no specializations")

    print(f"  Total: {len(guides)}")
    return ids

def validate_reviews(reviews, poi_ids, tour_ids, guide_ids):
    print("=== Validating Reviews ===")
    ids = set()
    target_map = {'poi': poi_ids, 'tour': tour_ids, 'guide': guide_ids}

    orphan_count = 0
    for r in reviews:
        rid = r.get('id', '?')
        if rid in ids:
            err(f"Review {rid}: duplicate ID")
        ids.add(rid)

        tt = r.get('targetType')
        tid = r.get('targetId')
        if tt in target_map:
            if tid not in target_map[tt]:
                orphan_count += 1

        if not r.get('text'):
            warn(f"Review {rid}: empty text")
        rating = r.get('rating', 0)
        if not (1 <= rating <= 5):
            warn(f"Review {rid}: invalid rating {rating}")

    print(f"  Total: {len(reviews)}, Orphaned refs: {orphan_count}")
    return ids

def validate_menu_items(items, poi_ids):
    print("=== Validating Menu Items ===")
    ids = set()
    orphan = 0
    pois_with_menu = set()

    for m in items:
        mid = m.get('id', '?')
        if mid in ids:
            err(f"MenuItem {mid}: duplicate ID")
        ids.add(mid)

        pid = m.get('poiId')
        if pid not in poi_ids:
            orphan += 1
        else:
            pois_with_menu.add(pid)

        if not m.get('price') or m['price'] <= 0:
            warn(f"MenuItem {mid}: invalid price")

    print(f"  Total: {len(items)}, POIs with menu: {len(pois_with_menu)}, Orphaned: {orphan}")

def validate_transport(data):
    print("=== Validating Transport ===")
    routes = data if isinstance(data, list) else data.get('routes', [])
    for r in routes:
        rid = r.get('id', '?')
        check_localized(r.get('name', {}), f"Route {rid}.name")
        stops = r.get('stops', [])
        if len(stops) < 2:
            warn(f"Route {rid}: fewer than 2 stops")
    print(f"  Total routes: {len(routes)}")

def validate_emergency(data):
    print("=== Validating Emergency ===")
    nums = data.get('emergencyNumbers', [])
    hospitals = data.get('hospitals', [])
    trauma = data.get('traumaCenters', [])
    pharma = data.get('pharmacies', [])
    print(f"  Emergency numbers: {len(nums)}, Hospitals: {len(hospitals)}, Trauma: {len(trauma)}, Pharmacies: {len(pharma)}")

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    pois = load_json('pois.json') or []
    tours = load_json('tours.json') or []
    guides = load_json('guides.json') or []
    reviews = load_json('reviews.json') or []
    menu = load_json('menu-items.json') or []
    transport = load_json('transport.json') or {}
    emergency = load_json('emergency.json') or {}

    guide_ids = validate_guides(guides)
    poi_ids = validate_pois(pois)
    tour_ids = validate_tours(tours, guide_ids)
    validate_reviews(reviews, poi_ids, tour_ids, guide_ids)
    validate_menu_items(menu, poi_ids)
    validate_transport(transport)
    validate_emergency(emergency)

    # Check photo files
    print("\n=== Photo Files ===")
    photo_refs = 0
    photo_exists = 0
    for p in pois:
        for photo in p.get('photos', []):
            photo_refs += 1
            path = photo.lstrip('/')
            if os.path.exists(path):
                photo_exists += 1
    print(f"  POI photo refs: {photo_refs}, Files exist: {photo_exists}")

    print(f"\n{'='*50}")
    print(f"ERRORS: {len(ERRORS)}")
    for e in ERRORS[:20]:
        print(f"  !! {e}")
    if len(ERRORS) > 20:
        print(f"  ... and {len(ERRORS)-20} more")

    print(f"\nWARNINGS: {len(WARNINGS)}")
    for w in WARNINGS[:30]:
        print(f"  ?? {w}")
    if len(WARNINGS) > 30:
        print(f"  ... and {len(WARNINGS)-30} more")

    return 1 if ERRORS else 0

if __name__ == '__main__':
    sys.exit(main())
