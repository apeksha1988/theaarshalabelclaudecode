"""One-off: rewrite product image paths in the live MongoDB to .webp.

Reads MONGO_URL and DB_NAME from environment (do NOT hardcode secrets).
Replaces any /images/*.png|.jpg|.jpeg with .webp in each product's images array.
"""
import os
import re
import sys

from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

if not MONGO_URL or not DB_NAME:
    sys.exit("Set MONGO_URL and DB_NAME env vars before running.")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
products = db["products"]

pat = re.compile(r"\.(png|jpg|jpeg)$", re.IGNORECASE)
changed = 0
total = 0
for doc in products.find({}):
    total += 1
    images = doc.get("images") or []
    new_images = [pat.sub(".webp", img) if isinstance(img, str) else img for img in images]
    if new_images != images:
        products.update_one({"_id": doc["_id"]}, {"$set": {"images": new_images}})
        changed += 1
        print(f"  {doc.get('name','?')}: {images} -> {new_images}")

print(f"\nScanned {total} products, updated {changed}.")
client.close()
