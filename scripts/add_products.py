"""Add new product(s) to the live MongoDB (Atlas).

Reads MONGO_URL and DB_NAME from environment (never hardcode secrets).
Idempotent: safe to run more than once — each product is upserted by its
product_id, so a second run updates rather than duplicating.

Run it (PowerShell, from the project root):

    $env:MONGO_URL="<paste from Render>"; $env:DB_NAME="<paste from Render>"; & "backend/.venv/Scripts/python.exe" scripts/add_products.py
"""
import os
import sys
from datetime import datetime, timezone

from pymongo import MongoClient

NOW = datetime.now(timezone.utc)

PRODUCTS = [
    {
        "product_id": "prod_e1ff33acd5c0",
        "name": "The Aarsha's Meher Champagne Polki Choker Set",
        "description": (
            "An opulent statement choker featuring an intricate arrangement of "
            "champagne-toned and soft smoky stones, framed with sparkling crystal "
            "accents in a rich gold-tone setting. The layered geometric composition "
            "gives the piece a regal, vintage-inspired character while the matching "
            "oversized earrings complete the luxurious look. Perfect for weddings, "
            "festive occasions, sangeet celebrations and statement ethnic styling."
        ),
        "price": 735000,  # paise -> Rs 7,350
        "currency": "INR",
        "images": [
            "/images/meher-champagne-polki-choker-set.webp",
            "/images/meher-champagne-polki-choker-set-model-1.webp",
            "/images/meher-champagne-polki-choker-set-model-2.webp",
            "/images/meher-champagne-polki-choker-set-model-3.webp",
        ],
        "category": "premium_heritage",
        "product_type": "Statement Choker Necklace Set",
        "materials": (
            "Gold-tone Alloy Base, Polki-style Faceted Stones, Champagne and "
            "Smoky-Grey Stones, Clear Crystal/CZ Accent Stones, "
            "Antique-inspired Gold-tone Setting"
        ),
        "availability": "In Stock",
        "set_includes": "1 Choker Necklace + 1 Pair of Matching Statement Earrings",
        "created_at": NOW,
        "updated_at": NOW,
    },
    {
        "product_id": "prod_88e3773f9266",
        "name": "The Aarsha's Noorani Polki Kundan Floral Choker Set",
        "description": (
            "A regal floral choker featuring luminous uncut-style stones arranged "
            "in bold flower motifs and finished in a rich antique gold-tone setting. "
            "The statement centrepieces are surrounded by delicate sparkling accents, "
            "while matching floral earrings complete the look. An elegant choice for "
            "weddings, festive celebrations, mehendi, sangeet and traditional "
            "occasion wear."
        ),
        "price": 773500,  # paise -> Rs 7,735
        "currency": "INR",
        "images": [
            "/images/noorani-polki-kundan-floral-choker-set.webp",
            "/images/noorani-polki-kundan-floral-choker-set-model-1.webp",
            "/images/noorani-polki-kundan-floral-choker-set-model-2.webp",
            "/images/noorani-polki-kundan-floral-choker-set-model-3.webp",
        ],
        "category": "premium_heritage",
        "product_type": "Polki-Kundan Floral Choker Necklace Set",
        "materials": (
            "Gold-tone Alloy Base, Polki/Kundan-style Uncut Stones, "
            "Clear CZ/Crystal Accent Stones, Antique-Gold Finish"
        ),
        "availability": "In Stock",
        "set_includes": "1 Choker Necklace + 1 Pair of Matching Floral Statement Earrings",
        "created_at": NOW,
        "updated_at": NOW,
    },
]

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
if not MONGO_URL or not DB_NAME:
    sys.exit("Set MONGO_URL and DB_NAME env vars before running (copy them from Render).")

client = MongoClient(MONGO_URL)
products = client[DB_NAME]["products"]

for doc in PRODUCTS:
    pid = doc["product_id"]
    res = products.update_one({"product_id": pid}, {"$set": doc}, upsert=True)
    action = "inserted" if res.upserted_id else ("updated" if res.modified_count else "unchanged")
    print(f"{action}: {pid} -> {doc['name']}")

count = products.count_documents({})
print(f"Done. Catalog now has {count} products.")
client.close()
