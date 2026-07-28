"""Recompress referenced full-size product webp images in place.

Downsizes to <=1280px on the long side and re-encodes webp at quality 82,
which halves the largest jewellery photos with no visible quality loss.
Leaves the small ...-thumb.webp grid images untouched, and never writes a file
that would be larger than the original.

Run:  backend/.venv/Scripts/python.exe scripts/compress_product_images.py
"""
import json
import os
import io

from PIL import Image

MAXDIM = 1280
QUALITY = 82
SEED = "backend/products_seed.json"
PUBLIC = "frontend/public"


def referenced_full_images():
    d = json.load(open(SEED, encoding="utf-8"))
    paths = set()
    for p in d:
        for im in (p.get("images") or []):
            if isinstance(im, str) and im.endswith(".webp") and "-thumb" not in im:
                f = PUBLIC + im
                if os.path.exists(f):
                    paths.add(f)
    return sorted(paths)


def recompress(f):
    orig = os.path.getsize(f)
    img = Image.open(f)
    w, h = img.size
    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        rgba = img.convert("RGBA")
        bg.paste(rgba, mask=rgba.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")
    if max(w, h) > MAXDIM:
        r = MAXDIM / max(w, h)
        img = img.resize((round(w * r), round(h * r)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "WEBP", quality=QUALITY, method=6)
    data = buf.getvalue()
    if len(data) < orig:            # only overwrite if we actually saved bytes
        with open(f, "wb") as out:
            out.write(data)
        return orig, len(data)
    return orig, orig               # kept original


def main():
    paths = referenced_full_images()
    before = after = 0
    changed = 0
    for f in paths:
        o, n = recompress(f)
        before += o
        after += n
        if n < o:
            changed += 1
    print(f"Processed {len(paths)} images, recompressed {changed}.")
    print(f"Total: {before/1048576:.1f} MB -> {after/1048576:.1f} MB "
          f"(-{(1-after/before)*100:.0f}%)")


if __name__ == "__main__":
    main()
