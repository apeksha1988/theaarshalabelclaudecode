# -*- coding: utf-8 -*-
"""Create small JPEG copies of every product's LEAD image for order emails.

Order line items store `images[0]` (the product's lead image, a .webp). Some
email clients — notably Outlook on Windows — don't render .webp, so each order
email references a `.jpg` sibling of that lead image instead. This script makes
those .jpg files from the local .webp/.png/.jpeg lead images.

Re-run it after adding or re-leading products:
    backend/.venv/Scripts/python.exe scripts/generate_email_jpgs.py
"""
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "frontend" / "public" / "images"
SNAPSHOT = ROOT / "frontend" / "src" / "data" / "productsSnapshot.json"
MAXPX = 400          # displayed ~56px; 400px stays crisp on retina, tiny file
QUALITY = 82


def email_jpg_name(path: str) -> str:
    """'/images/foo.webp' -> 'foo.jpg' (basename, extension forced to .jpg)."""
    base = path.split("/")[-1]
    return re.sub(r"\.(webp|png|jpe?g)$", ".jpg", base, flags=re.IGNORECASE)


def main():
    products = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    made, skipped, missing = 0, 0, []
    for p in products:
        imgs = p.get("images") or []
        if not imgs:
            continue
        lead = imgs[0]
        src = IMG_DIR / lead.split("/")[-1]
        if not src.exists():
            missing.append(lead)
            continue
        out = IMG_DIR / email_jpg_name(lead)
        if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
            skipped += 1
            continue
        im = Image.open(src).convert("RGB")
        w, h = im.size
        s = min(1.0, MAXPX / max(w, h))
        if s < 1:
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        im.save(out, "JPEG", quality=QUALITY, optimize=True)
        made += 1
    print(f"email jpgs: {made} created, {skipped} up-to-date, {len(missing)} missing sources")
    for m in missing:
        print("  MISSING:", m)


if __name__ == "__main__":
    main()
