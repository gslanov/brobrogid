import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:\Users\OSSBA\Desktop\бро\brobrogid\public\content\pois.json', encoding='utf-8') as f:
    data = json.load(f)
food = [p for p in data if p['category'] == 'food']
print(f'Total food POIs: {len(food)}')
for p in food:
    photos = p.get('photos', [])
    print(f"{p['id']} | {p['slug']} | {p['name']['ru']}")
    for ph in photos:
        exists = os.path.exists(r'C:\Users\OSSBA\Desktop\бро\brobrogid\public' + ph.replace('/', '\\'))
        print(f'  {"OK" if exists else "MISSING"} {ph}')
