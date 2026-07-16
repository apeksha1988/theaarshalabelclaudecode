"""Generate frontend/public/sitemap.xml from the live product catalog.

Re-run this whenever products are added/removed, then commit the sitemap:
    python scripts/generate_sitemap.py
"""
import json
import urllib.request
from datetime import date
from pathlib import Path

BASE = "https://www.theaarshalabel.com"
API = "https://api.theaarshalabel.com/api/products"
OUT = Path(__file__).resolve().parent.parent / "frontend" / "public" / "sitemap.xml"

STATIC_PAGES = [
    ("/", "weekly", "1.0"),
    ("/shop", "weekly", "0.9"),
    ("/contact", "monthly", "0.4"),
    ("/shipping-policy", "yearly", "0.2"),
    ("/refund-policy", "yearly", "0.2"),
    ("/privacy-policy", "yearly", "0.2"),
    ("/terms", "yearly", "0.2"),
]

def main():
    with urllib.request.urlopen(API, timeout=30) as r:
        products = json.load(r)

    today = date.today().isoformat()
    urls = []
    for path, freq, prio in STATIC_PAGES:
        urls.append(f"""  <url>
    <loc>{BASE}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{prio}</priority>
  </url>""")

    for p in products:
        urls.append(f"""  <url>
    <loc>{BASE}/product/{p['product_id']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(urls) + "\n</urlset>\n")
    OUT.write_text(xml, encoding="utf-8")
    print(f"Wrote {OUT} with {len(STATIC_PAGES)} pages + {len(products)} products")

if __name__ == "__main__":
    main()
