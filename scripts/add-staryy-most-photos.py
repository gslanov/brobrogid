from PIL import Image
import json, os, glob

src_dir = r"C:\Users\OSSBA\Desktop\СТАРЫЙ МОСТ"
out_dir = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois"
pois_path = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json"

src_files = sorted(glob.glob(os.path.join(src_dir, "*")))
print(f"Found {len(src_files)} files")

# Find next available number
existing = [f for f in os.listdir(out_dir) if f.startswith("staryy-most_p")]
used = set()
for f in existing:
    try:
        n = int(f.replace("staryy-most_p", "").replace(".webp", ""))
        used.add(n)
    except:
        pass

new_paths = []
i = 1
for src in src_files:
    while i in used:
        i += 1
    name = f"staryy-most_p{i}.webp"
    out = os.path.join(out_dir, name)
    try:
        img = Image.open(src)
        img.save(out, "WEBP", quality=88)
        new_paths.append(f"/images/pois/{name}")
        print(f"  {os.path.basename(src)} -> {name}")
        i += 1
    except Exception as e:
        print(f"  SKIP {os.path.basename(src)}: {e}")

with open(pois_path, encoding="utf-8") as f:
    data = json.load(f)

poi = next((p for p in data if p["id"] == "poi-073"), None)
poi["photos"] = poi.get("photos", []) + new_paths

with open(pois_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nTotal photos for poi-073: {len(poi['photos'])}")
