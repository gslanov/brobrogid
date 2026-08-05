from PIL import Image
import json, os, glob

src_dir = r"C:\Users\OSSBA\Desktop\ман гал"
out_dir = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois"
pois_path = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json"
slug = "man-gal"

# Convert new photos from desktop
src_files = sorted(glob.glob(os.path.join(src_dir, "*")))
print(f"Found {len(src_files)} source files")

new_names = []
i = 1
for src in src_files:
    name = f"{slug}_p{i}.webp"
    out = os.path.join(out_dir, name)
    try:
        img = Image.open(src)
        img.save(out, "WEBP", quality=88)
        new_names.append(f"/images/pois/{name}")
        print(f"  {os.path.basename(src)} -> {name}")
        i += 1
    except Exception as e:
        print(f"  SKIP {os.path.basename(src)}: {e}")

# Collect all existing webp for this slug
existing_webp = sorted(glob.glob(os.path.join(out_dir, f"{slug}_*.webp")))
existing_paths = [f"/images/pois/{os.path.basename(f)}" for f in existing_webp]
# Remove duplicates keeping order
seen = set()
all_photos = []
for p in existing_paths:
    if p not in seen:
        seen.add(p)
        all_photos.append(p)

print(f"\nTotal photos for poi-072: {len(all_photos)}")

with open(pois_path, encoding="utf-8") as f:
    data = json.load(f)

poi = next((p for p in data if p["id"] == "poi-072"), None)
poi["photos"] = all_photos

with open(pois_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("pois.json updated.")
