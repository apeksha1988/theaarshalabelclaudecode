"""One-off: convert all product images to optimized WebP and rewrite references.

- Converts every image in frontend/public/images to .webp (quality 85, capped 1600px).
- Deletes the original (non-webp) files.
- Rewrites image paths in backend/products_seed.json (.png/.jpg -> .webp).
- Prints the old->new basename mapping so frontend source refs can be updated.

Originals remain recoverable via git history.
"""
import glob
import json
import os
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "frontend" / "public" / "images"
SEED_FILE = ROOT / "backend" / "products_seed.json"

MAX_DIM = 1600
QUALITY = 85

mapping = {}  # old filename -> new filename
total_before = 0
total_after = 0

for path in sorted(glob.glob(str(IMG_DIR / "*"))):
    p = Path(path)
    if p.suffix.lower() == ".webp":
        continue
    if p.suffix.lower() not in (".png", ".jpg", ".jpeg"):
        continue
    before = p.stat().st_size
    total_before += before

    im = Image.open(p)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    # cap longest side
    im.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)

    new_path = p.with_suffix(".webp")
    im.save(new_path, "WEBP", quality=QUALITY, method=6)
    after = new_path.stat().st_size
    total_after += after

    if p.suffix.lower() != ".webp":
        p.unlink()  # remove original
    mapping[p.name] = new_path.name
    print(f"{before/1048576:6.2f}MB -> {after/1048576:6.3f}MB  {p.name} -> {new_path.name}")

print(f"\nTOTAL: {total_before/1048576:.1f}MB -> {total_after/1048576:.1f}MB "
      f"({total_before/max(total_after,1):.1f}x smaller)")

# --- Rewrite products_seed.json ---
if SEED_FILE.exists():
    text = SEED_FILE.read_text(encoding="utf-8")
    new_text = re.sub(r'(/images/[^"\\]+?)\.(png|jpg|jpeg)', r'\1.webp', text, flags=re.IGNORECASE)
    if new_text != text:
        SEED_FILE.write_text(new_text, encoding="utf-8")
        print(f"\nUpdated {SEED_FILE.name} image references.")
    else:
        print(f"\nNo changes needed in {SEED_FILE.name}.")

# save mapping for the DB update script
(ROOT / "scripts" / "image_mapping.json").write_text(
    json.dumps(mapping, indent=2), encoding="utf-8"
)
print("Wrote scripts/image_mapping.json")
