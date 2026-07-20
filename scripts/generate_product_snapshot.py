"""Generate frontend/src/data/productsSnapshot.json from the live catalog.

This snapshot ships inside the JS bundle so the shop/home pages can render
products INSTANTLY on a first visit — even while the Render backend is
cold-starting. Fresh data from the API replaces it as soon as it arrives.

Only the fields the product grid needs are included, to keep the bundle small.

Re-run after adding/removing products:
    python scripts/generate_product_snapshot.py
"""
import json
import urllib.request
from pathlib import Path

API = "https://api.theaarshalabel.com/api/products"
OUT = Path(__file__).resolve().parent.parent / "frontend" / "src" / "data" / "productsSnapshot.json"

# Fields needed by ProductCard + grid sorting/filtering (not full descriptions).
FIELDS = ["product_id", "name", "price", "currency", "images", "category", "product_type", "availability"]


def main():
    with urllib.request.urlopen(API, timeout=30) as r:
        products = json.load(r)

    slim = []
    for p in products:
        item = {k: p.get(k) for k in FIELDS if p.get(k) is not None}
        # only the first image is shown on cards
        if item.get("images"):
            item["images"] = item["images"][:1]
        slim.append(item)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(slim, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"Wrote {OUT} — {len(slim)} products, {kb:.1f} KB")


if __name__ == "__main__":
    main()
