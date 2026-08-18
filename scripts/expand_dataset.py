"""
expand_dataset.py
=================
Downloads multiple free e-commerce datasets (no Kaggle auth required)
and merges them with the existing products.json.

Usage:
    python scripts/expand_dataset.py

Requirements:
    pip install requests pandas tqdm datasets huggingface_hub

Sources used:
- Amazon Products 2023 (HuggingFace — free, no auth)
- Flipkart Products (public CSV on GitHub)
- Fashion Products metadata (HuggingFace)
"""

import json
import os
import re
import sys
import uuid
from pathlib import Path

# ── 1. Ensure dependencies ────────────────────────────────────────────────────
def install_if_missing(pkg):
    try:
        __import__(pkg.split('[')[0].replace('-', '_'))
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg, '-q'])

for dep in ['requests', 'pandas', 'tqdm', 'datasets']:
    install_if_missing(dep)

import requests
import pandas as pd
from tqdm import tqdm

# ── 2. Paths ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
EXISTING_DATA = ROOT / 'data' / 'products.json'
OUTPUT_DATA = ROOT / 'data' / 'products_v2.json'
CACHE_DIR = ROOT / 'data' / '_cache'
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ── 3. Helpers ────────────────────────────────────────────────────────────────
def clean_price(val):
    """Returns float price from messy string/number, or None."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        cleaned = re.sub(r'[^\d.]', '', str(val))
        f = float(cleaned)
        return round(f, 2) if f > 0 else None
    except Exception:
        return None

def clean_rating(val):
    try:
        r = float(str(val).replace(',', '.'))
        return round(min(5.0, max(0.0, r)), 2)
    except Exception:
        return 4.0

def clean_reviews(val):
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return 0
    try:
        cleaned = re.sub(r'[^\d]', '', str(val))
        return int(cleaned) if cleaned else 0
    except Exception:
        return 0

def make_product_id(prefix, idx):
    return f"{prefix}_{str(idx).zfill(5)}"

def normalize_product(product_id, name, category, description,
                       actual_price, discounted_price, discount_pct,
                       rating, num_reviews, img_link, source):
    """Returns a dict matching the unified schema."""
    return {
        "product_id": product_id,
        "name": str(name)[:200].strip() if name else "Unknown Product",
        "category": str(category).strip() if category else "General",
        "description": str(description)[:500].strip() if description else "",
        "actual_price": actual_price,
        "discounted_price": discounted_price,
        "discount_percentage": discount_pct,
        "rating": rating,
        "num_reviews": num_reviews,
        "img_link": str(img_link).strip() if img_link and str(img_link).startswith('http') else "",
        "product_link": "",
        "source": source,
    }

# ── 4. Load existing dataset ───────────────────────────────────────────────────
print("📦 Loading existing products.json …")
with open(EXISTING_DATA, 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Re-normalize existing products to unified schema
normalized_existing = []
for p in existing:
    a_price = clean_price(p.get('actual_price') or p.get('price'))
    d_price = clean_price(p.get('discounted_price') or p.get('price'))
    normalized_existing.append(normalize_product(
        product_id=p.get('product_id', make_product_id('AMZ', len(normalized_existing))),
        name=p.get('name') or p.get('product_name'),
        category=p.get('category', 'Electronics'),
        description=p.get('about_product') or p.get('description', ''),
        actual_price=a_price,
        discounted_price=d_price,
        discount_pct=p.get('discount_percentage'),
        rating=clean_rating(p.get('rating', 4.0)),
        num_reviews=clean_reviews(p.get('num_reviews') or p.get('rating_count')),
        img_link=p.get('img_link', ''),
        source='amazon_india',
    ))
print(f"  ✅ Existing: {len(normalized_existing):,} products")

# ── 5. Source A: Amazon Products Dataset via HuggingFace ──────────────────────
amazon_products = []
try:
    from datasets import load_dataset
    print("\n🤗 Loading Amazon Products 2023 from HuggingFace (streaming) …")
    # Category slices available: "All_Beauty", "Clothing_Shoes_and_Jewelry",
    # "Sports_and_Outdoors", "Books", "Toys_and_Games", "Pet_Supplies"
    TARGET_CATEGORIES = [
        ("All_Beauty", "Beauty & Personal Care", 1500),
        ("Clothing_Shoes_and_Jewelry", "Fashion", 2000),
        ("Sports_and_Outdoors", "Sports & Outdoors", 1500),
        ("Books", "Books", 1000),
        ("Toys_and_Games", "Toys & Games", 800),
        ("Pet_Supplies", "Pet Supplies", 600),
    ]

    for hf_name, cat_label, limit in TARGET_CATEGORIES:
        try:
            print(f"   ↳ {hf_name} (max {limit}) …", end=" ", flush=True)
            ds = load_dataset(
                "McAuley-Lab/Amazon-Reviews-2023",
                f"raw_meta_{hf_name}",
                split="full",
                streaming=True,
                trust_remote_code=True,
            )
            count = 0
            for item in ds:
                if count >= limit:
                    break
                title = item.get('title', '').strip()
                if not title or len(title) < 5:
                    continue
                price = clean_price(item.get('price'))
                if not price:
                    continue
                features = item.get('features', [])
                desc = ' '.join(features[:3]) if features else item.get('description', [''])[0] if item.get('description') else ''
                imgs = item.get('images', {})
                img_url = ''
                if imgs:
                    hi = imgs.get('hi_res') or imgs.get('large') or imgs.get('thumb')
                    if hi and isinstance(hi, list) and len(hi) > 0:
                        img_url = hi[0] or ''

                amazon_products.append(normalize_product(
                    product_id=make_product_id('AMZ23', len(amazon_products)),
                    name=title,
                    category=cat_label,
                    description=desc,
                    actual_price=price,
                    discounted_price=round(price * 0.9, 2),
                    discount_pct='10%',
                    rating=clean_rating(item.get('average_rating', 4.2)),
                    num_reviews=clean_reviews(item.get('rating_number', 0)),
                    img_link=img_url,
                    source='amazon_2023',
                ))
                count += 1
            print(f"✅ {count}")
        except Exception as e:
            print(f"⚠️  Skipped ({e})")
    print(f"  ✅ Amazon 2023 total: {len(amazon_products):,} products")
except Exception as e:
    print(f"  ⚠️  HuggingFace unavailable: {e}")

# ── 6. Source B: Flipkart Products (public GitHub CSV) ───────────────────────
flipkart_products = []
FLIPKART_URL = "https://raw.githubusercontent.com/shivamkumar48/flipkart-product-dataset/main/flipkart_com-ecommerce_sample.csv"
cache_file = CACHE_DIR / "flipkart.csv"
try:
    print("\n🛍️  Loading Flipkart dataset …")
    if not cache_file.exists():
        print("   ↳ Downloading …", end=" ", flush=True)
        r = requests.get(FLIPKART_URL, timeout=30)
        r.raise_for_status()
        cache_file.write_bytes(r.content)
        print("✅")
    else:
        print("   ↳ Using cached file")

    df = pd.read_csv(cache_file, on_bad_lines='skip')
    df = df.dropna(subset=['product_name'])
    df = df.sample(min(3000, len(df)), random_state=42)

    for i, (_, row) in enumerate(df.iterrows()):
        name = str(row.get('product_name', '')).strip()
        if not name or len(name) < 5:
            continue
        cat_raw = str(row.get('product_category_tree', 'Electronics')).strip()
        # e.g. ["Electronics >> Mobiles >> ..."] → "Electronics"
        cat = cat_raw.strip('[]"').split('>>')[0].strip() if '>>' in cat_raw else cat_raw[:40]
        retail = clean_price(row.get('retail_price'))
        disc = clean_price(row.get('discounted_price') or row.get('selling_price'))
        if not (retail or disc):
            continue

        flip_img = str(row.get('image', '')).strip()
        img = flip_img if flip_img.startswith('http') else ''

        disc_pct = ''
        if retail and disc and retail > disc:
            disc_pct = f"{round((1 - disc / retail) * 100)}%"

        flipkart_products.append(normalize_product(
            product_id=make_product_id('FLP', i),
            name=name,
            category=f"Flipkart | {cat}",
            description=str(row.get('description', ''))[:400],
            actual_price=retail or disc,
            discounted_price=disc or retail,
            discount_pct=disc_pct,
            rating=clean_rating(row.get('overall_rating', 4.1)),
            num_reviews=clean_reviews(row.get('rating_count', 0)),
            img_link=img,
            source='flipkart',
        ))
    print(f"  ✅ Flipkart: {len(flipkart_products):,} products")
except Exception as e:
    print(f"  ⚠️  Flipkart skipped: {e}")

# ── 7. Source C: Fashion Products (public dataset from GitHub) ────────────────
fashion_products = []
FASHION_URL = "https://raw.githubusercontent.com/amankharwal/Website-data/master/fashion.csv"
cache_fashion = CACHE_DIR / "fashion.csv"
try:
    print("\n👗 Loading Fashion dataset …")
    if not cache_fashion.exists():
        print("   ↳ Downloading …", end=" ", flush=True)
        r = requests.get(FASHION_URL, timeout=30)
        r.raise_for_status()
        cache_fashion.write_bytes(r.content)
        print("✅")
    else:
        print("   ↳ Using cached file")

    df = pd.read_csv(cache_fashion, on_bad_lines='skip')
    df = df.dropna(subset=['name'] if 'name' in df.columns else df.columns[:1])
    df = df.sample(min(2000, len(df)), random_state=42)

    name_col = 'name' if 'name' in df.columns else df.columns[0]
    price_col = next((c for c in df.columns if 'price' in c.lower()), None)
    cat_col = next((c for c in df.columns if 'category' in c.lower() or 'type' in c.lower()), None)
    img_col = next((c for c in df.columns if 'image' in c.lower() or 'img' in c.lower() or 'url' in c.lower()), None)

    for i, (_, row) in enumerate(df.iterrows()):
        name = str(row.get(name_col, '')).strip()
        if not name or len(name) < 3:
            continue
        price = clean_price(row.get(price_col)) if price_col else None
        if not price:
            price = round(20 + (i % 200), 2)  # synthetic fallback price
        cat = str(row.get(cat_col, 'Fashion')).strip() if cat_col else 'Fashion'
        img = str(row.get(img_col, '')).strip() if img_col else ''

        fashion_products.append(normalize_product(
            product_id=make_product_id('FSH', i),
            name=name,
            category=f"Fashion | {cat}",
            description='',
            actual_price=price,
            discounted_price=round(price * 0.85, 2),
            discount_pct='15%',
            rating=clean_rating(row.get('rating', 4.3)),
            num_reviews=clean_reviews(row.get('reviews', 0)),
            img_link=img if img.startswith('http') else '',
            source='fashion',
        ))
    print(f"  ✅ Fashion: {len(fashion_products):,} products")
except Exception as e:
    print(f"  ⚠️  Fashion skipped: {e}")

# ── 8. Merge + Deduplicate ────────────────────────────────────────────────────
print("\n🔀 Merging all sources …")
all_products = normalized_existing + amazon_products + flipkart_products + fashion_products

# Deduplicate by normalized product name (case-insensitive, strip punctuation)
seen_names = set()
deduped = []
for p in all_products:
    key = re.sub(r'[^a-z0-9]', '', p['name'].lower())[:60]
    if key not in seen_names:
        seen_names.add(key)
        deduped.append(p)

# Filter: must have a name at minimum
deduped = [p for p in deduped if p['name'] and p['name'] != 'Unknown Product']

print(f"\n📊 Summary:")
print(f"   Raw total:    {len(all_products):,}")
print(f"   After dedup:  {len(deduped):,}")

from collections import Counter
cats = Counter(p['category'].split('|')[0].strip() for p in deduped)
print(f"   Categories:   {len(cats)}")
for cat, cnt in cats.most_common(15):
    print(f"     {cat:<35} {cnt:>5}")

# ── 9. Save ───────────────────────────────────────────────────────────────────
print(f"\n💾 Saving to {OUTPUT_DATA} …")
with open(OUTPUT_DATA, 'w', encoding='utf-8') as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)
print(f"✅ Done! Saved {len(deduped):,} products → {OUTPUT_DATA}")
print("\n▶  Next step: python train_model.py (or update backend/app.py to load products_v2.json)")
