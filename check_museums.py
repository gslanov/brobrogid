import json, base64, sys, os
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\OSSBA\Downloads\pois.json', encoding='utf-8') as f:
    data = json.load(f)

TMPW = r'C:\Users\OSSBA\AppData\Local\Temp'
for p in data:
    if p['id'] in ('poi-030', 'poi-031'):
        print(p['id'], p['name']['ru'], f"— {len(p['photos'])} фото")
        for i, ph in enumerate(p['photos']):
            if ph.startswith('data:'):
                ext = 'jpg' if 'jpeg' in ph else 'webp'
                fname = f"{p['id']}_photo{i}.{ext}"
                with open(os.path.join(TMPW, fname), 'wb') as f2:
                    f2.write(base64.b64decode(ph.split(',')[1]))
                print(f'  [{i}] base64 -> {fname}')
            else:
                print(f'  [{i}] {ph}')
