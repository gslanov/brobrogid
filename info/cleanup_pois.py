#!/usr/bin/env python3
"""Cleanup POIs: remove duplicates, fix tags, validate structure."""
import json
import sys

def main():
    with open('pois.json', 'r') as f:
        pois = json.load(f)

    print(f"Total POIs before cleanup: {len(pois)}")

    # Find duplicates by name
    seen_names = {}
    duplicates = []
    for p in pois:
        name = p['name']['ru']
        if name in seen_names:
            duplicates.append((p['id'], name, seen_names[name]))
        else:
            seen_names[name] = p['id']

    print(f"\nDuplicates found: {len(duplicates)}")
    for dup_id, name, orig_id in duplicates:
        print(f"  {dup_id} duplicates {orig_id}: {name}")

    # Remove duplicates (keep lower ID)
    dup_ids = {d[0] for d in duplicates}
    pois = [p for p in pois if p['id'] not in dup_ids]

    # Fix common issues
    issues = 0
    for p in pois:
        # Fix duplicate tags
        if len(p.get('tags', [])) != len(set(p.get('tags', []))):
            p['tags'] = list(dict.fromkeys(p['tags']))
            issues += 1

        # Fix truncated short descriptions
        short_ru = p.get('description', {}).get('short', {}).get('ru', '')
        if short_ru and not short_ru.endswith(('.', '!', '?', '»')):
            medium_ru = p.get('description', {}).get('medium', {}).get('ru', '')
            if medium_ru:
                # Truncate medium to ~100 chars at word boundary
                if len(medium_ru) > 100:
                    cut = medium_ru[:100].rfind(' ')
                    p['description']['short']['ru'] = medium_ru[:cut] + '...'
                else:
                    p['description']['short']['ru'] = medium_ru
            issues += 1

        short_en = p.get('description', {}).get('short', {}).get('en', '')
        if short_en and not short_en.endswith(('.', '!', '?', ')')):
            medium_en = p.get('description', {}).get('medium', {}).get('en', '')
            if medium_en:
                if len(medium_en) > 100:
                    cut = medium_en[:100].rfind(' ')
                    p['description']['short']['en'] = medium_en[:cut] + '...'
                else:
                    p['description']['short']['en'] = medium_en
            issues += 1

    print(f"Issues fixed: {issues}")
    print(f"Total POIs after cleanup: {len(pois)}")

    # Stats by category
    cats = {}
    for p in pois:
        cat = p.get('category', 'unknown')
        cats[cat] = cats.get(cat, 0) + 1
    print("\nBy category:")
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")

    # Check missing fields
    missing_hours = sum(1 for p in pois if 'hours' not in p and p['category'] in ('food', 'culture', 'shopping'))
    missing_phone = sum(1 for p in pois if not p.get('phone') and p['category'] in ('food', 'accommodation'))
    print(f"\nMissing hours (food/culture/shopping): {missing_hours}")
    print(f"Missing phone (food/accommodation): {missing_phone}")

    if '--fix' in sys.argv:
        with open('pois.json', 'w') as f:
            json.dump(pois, f, ensure_ascii=False, indent=2)
        print("\nSaved cleaned pois.json")

if __name__ == '__main__':
    main()
