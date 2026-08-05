import json

path = "public/content/reviews.json"

with open(path, "r", encoding="utf-8-sig") as f:
    reviews = json.load(f)

fixed = 0
for review in reviews:
    if review.get("isGenerated") == False:
        for field in ("text", "authorName"):
            val = review.get(field, "")
            if val:
                try:
                    decoded = val.encode("latin-1").decode("utf-8")
                    if decoded != val:
                        review[field] = decoded
                        fixed += 1
                except (UnicodeDecodeError, UnicodeEncodeError):
                    pass

with open(path, "w", encoding="utf-8") as f:
    json.dump(reviews, f, ensure_ascii=False, indent=2)

print(f"Исправлено полей: {fixed}")
