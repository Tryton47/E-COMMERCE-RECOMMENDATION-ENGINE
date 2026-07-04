import pandas as pd
import numpy as np
from pathlib import Path

# LOAD DATA
print("Loading data...")
file_path = Path('data/amazon.csv')

if not file_path.exists():
    print(f"ERROR: {file_path} not found")
    exit()

df = pd.read_csv(file_path)
print(f"Loaded: {file_path.name} ({df.shape[0]} rows, {df.shape[1]} cols)")

# BASIC CLEANING
print("\n[CLEANING] Removing duplicates...")
df = df.drop_duplicates()
print(f"  After drop_duplicates: {df.shape[0]} rows")

# STANDARDIZE COLUMNS
print("\n[STANDARDIZING] Column names...")

column_mapping = {
    'product_id': 'product_id',
    'product_name': 'product_name',
    'category': 'category',
    'discounted_price': 'price',
    'rating': 'rating',
    'rating_count': 'num_reviews',
    'about_product': 'description',
}

df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})

required_cols = ['product_id', 'product_name', 'category', 'price', 'rating', 'num_reviews']
missing_cols = [col for col in required_cols if col not in df.columns]

if missing_cols:
    print(f"  ERROR: Missing columns: {missing_cols}")
    print(f"  Available columns: {df.columns.tolist()}")
    exit()

print(f"  Standardized. Columns: {df.columns.tolist()}")

# STRING PARSING AND CONVERSION
print("\n[CONVERSION] Data types...")

def clean_price(x):
    if isinstance(x, str):
        x = x.replace('₹', '').replace(',', '')
    return pd.to_numeric(x, errors='coerce')

def clean_number(x):
    if isinstance(x, str):
        x = x.replace(',', '').replace('|', '')
    return pd.to_numeric(x, errors='coerce')

df['price'] = df['price'].apply(clean_price)
df['num_reviews'] = df['num_reviews'].apply(clean_number)
df['rating'] = df['rating'].apply(clean_number)

# Handling missing values
df = df.dropna(subset=['price'])
df['rating'] = df['rating'].fillna(df['rating'].median())
df['num_reviews'] = df['num_reviews'].fillna(0)

# DROP INVALID ROWS
print("\n[FILTERING] Removing invalid entries...")
initial_rows = df.shape[0]

df = df[df['price'] > 0]  # Price harus positif
df = df[df['rating'].between(0, 5)]  # Rating 0-5 saja
df = df[df['category'].notna()]  # Category tidak boleh kosong

removed = initial_rows - df.shape[0]
print(f"  Removed {removed} invalid rows ({removed/initial_rows*100:.1f}%)")
print(f"  Final: {df.shape[0]} rows")

# FEATURE ENGINEERING
print("\n[FEATURES] Adding new columns...")

# Popularity score (0-1)
df['popularity'] = (
    (df['rating'] / 5.0) * 0.6 + 
    (df['num_reviews'] / df['num_reviews'].max()) * 0.4
)

# Price category
df['price_category'] = pd.cut(df['price'], bins=5, labels=['Budget', 'Economy', 'Mid', 'Premium', 'Luxury'])

print(f"  Added: popularity, price_category")

# SAVE CLEANED DATA
print("\n[SAVING] Cleaned data...")
output_path = 'data/products_clean.csv'
df.to_csv(output_path, index=False)
print(f"  Saved: {output_path}")

# EDA SUMMARY
print("\n" + "="*70)
print("📊 DATA SUMMARY")
print("="*70)
print(f"\nShape: {df.shape[0]:,} products × {df.shape[1]} features")
print(f"\nCategories: {df['category'].nunique()} unique")
print(f"  Top 5: {df['category'].value_counts().head().to_dict()}")
print(f"\nPrice Range: ₹{df['price'].min():.2f} - ₹{df['price'].max():.2f}")
print(f"  Median: ₹{df['price'].median():.2f}")
print(f"\nRating Range: {df['rating'].min():.1f} - {df['rating'].max():.1f}")
print(f"  Mean: {df['rating'].mean():.2f}")
print(f"\nReviews per product:")
print(f"  Mean: {df['num_reviews'].mean():.0f}")
print(f"  Max: {df['num_reviews'].max():.0f}")

print("\n✅ Preprocessing complete!")
