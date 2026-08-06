#!/usr/bin/env python3
"""
BROBROGID content merge: JSON (public/content) -> Postgres (brobrogid).
Generates:
  00_pre_enums.sql        - enum additions (autocommit, NOT in the single transaction)
  01_merge.sql            - the full merge, to be run with -v ON_ERROR_STOP=1 --single-transaction
  verify.sql              - read-only post-checks
  unrecoverable_encoding.json - reviews whose mojibake could not be reversed (expected: empty)

Merge rules (final spec):
  - poi-080 (DB "Жар-птица") stays; JSON poi-080 "Bruges"  -> NEW id poi-317 (spec said poi-231,
    but poi-231/232 are already taken by other new POIs in the current pois.json -> first free ids used).
  - poi-106 (DB "HohlÆnd") stays; JSON poi-106 "Baltson"   -> NEW id poi-318.
  - rev-875/876/877 retargeted poi-080 -> poi-317.
  - poi-007: content update only, slug/slug_legacy/owner_id untouched (same for all overlap POIs).
  - 27 new reviews reference POIs that exist neither in DB nor in any JSON (poi-146,151,152,153,
    158,159,163,178,183) -> excluded from import to keep zero orphans; listed in orphan report.
  - Mojibake fix: ch->cp1251 byte (U+0080..U+00FF passthrough for unmappables like U+0098) -> utf-8.
"""
import json, sys, os

CONTENT = '/home/cosmo/SOFT/COSMO/BROBROGID/public/content'
OUT = '/home/cosmo/SOFT/COSMO/BROBROGID/supabase/migration'

BRUGES_NEW_ID = 'poi-317'
BALTSON_NEW_ID = 'poi-318'
RETARGET_REVIEWS = {'rev-875', 'rev-876', 'rev-877'}  # poi-080 -> BRUGES_NEW_ID

DB_POI_IDS = set(open('/tmp/db_ids.txt').read().split('===')[0].strip().split(','))
DB_REV_IDS = set(open('/tmp/rev_ids.txt').read().strip().split(','))

