import pandas as pd
from models.hybrid_recommender import HybridRecommendationEngine

print("="*70)
print("TRAINING HYBRID RECOMMENDATION ENGINE")
print("="*70)

# Load data
print("\n[1/3] Loading data...")
products_df = pd.read_csv('data/products_clean.csv')
interactions_df = pd.read_csv('data/interactions.csv')
print(f"  Products: {len(products_df)}")
print(f"  Interactions: {len(interactions_df)}")

# Train model
print("\n[2/3] Training model...")
engine = HybridRecommendationEngine(products_df, interactions_df)

# Save model
print("\n[3/3] Saving model...")
engine.save('models/recommendation_engine.pkl')

# Test
print("\n" + "="*70)
print("TESTING MODEL")
print("="*70)

# Test with first product
test_product = products_df.iloc[0]
test_product_id = test_product['product_id']
print(f"\nQuery: {test_product['product_name']}")

recommendations = engine.recommend(test_product_id, n=5)

print(f"\nTop 5 Recommendations:")
for i, rec in enumerate(recommendations, 1):
    print(f"\n{i}. {rec['name']}")
    print(f"   Category: {rec['category']}")
    print(f"   Price: ${rec['price']:.2f}")
    print(f"   Rating: {rec['rating']:.1f} ({rec['num_reviews']} reviews)")
    print(f"   Score: {rec['score']:.3f}")
    print(f"   Why: {rec['reason']}")

print("\n✅ Training complete!")
