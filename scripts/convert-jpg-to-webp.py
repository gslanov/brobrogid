from PIL import Image
import json, os, re

img_dir = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois"
pois_path = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json"

with open(pois_path, encoding="utf-8") as f:
    data = json.load(f)

converted = 0
missing = 0

for poi in data:
    new_photos = []
    for ph in poi.get("photos", []):
        if re.search(r'\.(jpg|jpeg)$', ph, re.IGNORECASE):
            fname = os.path.basename(ph)
            src = os.path.join(img_dir, fname)
            webp_name = re.sub(r'\.(jpg|jpeg)$', '.webp', fname, flags=re.IGNORECASE)
            dst = os.path.join(img_dir, webp_name)
            new_path = re.sub(r'\.(jpg|jpeg)$', '.webp', ph, flags=re.IGNORECASE)

            if os.path.exists(src):
                if not os.path.exists(dst):
                    img = Image.open(src).copy()
                    img.save(dst, "WEBP", quality=88)
                    converted += 1
                try:
                    os.remove(src)
                except Exception as e:
                    print(f"Cannot delete {src}: {e}")
                new_photos.append(new_path)
            else:
                print(f"MISSING: {src}")
                missing += 1
                new_photos.append(new_path)
        else:
            new_photos.append(ph)
    poi["photos"] = new_photos

with open(pois_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Converted: {converted}, Missing: {missing}")
