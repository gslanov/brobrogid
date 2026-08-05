"""
Batch Gemini enhance + upscale for a list of files in public/images/pois/.
Usage: python scripts/batch-enhance.py [prefix1 prefix2 ...]
If no prefixes given — processes ALL files without a prefix filter.
Replaces originals in-place; originals backed up to public/images/pois/originals/
"""

import sys
import io
import os
import shutil
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types

API_KEY = "AIzaSyCNZA7X99Liwl-7adsLDCE8_mdYFG_Vt88"
MIN_W, MIN_H = 2560, 1920

POIS_DIR = Path(__file__).parent.parent / "public" / "images" / "pois"
ORIGINALS_DIR = POIS_DIR / "originals"

MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

DEFAULT_INSTRUCTION = (
    "Enhance this photo: make colors vibrant and saturated, boost brightness and contrast, "
    "sharpen details and improve overall clarity. If the sky is grey or overcast, replace it "
    "with a clear sunny blue sky with natural light. Make the photo look like it was taken on "
    "a perfect sunny day. Keep all subjects and architecture realistic, do not add people or "
    "objects that weren't there. Remove any watermarks, logos, or text overlays. "
    "Output must be a high-quality, high-resolution image."
)


def get_size(data: bytes) -> tuple[int, int]:
    return Image.open(io.BytesIO(data)).size


def ai_upscale(data: bytes, ext: str) -> bytes:
    import tempfile
    from super_image import EdsrModel, ImageLoader
    import torch

    img = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = img.size
    scale = 2 if max(w, h) >= 1200 else 4
    print(f"  [AI upscale x{scale}] {w}x{h} -> {w*scale}x{h*scale}")

    model = EdsrModel.from_pretrained("eugenesiow/edsr-base", scale=scale)
    model.eval()
    inputs = ImageLoader.load_image(img)
    with torch.no_grad():
        preds = model(inputs)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        ImageLoader.save_image(preds, tmp_path)
        out_img = Image.open(tmp_path).convert("RGB")
    finally:
        os.unlink(tmp_path)

    rw, rh = out_img.size
    if rw < MIN_W or rh < MIN_H:
        scale2 = max(MIN_W / rw, MIN_H / rh)
        out_img = out_img.resize((int(rw * scale2), int(rh * scale2)), Image.LANCZOS)

    buf = io.BytesIO()
    fmt = "JPEG" if ext in (".jpg", ".jpeg") else "WEBP"
    out_img.save(buf, format=fmt, quality=95)
    return buf.getvalue()


def enhance_file(path: Path) -> bool:
    ext = path.suffix.lower()
    mime = MIME_TYPES.get(ext, "image/jpeg")
    image_bytes = path.read_bytes()
    orig_w, orig_h = get_size(image_bytes)
    print(f"[>>] {path.name} ({orig_w}x{orig_h})")

    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime),
            types.Part.from_text(text=DEFAULT_INSTRUCTION),
        ],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )

    result_bytes = None
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            result_bytes = part.inline_data.data
            break

    if result_bytes is None:
        print(f"  [!] Gemini вернул текст, пропускаем")
        return False

    gem_w, gem_h = get_size(result_bytes)
    print(f"  [Gemini] {gem_w}x{gem_h}")

    if gem_w < MIN_W or gem_h < MIN_H:
        result_bytes = ai_upscale(result_bytes, ext)

    final_w, final_h = get_size(result_bytes)

    ORIGINALS_DIR.mkdir(exist_ok=True)
    shutil.copy2(path, ORIGINALS_DIR / path.name)
    path.write_bytes(result_bytes)
    print(f"  [OK] {final_w}x{final_h} — сохранено, оригинал в originals/")
    return True


def main():
    prefixes = sys.argv[1:] if len(sys.argv) > 1 else []

    files = sorted(POIS_DIR.glob("*.webp")) + sorted(POIS_DIR.glob("*.jpg"))
    if prefixes:
        files = [f for f in files if any(f.name.startswith(p) for p in prefixes)]

    print(f"Файлов к обработке: {len(files)}")
    ok, fail = 0, 0
    for f in files:
        try:
            if enhance_file(f):
                ok += 1
            else:
                fail += 1
        except Exception as e:
            print(f"  [ERR] {f.name}: {e}")
            fail += 1

    print(f"\nГотово: {ok} OK, {fail} ошибок")


if __name__ == "__main__":
    main()
