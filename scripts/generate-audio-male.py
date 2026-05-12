"""
Генерирует MP3-файлы для POI (attractions, culture, nature)
Голос: ru-RU-DmitryNeural (мужской, Microsoft Edge TTS)
Запуск: python scripts/generate-audio-male.py
"""
import asyncio
import json
import os
import sys
import edge_tts

VOICE = "ru-RU-DmitryNeural"
CATEGORIES = {"attractions", "culture", "nature", "springs"}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(SCRIPT_DIR, "..")
AUDIO_DIR = os.path.join(PROJECT_DIR, "public", "audio", "pois")
POIS_JSON = os.path.join(PROJECT_DIR, "public", "content", "pois.json")


async def generate(poi_id: str, text: str, out_path: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(out_path)


async def main() -> None:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    with open(POIS_JSON, encoding="utf-8") as f:
        pois = json.load(f)

    targets = [
        p for p in pois
        if p.get("category") in CATEGORIES
        and p.get("description", {}).get("full", {}).get("ru")
    ]

    total = len(targets)
    generated = 0
    skipped = 0

    force = "--force" in sys.argv

    for i, poi in enumerate(targets, 1):
        poi_id = poi["id"]
        text = poi["description"]["full"]["ru"]
        out_path = os.path.join(AUDIO_DIR, f"{poi_id}.mp3")

        if os.path.exists(out_path) and not force:
            print(f"[{i}/{total}] SKIP {poi_id}")
            skipped += 1
            continue

        try:
            await generate(poi_id, text, out_path)
            generated += 1
            print(f"[{i}/{total}] OK   {poi_id} — {poi['name']['ru']}")
        except Exception as e:
            print(f"[{i}/{total}] ERR  {poi_id}: {e}")

    print(f"\nГотово. Сгенерировано: {generated} / Пропущено: {skipped} / Всего: {total}")


if __name__ == "__main__":
    asyncio.run(main())
