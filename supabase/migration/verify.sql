\echo === counts ===
SELECT 'pois' t, count(*) FROM pois UNION ALL
SELECT 'reviews', count(*) FROM reviews UNION ALL
SELECT 'transport_routes', count(*) FROM transport_routes UNION ALL
SELECT 'emergency_contacts', count(*) FROM emergency_contacts UNION ALL
SELECT 'events', count(*) FROM events UNION ALL
SELECT 'mountain_peaks', count(*) FROM mountain_peaks UNION ALL
SELECT 'guides', count(*) FROM guides UNION ALL
SELECT 'menu_items', count(*) FROM menu_items ORDER BY 1;
\echo === orphan reviews (must be 0 rows) ===
SELECT r.id, r.target_id FROM reviews r
WHERE r.target_type = 'poi' AND NOT EXISTS (SELECT 1 FROM pois p WHERE p.id = r.target_id);
\echo === radius ===
SELECT count(*) AS pois_with_radius FROM pois WHERE radius IS NOT NULL;
\echo === key POIs ===
SELECT id, slug, name->>'ru' AS name, category, radius FROM pois
WHERE id IN ('poi-007','poi-080','poi-106','poi-317','poi-318') ORDER BY id;
\echo === retargeted reviews ===
SELECT id, target_id, author_name FROM reviews WHERE id IN ('rev-875','rev-876','rev-877');
\echo === new tables readable ===
SELECT id, title, date FROM events ORDER BY date LIMIT 3;
SELECT id, name, elevation_m, lat, lng FROM mountain_peaks ORDER BY elevation_m DESC LIMIT 3;
\echo === aggregates sample ===
SELECT id, rating, review_count FROM pois WHERE id IN ('poi-002','poi-080','poi-317','poi-143') ORDER BY id;
