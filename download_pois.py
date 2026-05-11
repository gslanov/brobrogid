import requests
from PIL import Image
import io
import time

IMAGES_DIR = r'C:\Users\OSSBA\Desktop\бро\brobrogid\public\images\pois'

HEADERS = {
    'User-Agent': 'BROBROGID/1.0 (travel guide app; slanovbv@gmail.com) requests/2.x',
    'Accept': 'image/jpeg,image/*',
}

def download_and_convert(url, name):
    print(f'Downloading {name}...')
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    print(f'  Got {len(r.content)} bytes, Content-Type: {r.headers.get("Content-Type")}')
    jpg_path = IMAGES_DIR + '\\' + name + '_gp.jpg'
    with open(jpg_path, 'wb') as f:
        f.write(r.content)
    img = Image.open(io.BytesIO(r.content))
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    webp_path = IMAGES_DIR + '\\' + name + '_gp.webp'
    img.save(webp_path, 'WEBP', quality=85)
    print(f'  OK: {name} size={img.size}')

# poi-195: Church of Prophet Elijah — thumbnail 1024px
download_and_convert(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/%D0%A5%D1%80%D0%B0%D0%BC_%D1%81%D0%B2%D1%8F%D1%82%D0%BE%D0%B3%D0%BE_%D0%98%D0%BB%D0%B8%D0%B8%2C_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BA%D0%B0%D0%B2%D0%BA%D0%B0%D0%B7.jpg/1024px-%D0%A5%D1%80%D0%B0%D0%BC_%D1%81%D0%B2%D1%8F%D1%82%D0%BE%D0%B3%D0%BE_%D0%98%D0%BB%D0%B8%D0%B8%2C_%D0%92%D0%BB%D0%B0%D0%B4%D0%B8%D0%BA%D0%B0%D0%B2%D0%BA%D0%B0%D0%B7.jpg',
    'church-of-prophet-elijah'
)

time.sleep(2)

# poi-196: Ossetian Drama Theatre — thumbnail 1200px
download_and_convert(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/%D0%98%D1%80%D0%BE%D0%BD_%D1%82%D0%B5%D0%B0%D1%82%D1%80.jpg/1200px-%D0%98%D1%80%D0%BE%D0%BD_%D1%82%D0%B5%D0%B0%D1%82%D1%80.jpg',
    'ossetian-drama-theatre'
)

print('All done!')
