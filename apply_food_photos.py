#!/usr/bin/env python3
"""Copy chosen facade photos into project, resize to 1920px max."""
import os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("PIL not found, copying as-is")

OUT_DIR = r'C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois'
TMP1 = r'C:\Users\OSSBA\AppData\Local\Temp\food_photos'
TMP2 = r'C:\Users\OSSBA\AppData\Local\Temp\food_photos2'

REPLACEMENTS = [
    (os.path.join(TMP1, 'modern-shef_opt2.jpg'), os.path.join(OUT_DIR, 'modern-chef_gp.jpg')),
    (os.path.join(TMP2, 'bavariya_opt2.jpg'),    os.path.join(OUT_DIR, 'bavaria_gp.jpg')),
    (os.path.join(TMP2, 'limonchello_x9.jpg'),   os.path.join(OUT_DIR, 'limoncello_gp.jpg')),
    (os.path.join(TMP2, 'shaurmaniya_x4.jpg'),   os.path.join(OUT_DIR, 'shaurmanya_gp.jpg')),
]

def process(src, dst):
    if not os.path.exists(src):
        print(f"  MISSING: {src}")
        return
    if HAS_PIL:
        img = Image.open(src)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((1920, 1920), Image.LANCZOS)
        img.save(dst, 'JPEG', quality=88)
        size = os.path.getsize(dst) // 1024
        print(f"  OK: {os.path.basename(dst)} ({size}KB)")
    else:
        shutil.copy2(src, dst)
        size = os.path.getsize(dst) // 1024
        print(f"  Copied: {os.path.basename(dst)} ({size}KB)")

for src, dst in REPLACEMENTS:
    print(f"{os.path.basename(src)} -> {os.path.basename(dst)}")
    process(src, dst)

print("\nDone.")
