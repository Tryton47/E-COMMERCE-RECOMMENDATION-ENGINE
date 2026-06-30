import pandas as pd
import numpy as np
from pathlib import Path

# LOAD DATA
print("Loading data...")
csv_files = list(Path('data').glob('*.csv'))

if len(csv_files) == 0:
    print("ERROR: No CSV found in data/ folder")
    exit()

df = pd.read_csv(csv_files[0])
print(f"Loaded: {csv_files[0].name} ({df.shape[0]} rows, {df.shape[1]} cols)")

# BASIC CLEANING
print("\n[CLEANING] Removing duplicates...")
df = df.drop_duplicates()
print(f"  After drop_duplicates: {df.shape[0]} rows")

print("[CLEANING] Handling missing values...")
# Jika ada kolom price kosong, drop baris tersebut
if 'price' in df.columns:
    df = df.dropna(subset=['price'])
    print(f"  Dropped rows dengan price NaN: {df.shape[0]} rows left")

# Jika ada kolom rating kosong, isi dengan median
if 'rating' in df.columns:
    missing_ratings = df['rating'].isna().sum()
    df['rating'] = df['rating'].fillna(df['rating'].median())
    print(f"  Filled {missing_ratings} missing ratings with median")

# STANDARDIZE COLUMNS (sesuaikan dengan actual column names)
print("\n[STANDARDIZING] Column names...")

# Mapping: bisa berbeda tergantung dataset
# Adjust sesuai output TAHAP 2
column_mapping = {
    'product_id': 'product_id',
    'product_name': 'product_name',
    'title': 'product_name',  # alternate column name
    'name': 'product_name',
    
    'category': 'category',
    'product_category': 'category',
    'asin': 'product_id',  # for Amazon data
    'price': 'price',
    'rating': 'rating',
    'average_rating': 'rating',
    'num_reviews': 'num_reviews',
    'review_count': 'num_reviews',
    'description': 'description',
}

# Rename columns yang ada
df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})

# Pastikan kolom penting ada
required_cols = ['product_id', 'product_name', 'category', 'price', 'rating']
missing_cols = [col for col in required_cols if col not in df.columns]

if missing_cols:
    print(f"  ERROR: Missing columns: {missing_cols}")
    print(f"  Available columns: {df.columns.tolist()}")
    exit()

print(f"  Standardized. Columns: {df.columns.tolist()}")

# TYPE CONVERSION
print("\n[CONVERSION] Data types...")
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['num_reviews'] = pd.to_numeric(df['num_reviews'], errors='coerce')
print(f"  Converted to numeric types")

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
print(f"\nPrice Range: ${df['price'].min():.2f} - ${df['price'].max():.2f}")
print(f"  Median: ${df['price'].median():.2f}")
print(f"\nRating Range: {df['rating'].min():.1f} - {df['rating'].max():.1f}")
print(f"  Mean: {df['rating'].mean():.2f}")
print(f"\nReviews per product:")
print(f"  Mean: {df['num_reviews'].mean():.0f}")
print(f"  Max: {df['num_reviews'].max():.0f}")

print("\n✅ Preprocessing complete!")
