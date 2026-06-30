import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# LOAD CLEANED PRODUCTS
print("Loading products data...")
products_df = pd.read_csv('data/products_clean.csv')
print(f"Loaded {len(products_df)} products")

# SETTINGS
n_users = 5000          # Total unique users
n_interactions = 100000 # Total interactions (views, clicks, purchases)

print(f"\nGenerating {n_interactions} interactions from {n_users} users...")

# SEED untuk reproducibility
random.seed(42)
np.random.seed(42)

interactions = []

# Weight untuk product popularity
# Produk dengan rating & reviews tinggi lebih sering dibeli
popularity_weights = (
    (products_df['rating'] / 5.0) * 0.6 +
    (products_df['num_reviews'] / products_df['num_reviews'].max()) * 0.4
)

start_date = datetime(2024, 1, 1)

for i in range(n_interactions):
    if (i + 1) % 20000 == 0:
        print(f"  Progress: {i+1}/{n_interactions}")
    
    user_id = random.randint(1, n_users)
    
    # Bias: Popular products lebih sering dipilih (80%)
    if random.random() < 0.8:
        product_idx = np.random.choice(
            len(products_df),
            p=popularity_weights / popularity_weights.sum()
        )
    else:
        product_idx = random.randint(0, len(products_df) - 1)
    
    product_id = products_df.iloc[product_idx]['product_id']
    
    # Action distribution: view 50%, click 25%, add_to_cart 15%, purchase 10%
    rand = random.random()
    if rand < 0.5:
        action = 'view'
        rating = None
    elif rand < 0.75:
        action = 'click'
        rating = None
    elif rand < 0.9:
        action = 'add_to_cart'
        rating = None
    else:
        action = 'purchase'
        # User rating: korelasi dengan product rating
        product_rating = products_df.iloc[product_idx]['rating']
        user_rating = max(1.0, min(5.0,
            product_rating + np.random.normal(0, 0.4)
        ))
        rating = round(user_rating, 1)
    
    # Random timestamp dalam 6 bulan
    days_offset = random.randint(0, 180)
    timestamp = start_date + timedelta(days=days_offset)
    
    interactions.append({
        'user_id': user_id,
        'product_id': product_id,
        'action': action,
        'rating': rating,
        'timestamp': timestamp,
    })

# CREATE DATAFRAME
print("\nCreating interactions dataframe...")
interactions_df = pd.DataFrame(interactions)

# ANALYSIS
print("\n" + "="*70)
print("📊 INTERACTIONS SUMMARY")
print("="*70)
print(f"\nTotal interactions: {len(interactions_df):,}")
print(f"Unique users: {interactions_df['user_id'].nunique():,}")
print(f"Unique products: {interactions_df['product_id'].nunique():,}")
print(f"\nAction distribution:")
print(interactions_df['action'].value_counts())
print(f"\nRating statistics (from purchases only):")
ratings = interactions_df[interactions_df['action'] == 'purchase']['rating']
print(f"  Mean: {ratings.mean():.2f}")
print(f"  Median: {ratings.median():.1f}")
print(f"  Std: {ratings.std():.2f}")

# SAVE
print("\n[SAVING] interactions.csv...")
interactions_df.to_csv('data/interactions.csv', index=False)
print("✅ Saved: data/interactions.csv")

# CO-PURCHASE ANALYSIS (bonus insight untuk portfolio)
print("\n" + "="*70)
print("🔗 CO-PURCHASE ANALYSIS")
print("="*70)

purchases_only = interactions_df[interactions_df['action'] == 'purchase']
print(f"\nTotal purchases: {len(purchases_only):,}")

# Top 5 co-purchase pairs
print("\nExample: Users who bought Product A also bought Product B")
print("(This is what the recommendation engine will learn)")

# Ambil 3 produk teratas (paling banyak dibeli)
top_products = purchases_only['product_id'].value_counts().head(3)

for top_product_id in top_products.index:
    buyers = purchases_only[purchases_only['product_id'] == top_product_id]['user_id'].unique()
    other_purchases = purchases_only[purchases_only['user_id'].isin(buyers)]['product_id'].value_counts()
    other_purchases = other_purchases[other_purchases.index != top_product_id]
    
    product_name = products_df[products_df['product_id'] == top_product_id]['product_name'].values[0]
    print(f"\n✓ {product_name}:")
    for other_id, count in other_purchases.head(3).items():
        other_name = products_df[products_df['product_id'] == other_id]['product_name'].values[0]
        pct = count / len(buyers) * 100
        print(f"    → {other_name}: {count} times ({pct:.1f}% of buyers)")

print("\n✅ Interaction generation complete!")