def q(s):
    """SQL text literal."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def jq(obj):
    """jsonb literal."""
    return q(json.dumps(obj, ensure_ascii=False)) + '::jsonb'

def arr(lst):
    if not lst:
        return "ARRAY[]::text[]"
    return 'ARRAY[' + ','.join(q(x) for x in lst) + ']::text[]'

def b(v):
    if isinstance(v, str):
        v = v.strip().lower() == 'true'
    return 'true' if v else 'false'

def fix_moji(s, failures, rid, field):
    """Reverse cp1251-mojibake. Returns fixed string or None if unrecoverable."""
    if s is None:
        return None
    out = bytearray()
    try:
        for ch in s:
            try:
                out += ch.encode('cp1251')
            except UnicodeEncodeError:
                if ord(ch) <= 0xFF:
                    out.append(ord(ch))  # e.g. U+0098 artifact -> raw byte 0x98
                else:
                    raise
        return out.decode('utf-8')
    except Exception as e:
        failures.append({'id': rid, 'field': field, 'raw': s, 'error': str(e)})
        return None

pois = json.load(open(f'{CONTENT}/pois.json'))
reviews = json.load(open(f'{CONTENT}/reviews.json'))
events = json.load(open(f'{CONTENT}/events.json'))
peaks = json.load(open(f'{CONTENT}/mountain-peaks.json'))['features']
transport = json.load(open(f'{CONTENT}/transport.json'))['routes']
emergency = json.load(open(f'{CONTENT}/emergency.json'))

# ---------------- 00_pre_enums.sql ----------------
pre = """-- Enum extensions required by JSON data. PG16 forbids using a value added by
-- ALTER TYPE ... ADD VALUE inside the same transaction, so these run autocommit
-- BEFORE the single-transaction merge. Additive + idempotent.
ALTER TYPE poi_category   ADD VALUE IF NOT EXISTS 'museums';
ALTER TYPE poi_category   ADD VALUE IF NOT EXISTS 'tours';
ALTER TYPE transport_type ADD VALUE IF NOT EXISTS 'tram';
ALTER TYPE cuisine_type   ADD VALUE IF NOT EXISTS 'italian';
"""
open(f'{OUT}/00_pre_enums.sql', 'w').write(pre)

# ---------------- 01_merge.sql ----------------
S = []
S.append("SET lock_timeout = '5s';")
S.append("SET statement_timeout = '10min';")
S.append("ALTER TABLE pois ADD COLUMN IF NOT EXISTS radius numeric;")

# ---- POIs ----
overlap = [p for p in pois if p['id'] in DB_POI_IDS and p['id'] not in ('poi-080', 'poi-106')]
new_pois = [p for p in pois if p['id'] not in DB_POI_IDS]
split = []
for p in pois:
    if p['id'] == 'poi-080':
        p2 = dict(p); p2['id'] = BRUGES_NEW_ID; split.append(p2)
    if p['id'] == 'poi-106':
        p2 = dict(p); p2['id'] = BALTSON_NEW_ID; split.append(p2)

assert len(overlap) == 78, len(overlap)   # 77 + poi-007 (spec said 79: written against older pois.json)
assert len(new_pois) == 71, len(new_pois)
assert len(split) == 2

def poi_common_cols(p):
    """content columns shared by UPDATE and INSERT"""
    return {
        'name': jq(p['name']),
        'category': q(p['category']) + '::poi_category',
        'subcategory': q(p.get('subcategory') or ''),
        'cuisine_type': (q(p['cuisineType']) + '::cuisine_type') if p.get('cuisineType') else 'NULL',
        'location': jq(p['location']),
        'description': jq(p['description']),
        'photos': arr(p.get('photos') or []),
        'rating': str(p.get('rating') if p.get('rating') is not None else 0),
        'hours': jq(p['hours']) if p.get('hours') else 'NULL',
        'phone': q(p.get('phone')) if p.get('phone') else 'NULL',
        'website': q(p.get('website')) if p.get('website') else 'NULL',
        'price_level': str(p['priceLevel']) if p.get('priceLevel') else 'NULL',
        'tags': arr(p.get('tags') or []),
        'is_chain': b(p.get('isChain', False)),
        'has_menu': b(p.get('hasMenu', False)),
        'has_delivery': b(p.get('hasDelivery', False)),
        'radius': str(p['radius']) if p.get('radius') is not None else 'NULL',
    }

S.append("\n-- === 1. Content update of %d overlapping POIs (slug/slug_legacy/owner_id/subscription_tier/visit_count kept from DB) ===" % len(overlap))
for p in overlap:
    c = poi_common_cols(p)
    sets = ', '.join(f"{k} = {v}" for k, v in c.items())
    S.append(f"UPDATE pois SET {sets}, review_count = {int(p.get('reviewCount') or 0)}, updated_at = now() WHERE id = {q(p['id'])};")

S.append("\n-- === 2. Insert %d new POIs (71 JSON-new + %s Bruges + %s Baltson) ===" % (len(new_pois) + 2, BRUGES_NEW_ID, BALTSON_NEW_ID))
for p in new_pois + split:
    c = poi_common_cols(p)
    cols = ['id', 'slug'] + list(c.keys()) + ['review_count', 'subscription_tier', 'visit_count']
    vals = [q(p['id']), q(p['slug'])] + list(c.values()) + [
        str(int(p.get('reviewCount') or 0)),
        q(p.get('subscriptionTier') or 'free') + '::subscription_tier',
        str(int(p.get('visitCount') or 0)),
    ]
    S.append(f"INSERT INTO pois ({', '.join(cols)}) VALUES ({', '.join(vals)});")

# ---- Reviews ----
enc_failures = []
new_revs = [r for r in reviews if r['id'] not in DB_REV_IDS]
assert len(new_revs) == 147, len(new_revs)

final_poi_ids = DB_POI_IDS | {p['id'] for p in new_pois} | {BRUGES_NEW_ID, BALTSON_NEW_ID}
orphan_revs = []
imported = []
for r in new_revs:
    tgt = BRUGES_NEW_ID if r['id'] in RETARGET_REVIEWS else r['targetId']
    if tgt not in final_poi_ids:
        orphan_revs.append((r['id'], tgt))
        continue
    text = fix_moji(r.get('text') or '', enc_failures, r['id'], 'text')
    author = fix_moji(r.get('authorName') or '', enc_failures, r['id'], 'authorName')
    if text is None or author is None:
        continue  # unrecoverable -> excluded, listed in unrecoverable_encoding.json
    imported.append(r['id'])
    S.append(f"INSERT INTO reviews (id, target_type, target_id, author_name, rating, text, date, is_generated) VALUES "
             f"({q(r['id'])}, {q(r['targetType'])}::review_target_type, {q(tgt)}, {q(author)}, "
             f"{float(r['rating'])}, {q(text)}, {q(r['date'])}::timestamptz, {b(r.get('isGenerated', False))});")

S.insert(len(S) - len(imported), "\n-- === 3. Insert %d new reviews (147 new minus %d whose target POI exists nowhere) ===" % (len(imported), len(orphan_revs)))

# ---- Emergency contacts (the 6 usefulContacts missing from DB) ----
S.append("\n-- === 4. Insert 6 emergency contacts (usefulContacts; DB already holds the other 22) ===")
next_id = 23
for u in emergency['usefulContacts']:
    ru = u['service']['ru']
    etype = 'ambulance' if 'скорая' in ru.lower() else 'police'  # enum has no neutral value; DB precedent: non-medical services stored as 'police'
    loc = {'lat': 0, 'lng': 0, 'address': u.get('address') or {'ru': '', 'en': ''}}
    S.append(f"INSERT INTO emergency_contacts (id, type, name, phone, location, is_24h) VALUES "
             f"('emergency-{next_id}', {q(etype)}::emergency_type, {jq(u['service'])}, {q(u['phone'])}, {jq(loc)}, true);")
    next_id += 1

# ---- Transport routes ----
S.append("\n-- === 5. Insert %d transport routes (route-010..074; fare/currency/frequency/hours have no DB columns -> not imported) ===" % len(transport))
for r in transport:
    S.append(f"INSERT INTO transport_routes (id, number, name, type, stops, schedule, color) VALUES "
             f"({q(r['id'])}, {q(str(r['number']))}, {jq(r['name'])}, {q(r['type'])}::transport_type, "
             f"{jq(r['stops'])}, {jq(r.get('schedule'))}, {q(r['color'])});")

# ---- New tables: events, mountain_peaks ----
S.append("""
-- === 6. New tables: events, mountain_peaks (RLS + anon read per 0008/0009 pattern) ===
CREATE TABLE IF NOT EXISTS public.events (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  end_date date,
  "time" text,
  image text NOT NULL DEFAULT '',
  venue text NOT NULL DEFAULT '',
  address text,
  price text,
  category text,
  source text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  fetched_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mountain_peaks (
  id serial PRIMARY KEY,
  name text NOT NULL,
  elevation_m int NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mountain_peaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS events_public_read ON public.events;
CREATE POLICY events_public_read ON public.events
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS peaks_public_read ON public.mountain_peaks;
CREATE POLICY peaks_public_read ON public.mountain_peaks
  FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.mountain_peaks TO anon, authenticated;
""")

S.append("-- events data (%d)" % len(events))
for e in events:
    S.append(f"INSERT INTO events (id, title, description, date, end_date, \"time\", image, venue, address, price, category, source, source_url, fetched_at) VALUES "
             f"({q(e['id'])}, {q(e['title'])}, {q(e.get('description') or '')}, {q(e['date'])}::date, "
             f"{q(e['endDate']) + '::date' if e.get('endDate') else 'NULL'}, {q(e['time']) if e.get('time') else 'NULL'}, "
             f"{q(e.get('image') or '')}, {q(e.get('venue') or '')}, {q(e['address']) if e.get('address') else 'NULL'}, "
             f"{q(e['price']) if e.get('price') is not None else 'NULL'}, {q(e['category']) if e.get('category') else 'NULL'}, "
             f"{q(e.get('source') or '')}, {q(e.get('sourceUrl') or '')}, {q(e['fetchedAt']) + '::timestamptz' if e.get('fetchedAt') else 'now()'}) "
             f"ON CONFLICT (id) DO NOTHING;")

S.append("-- mountain peaks data (%d)" % len(peaks))
for f in peaks:
    pr, geo = f['properties'], f['geometry']['coordinates']
    S.append(f"INSERT INTO mountain_peaks (name, elevation_m, lat, lng) VALUES "
             f"({q(pr['name'])}, {int(pr['ele'])}, {geo[1]}, {geo[0]});")

# ---- Recalc aggregates ----
S.append("""
-- === 7. Recalculate pois.review_count / rating from actual reviews rows (spec item 10) ===
UPDATE pois p SET
  review_count = (SELECT count(*)::int FROM reviews r
                  WHERE r.target_type = 'poi' AND r.target_id = p.id),
  rating = COALESCE((SELECT round(avg(r.rating), 2) FROM reviews r
                     WHERE r.target_type = 'poi' AND r.target_id = p.id), p.rating);
""")

sql = '\n'.join(S) + '\n'
open(f'{OUT}/01_merge.sql', 'w').write(sql)

# ---------------- unrecoverable_encoding.json ----------------
json.dump(enc_failures, open(f'{OUT}/unrecoverable_encoding.json', 'w'), ensure_ascii=False, indent=2)

# ---------------- verify.sql ----------------
open(f'{OUT}/verify.sql', 'w').write("""\\echo === counts ===
SELECT 'pois' t, count(*) FROM pois UNION ALL
SELECT 'reviews', count(*) FROM reviews UNION ALL
SELECT 'transport_routes', count(*) FROM transport_routes UNION ALL
SELECT 'emergency_contacts', count(*) FROM emergency_contacts UNION ALL
SELECT 'events', count(*) FROM events UNION ALL
SELECT 'mountain_peaks', count(*) FROM mountain_peaks UNION ALL
SELECT 'guides', count(*) FROM guides UNION ALL
SELECT 'menu_items', count(*) FROM menu_items ORDER BY 1;
\\echo === orphan reviews (must be 0 rows) ===
SELECT r.id, r.target_id FROM reviews r
WHERE r.target_type = 'poi' AND NOT EXISTS (SELECT 1 FROM pois p WHERE p.id = r.target_id);
\\echo === radius ===
SELECT count(*) AS pois_with_radius FROM pois WHERE radius IS NOT NULL;
\\echo === key POIs ===
SELECT id, slug, name->>'ru' AS name, category, radius FROM pois
WHERE id IN ('poi-007','poi-080','poi-106','poi-317','poi-318') ORDER BY id;
\\echo === retargeted reviews ===
SELECT id, target_id, author_name FROM reviews WHERE id IN ('rev-875','rev-876','rev-877');
\\echo === new tables readable ===
SELECT id, title, date FROM events ORDER BY date LIMIT 3;
SELECT id, name, elevation_m, lat, lng FROM mountain_peaks ORDER BY elevation_m DESC LIMIT 3;
\\echo === aggregates sample ===
SELECT id, rating, review_count FROM pois WHERE id IN ('poi-002','poi-080','poi-317','poi-143') ORDER BY id;
""")

print("pre_enums + merge generated")
print("overlap updates:", len(overlap))
print("new pois inserted:", len(new_pois) + 2)
print("reviews imported:", len(imported), "of 147 new")
print("orphan reviews excluded:", len(orphan_revs))
for oid, tgt in orphan_revs: print("  ", oid, "->", tgt)
print("encoding failures:", len(enc_failures))
print("events:", len(events), "peaks:", len(peaks), "routes:", len(transport))
