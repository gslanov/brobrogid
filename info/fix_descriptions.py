#!/usr/bin/env python3
"""Fix truncated descriptions: rebuild short from medium, medium from full."""
import json

def is_truncated(text):
    if not text:
        return True
    return text[-1] not in '.!?»)"…'

def truncate_at_sentence(text, max_len):
    """Truncate text at sentence boundary, not exceeding max_len."""
    if len(text) <= max_len:
        return text
    # Find last sentence end before max_len
    for end_char in ['. ', '! ', '? ']:
        pos = text[:max_len].rfind(end_char)
        if pos > max_len // 3:  # At least 1/3 of max_len
            return text[:pos+1]
    # Fallback: cut at word boundary + ellipsis
    pos = text[:max_len-3].rfind(' ')
    if pos > 0:
        return text[:pos] + '...'
    return text[:max_len-3] + '...'

def fix_poi_descriptions(pois):
    fixed = 0
    for p in pois:
        desc = p.get('description', {})
        pid = p.get('id', '?')

        for lang in ('ru', 'en'):
            short_text = desc.get('short', {}).get(lang, '')
            medium_text = desc.get('medium', {}).get(lang, '')
            full_text = desc.get('full', {}).get(lang, '')

            # Fix full: if same as medium, try to expand
            # (can't auto-expand, but at least ensure it's not truncated)

            # Fix medium: if truncated, use full text trimmed to ~300 chars
            if is_truncated(medium_text) and full_text and not is_truncated(full_text):
                new_medium = truncate_at_sentence(full_text, 350)
                if new_medium != medium_text:
                    desc['medium'][lang] = new_medium
                    fixed += 1

            # If medium == full, trim medium to differentiate
            medium_text = desc.get('medium', {}).get(lang, '')
            if medium_text == full_text and len(full_text) > 200:
                desc['medium'][lang] = truncate_at_sentence(full_text, 300)
                fixed += 1

            # Fix short: if truncated, derive from medium
            medium_text = desc.get('medium', {}).get(lang, '')
            if is_truncated(short_text) and medium_text:
                new_short = truncate_at_sentence(medium_text, 120)
                if new_short != short_text:
                    desc['short'][lang] = new_short
                    fixed += 1

            # If short == medium, trim short
            short_text = desc.get('short', {}).get(lang, '')
            if short_text == medium_text and len(medium_text) > 100:
                desc['short'][lang] = truncate_at_sentence(medium_text, 120)
                fixed += 1

    return fixed

def main():
    with open('pois.json', 'r') as f:
        pois = json.load(f)

    print(f"Processing {len(pois)} POIs...")
    fixed = fix_poi_descriptions(pois)
    print(f"Fixed {fixed} description fields")

    with open('pois.json', 'w') as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)
    print("Saved pois.json")

if __name__ == '__main__':
    main()
