import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

class HybridRecommendationEngine:
    """
    Hybrid recommendation system combining:
    - Content-based (50%): Product description similarity via TF-IDF
    - Popularity (30%): Rating & review count
    - Co-category (20%): Same category boost
    
    Optimized for low-memory deployment (Railway free tier).
    """
    
    def __init__(self, products_df, interactions_df=None):
        self.products_df = products_df.reset_index(drop=True)
        
        print("[INIT] Building hybrid recommendation engine...")
        
        # ALGORITHM 1: CONTENT-BASED (TF-IDF)
        print("  [1/3] Building TF-IDF content matrix...")
        self._build_content_matrix()
        
        # ALGORITHM 2: CO-PURCHASE (lightweight)
        print("  [2/3] Building co-purchase index...")
        self._build_copurchase_index(interactions_df)
        
        # ALGORITHM 3: POPULARITY SCORE
        print("  [3/3] Calculating popularity scores...")
        self._calculate_popularity()
        
        print("✅ Model initialized!")
    
    def _build_content_matrix(self):
        """Build TF-IDF matrix from product descriptions"""
        texts = []
        for _, row in self.products_df.iterrows():
            text = f"{row['product_name']} {row['category']}"
            if 'description' in self.products_df.columns and pd.notna(row.get('description', None)):
                text += f" {row['description']}"
            texts.append(str(text))
        
        # TF-IDF Vectorization (limited features for memory)
        self.vectorizer = TfidfVectorizer(
            max_features=150,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.content_matrix = self.vectorizer.fit_transform(texts)
        print(f"    TF-IDF matrix shape: {self.content_matrix.shape}")
    
    def _build_copurchase_index(self, interactions_df):
        """Build lightweight co-purchase lookup instead of full user-product matrix"""
        self.copurchase_index = {}
        
        if interactions_df is None or len(interactions_df) == 0:
            print("    No interactions data, skipping co-purchase index")
            return
        
        purchases = interactions_df[interactions_df['action'] == 'purchase']
        
        # Group purchases by user
        user_purchases = purchases.groupby('user_id')['product_id'].apply(list).to_dict()
        
        # Build co-purchase counts
        for user_id, product_ids in user_purchases.items():
            unique_products = list(set(product_ids))
            for i, pid1 in enumerate(unique_products):
                if pid1 not in self.copurchase_index:
                    self.copurchase_index[pid1] = {}
                for j, pid2 in enumerate(unique_products):
                    if i != j:
                        self.copurchase_index[pid1][pid2] = self.copurchase_index[pid1].get(pid2, 0) + 1
        
        print(f"    Co-purchase index: {len(self.copurchase_index)} products with co-purchase data")
    
    def _calculate_popularity(self):
        """Calculate popularity score for each product"""
        rating_norm = self.products_df['rating'].fillna(0) / 5.0
        
        max_reviews = self.products_df['num_reviews'].max()
        review_norm = self.products_df['num_reviews'].fillna(0) / max_reviews if max_reviews > 0 else 0
        
        self.popularity_scores = (
            rating_norm.values * 0.6 + 
            review_norm.values * 0.4
        )
        
        print(f"    Popularity scores calculated (mean: {self.popularity_scores.mean():.3f})")
    
    def recommend(self, product_id, n=5, user_id=None):
        """
        Generate recommendations for a product
        
        Args:
            product_id: ID of the query product
            n: Number of recommendations
            user_id: Optional, for personalization (unused in lightweight mode)
        
        Returns:
            List of dicts with keys: product_id, name, score, reason
        """
        product_indices = self.products_df[
            self.products_df['product_id'] == product_id
        ].index
        
        if len(product_indices) == 0:
            return []
        
        product_idx = product_indices[0]
        
        # COMPONENT 1: CONTENT-BASED SCORE (TF-IDF cosine similarity)
        content_scores = cosine_similarity(
            self.content_matrix[product_idx:product_idx+1],
            self.content_matrix
        )[0]
        
        # COMPONENT 2: CO-PURCHASE SCORE
        copurchase_scores = np.zeros(len(self.products_df))
        if product_id in self.copurchase_index:
            co_products = self.copurchase_index[product_id]
            max_count = max(co_products.values()) if co_products else 1
            for co_pid, count in co_products.items():
                co_indices = self.products_df[self.products_df['product_id'] == co_pid].index
                if len(co_indices) > 0:
                    copurchase_scores[co_indices[0]] = count / max_count
        
        # COMPONENT 3: POPULARITY SCORE
        pop_scores = self.popularity_scores.copy()
        max_pop = pop_scores.max()
        if max_pop > 0:
            pop_scores = pop_scores / max_pop
        
        # HYBRID COMBINATION
        hybrid_scores = (
            0.50 * content_scores +
            0.20 * copurchase_scores +
            0.30 * pop_scores
        )
        
        # Exclude the queried product itself
        hybrid_scores[product_idx] = -1
        
        # Get top-n
        top_indices = hybrid_scores.argsort()[-n:][::-1]
        
        recommendations = []
        for idx in top_indices:
            if hybrid_scores[idx] > 0:
                recommendation = {
                    'product_id': str(self.products_df.iloc[idx]['product_id']),
                    'name': str(self.products_df.iloc[idx]['product_name']),
                    'category': str(self.products_df.iloc[idx]['category']),
                    'price': float(self.products_df.iloc[idx]['price']),
                    'rating': float(self.products_df.iloc[idx]['rating']),
                    'num_reviews': int(self.products_df.iloc[idx]['num_reviews']),
                    'score': float(hybrid_scores[idx]),
                    'reason': self._explain_recommendation(
                        idx, 
                        content_scores[idx],
                        copurchase_scores[idx],
                        pop_scores[idx]
                    )
                }
                recommendations.append(recommendation)
        
        return recommendations
    
    def _explain_recommendation(self, product_idx, content_score, 
                                collab_score, pop_score):
        """Generate human-readable explanation"""
        reasons = []
        
        if content_score > 0.3:
            reasons.append(f"Similar product ({content_score*100:.0f}%)")
        
        if collab_score > 0.3:
            reasons.append(f"Often bought together ({collab_score*100:.0f}%)")
        
        if pop_score > 0.5:
            reasons.append("Popular & highly rated")
        
        return " + ".join(reasons) if reasons else "Recommended"
    
    def save(self, filepath='models/recommendation_engine.pkl'):
        """Save trained model to file"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        print(f"✅ Model saved: {filepath}")
    
    @staticmethod
    def load(filepath='models/recommendation_engine.pkl'):
        """Load trained model from file"""
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Model loaded: {filepath}")
        return model
