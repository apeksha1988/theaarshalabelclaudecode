# -*- coding: utf-8 -*-
"""Export the full live catalog to products_seed.json (canonical backup + seed source)."""
import json
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient

db = MongoClient("mongodb://localhost:27017")["test_database"]
prods = list(db.products.find({}, {"_id": 0}).sort("created_at", 1))
for p in prods:
    for k, v in list(p.items()):
        if isinstance(v, datetime):
            p[k] = v.isoformat()

out = Path(__file__).parent / "products_seed.json"
out.write_text(json.dumps(prods, ensure_ascii=False, indent=2), encoding="utf-8")
print("exported", len(prods), "products ->", out)
