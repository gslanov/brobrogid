#!/usr/bin/env python3
"""Create .webp versions for all recently added POI photos."""
from PIL import Image
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

POIS_DIR = r'C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois'

# Photos added this session that need WebP versions
TARGETS = [
    'bruges_gp.jpg',
    'bruges_int.jpg',
    'modern-chef_gp.jpg',
    'bavaria_gp.jpg',
    'limoncello_gp.jpg',
    'shaurmanya_gp.jpg',
    'dendrarium_gp.jpg',
]

for fname in TARGETS:
    src = os.path.join(POIS_DIR, fname)
    dst = os.path.join(POIS_DIR, fname.rsplit('.', 1)[0] + '.webp')
    if not os.path.exists(src):
        print(f"  MISSING: {fname}")
        continue
    img = Image.open(src)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    img.save(dst, 'WEBP', quality=85)
    print(f"  OK: {os.path.basename(dst)} ({os.path.getsize(dst)//1024}KB)")

print("Done.")
