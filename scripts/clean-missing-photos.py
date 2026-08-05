import json, os

img_dir = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois"
pois_path = r"C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json"

on_disk = set(os.listdir(img_dir))

with open(pois_path, encoding="utf-8") as f:
    data = json.load(f)

removed = 0
for poi in data:
    before = poi.get("photos", [])
    after = [ph for ph in before if os.path.basename(ph) in on_disk]
    if len(after) < len(before):
        removed += len(before) - len(after)
    poi["photos"] = after

with open(pois_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Removed {removed} broken references. Done.")
