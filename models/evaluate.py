import pandas as pd
import numpy as np
from models.hybrid_recommender import HybridRecommendationEngine
from sklearn.metrics import mean_absolute_error, mean_squared_error
import math

print("="*70)
print("MODEL EVALUATION")
print("="*70)

# Load data
products_df = pd.read_csv('data/products_clean.csv')
interactions_df = pd.read_csv('data/interactions.csv')

# Load model
print("\nLoading trained model...")
engine = HybridRecommendationEngine.load('models/recommendation_engine.pkl')

# Get purchase interactions (untuk evaluation)
purchases = interactions_df[interactions_df['action'] == 'purchase'].copy()

print(f"\nEvaluating on {len(purchases)} purchase interactions...")

# METRIC 1: Precision@5 (dari 5 rekomendasi, berapa yang user beneran beli)
print("\n" + "="*70)
print("METRIC 1: Precision@5")
print("="*70)

precisions = []
sample_size = min(1000, len(purchases))  # Sample untuk cepat

for i, (_, row) in enumerate(purchases.sample(sample_size, random_state=42).iterrows()):
    if (i + 1) % 200 == 0:
        print(f"  Progress: {i+1}/{sample_size}")
    
    user_id = row['user_id']
    product_id = row['product_id']
    
    # Get recommendations
    recommendations = engine.recommend(product_id, n=5, user_id=user_id)
    rec_product_ids = [rec['product_id'] for rec in recommendations]
    
    # Check: user yang membeli produk ini juga membeli rekomendasi ini?
    user_purchases = purchases[purchases['user_id'] == user_id]['product_id'].tolist()
    
    hits = sum(1 for rec_id in rec_product_ids if rec_id in user_purchases)
    precision = hits / 5
    precisions.append(precision)

avg_precision = np.mean(precisions)
print(f"\nAverage Precision@5: {avg_precision:.3f}")
print(f"  (Meaning: {avg_precision*5:.1f} out of 5 recommendations were actually bought)")

# METRIC 2: Mean Recommendation Score
print("\n" + "="*70)
print("METRIC 2: Mean Recommendation Score")
print("="*70)

scores = []
for i, (_, row) in enumerate(purchases.sample(sample_size, random_state=42).iterrows()):
    product_id = row['product_id']
    recommendations = engine.recommend(product_id, n=5)
    
    if recommendations:
        scores.append(recommendations[0]['score'])  # Top recommendation score

mean_score = np.mean(scores)
print(f"\nMean Score of Top Recommendation: {mean_score:.3f}")
print(f"  (Score ranges 0-1, higher is better)")

# METRIC 3: Coverage (berapa % produk yang di-recommend at least sekali)
print("\n" + "="*70)
print("METRIC 3: Product Coverage")
print("="*70)

recommended_products = set()
for _, row in purchases.sample(sample_size, random_state=42).iterrows():
    product_id = row['product_id']
    recommendations = engine.recommend(product_id, n=5)
    
    for rec in recommendations:
        recommended_products.add(rec['product_id'])

coverage = len(recommended_products) / len(products_df)
print(f"\nProduct Coverage: {coverage*100:.1f}%")
print(f"  ({len(recommended_products):,} out of {len(products_df):,} products recommended)")

# SUMMARY
print("\n" + "="*70)
print("EVALUATION SUMMARY")
print("="*70)
print(f"\nPrecision@5: {avg_precision:.3f} ⭐")
print(f"Mean Score: {mean_score:.3f} ⭐")
print(f"Coverage: {coverage*100:.1f}% ⭐")

if avg_precision > 0.3:
    rating = "✅ GOOD (Ready for production)"
else:
    rating = "⚠️ OK (Can improve)"

print(f"\nModel Rating: {rating}")
print("\n✅ Evaluation complete!")
