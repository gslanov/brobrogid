"""
Улучшение фото через Gemini + AI-апскейл через super-image.
Использование:
  python scripts/gemini-enhance.py <путь_к_фото> "<инструкция>"

Минимальный выходной размер: 2560x1920 px.
Результат: имя_enhanced.jpg рядом с оригиналом.
"""

import sys
import io
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types

API_KEY = "AIzaSyCNZA7X99Liwl-7adsLDCE8_mdYFG_Vt88"
MIN_W, MIN_H = 2560, 1920

MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def get_size(data: bytes) -> tuple[int, int]:
    return Image.open(io.BytesIO(data)).size


def ai_upscale(data: bytes, ext: str) -> bytes:
    import tempfile, os
    from super_image import EdsrModel, ImageLoader
    import torch

    img = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = img.size

    scale = 2 if max(w, h) >= 1200 else 4
    print(f"[>>] AI upscale x{scale}: {w}x{h} -> {w*scale}x{h*scale}")

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

    # Если всё ещё меньше минимума — LANCZOS добивает остаток
    if rw < MIN_W or rh < MIN_H:
        scale2 = max(MIN_W / rw, MIN_H / rh)
        out_img = out_img.resize((int(rw * scale2), int(rh * scale2)), Image.LANCZOS)

    buf = io.BytesIO()
    fmt = "JPEG" if ext in (".jpg", ".jpeg") else ext.lstrip(".").upper()
    out_img.save(buf, format=fmt, quality=95)
    return buf.getvalue()


def enhance(image_path: str, instruction: str):
    path = Path(image_path)
    if not path.exists():
        print(f"[!] File not found: {path}")
        sys.exit(1)

    ext = path.suffix.lower()
    mime = MIME_TYPES.get(ext, "image/jpeg")

    print(f"[>>] Reading: {path.name}")
    image_bytes = path.read_bytes()
    orig_w, orig_h = get_size(image_bytes)
    print(f"[>>] Original: {orig_w}x{orig_h}")

    default_instruction = (
        "Enhance this photo: make colors vibrant and saturated, boost brightness and contrast, "
        "sharpen details and improve overall clarity. If the sky is grey or overcast, replace it "
        "with a clear sunny blue sky with natural light. Make the photo look like it was taken on "
        "a perfect sunny day. Keep all subjects and architecture realistic, do not add people or "
        "objects that weren't there."
    )
    combined = f"{default_instruction} Additional: {instruction}" if instruction else default_instruction
    full_instruction = f"{combined}. Output must be a high-quality, high-resolution image."

    client = genai.Client(api_key=API_KEY)
    print(f"[>>] Sending to Gemini...")

    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime),
            types.Part.from_text(text=full_instruction),
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"]
        ),
    )

    result_bytes = None
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            result_bytes = part.inline_data.data
            break

    if result_bytes is None:
        for part in response.candidates[0].content.parts:
            if part.text:
                print(f"[!] Gemini returned text:\n{part.text}")
        sys.exit(1)

    gem_w, gem_h = get_size(result_bytes)
    print(f"[>>] Gemini output: {gem_w}x{gem_h}")

    # Апскейл если нужно
    if gem_w < MIN_W or gem_h < MIN_H:
        result_bytes = ai_upscale(result_bytes, ext)

    final_w, final_h = get_size(result_bytes)
    out_path = path.parent / f"{path.stem}_enhanced{ext}"
    out_path.write_bytes(result_bytes)
    print(f"[OK] Saved: {out_path} ({final_w}x{final_h})")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python scripts/gemini-enhance.py <photo> ["<extra instruction>"]')
        sys.exit(1)

    extra = sys.argv[2] if len(sys.argv) >= 3 else ""
    enhance(sys.argv[1], extra)
