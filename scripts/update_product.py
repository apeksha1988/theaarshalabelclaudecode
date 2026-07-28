"""Update fields on a single product in the live MongoDB.

Reads MONGO_URL and DB_NAME from environment (do NOT hardcode secrets).
Edit UPDATES below (product_id -> {field: value}) then run:

    MONGO_URL="..." DB_NAME="..." python scripts/update_product.py
"""
import os
import sys

from pymongo import MongoClient

# product_id -> fields to $set
UPDATES = {
    "prod_9b9f071280cc": {
        "name": "The Aarsha's Meher Crystal Necklace Set",
        "product_type": "Necklace Set with Matching Drop Earrings",
        "description": (
            "A delicate Polki-inspired necklace featuring a graceful row of "
            "pear-shaped stones accented with sparkling crystal clusters and an "
            "elegant antique gold finish. The symmetrical design creates a refined "
            "neckline silhouette, while the matching drop earrings add timeless "
            "charm. Lightweight yet luxurious, this set is perfect for weddings, "
            "festive celebrations, and sophisticated evening styling."
        ),
    },
}

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
if not MONGO_URL or not DB_NAME:
    sys.exit("Set MONGO_URL and DB_NAME env vars before running.")

client = MongoClient(MONGO_URL)
products = client[DB_NAME]["products"]

for pid, fields in UPDATES.items():
    res = products.update_one({"product_id": pid}, {"$set": fields})
    print(f"{pid}: matched={res.matched_count} modified={res.modified_count} -> {fields.get('name')}")

client.close()
