from PIL import Image
import json, os, shutil

src_files = [
    r"C:\Users\OSSBA\Downloads\XXXL.jpg",
    r"C:\Users\OSSBA\Downloads\XXXL (1).jpg",
    r"C:\Users\OSSBA\Downloads\XXXL (2).JPG",
    r"C:\Users\OSSBA\Downloads\XXghXL.jpg",
]
out_dir = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois"
slug = "fyddzhyntae"
pois_path = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json"

names = []
for i, src in enumerate(src_files, start=2):
    name = f"{slug}_{i}.webp"
    out = os.path.join(out_dir, name)
    img = Image.open(src)
    w, h = img.size
    print(f"  {os.path.basename(src)} -> {w}x{h} -> {name}")
    img.save(out, "WEBP", quality=88)
    names.append(f"/images/pois/{name}")

print("\nUpdating pois.json...")
with open(pois_path, encoding="utf-8") as f:
    data = json.load(f)

poi = next((p for p in data if p["id"] == "poi-071"), None)
existing = poi.get("photos", [])
poi["photos"] = existing + names

with open(pois_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done. poi-071 photos: {poi['photos']}")
