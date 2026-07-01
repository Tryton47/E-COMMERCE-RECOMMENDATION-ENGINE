import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
from pathlib import Path

class HybridRecommendationEngine:
    """
    Hybrid recommendation system combining:
    - Content-based (40%): Product description similarity
    - Collaborative (40%): User behavior patterns
    - Popularity (20%): Rating & review count
    """
    
    def __init__(self, products_df, interactions_df):
        self.products_df = products_df.reset_index(drop=True)
        self.interactions_df = interactions_df
        
        print("[INIT] Building hybrid recommendation engine...")
        
        # ALGORITHM 1: CONTENT-BASED (TF-IDF)
        print("  [1/3] Building TF-IDF content matrix...")
        self._build_content_matrix()
        
        # ALGORITHM 2: COLLABORATIVE FILTERING
        print("  [2/3] Building user-product interaction matrix...")
        self._build_user_product_matrix()
        
        # ALGORITHM 3: POPULARITY SCORE
        print("  [3/3] Calculating popularity scores...")
        self._calculate_popularity()
        
        print("✅ Model initialized!")
    
    def _build_content_matrix(self):
        """Build TF-IDF matrix dari product descriptions"""
        # Combine product name + category + description untuk text
        texts = []
        for _, row in self.products_df.iterrows():
            text = f"{row['product_name']} {row['category']}"
            if 'description' in self.products_df.columns:
                text += f" {row['description']}"
            texts.append(text)
        
        # TF-IDF Vectorization
        self.vectorizer = TfidfVectorizer(
            max_features=200,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.content_matrix = self.vectorizer.fit_transform(texts)
        
        # Cosine similarity antar produk
        self.content_similarity = cosine_similarity(self.content_matrix)
        print(f"    Content matrix shape: {self.content_similarity.shape}")
    
    def _build_user_product_matrix(self):
        """Build user-product rating matrix dari interactions"""
        n_users = self.interactions_df['user_id'].max() + 1
        n_products = len(self.products_df)
        
        self.user_product_matrix = np.zeros((n_users, n_products))
        self.user_product_implicit = np.zeros((n_users, n_products))
        
        # Fill matrix dengan ratings (explicit feedback)
        for _, row in self.interactions_df.iterrows():
            user_id = int(row['user_id'])
            
            # Find product index
            product_id = row['product_id']
            product_idx = self.products_df[
                self.products_df['product_id'] == product_id
            ].index
            
            if len(product_idx) > 0:
                product_idx = product_idx[0]
                
                if pd.notna(row['rating']):
                    self.user_product_matrix[user_id][product_idx] = row['rating']
            
            # Implicit feedback (action type)
            if row['action'] == 'view':
                self.user_product_implicit[user_id][product_idx] += 1
            elif row['action'] == 'click':
                self.user_product_implicit[user_id][product_idx] += 2
            elif row['action'] == 'add_to_cart':
                self.user_product_implicit[user_id][product_idx] += 5
            elif row['action'] == 'purchase':
                self.user_product_implicit[user_id][product_idx] += 10
        
        # Normalize implicit feedback
        max_implicit = self.user_product_implicit.max()
        if max_implicit > 0:
            self.user_product_implicit = self.user_product_implicit / max_implicit
        
        print(f"    User-product matrix shape: {self.user_product_matrix.shape}")
    
    def _calculate_popularity(self):
        """Calculate popularity score untuk tiap produk"""
        # Normalisasi rating (0-1)
        rating_norm = self.products_df['rating'] / 5.0
        
        # Normalisasi review count (0-1)
        review_norm = (
            self.products_df['num_reviews'] / 
            self.products_df['num_reviews'].max()
        )
        
        # Weighted combination
        self.popularity_scores = (
            rating_norm.values * 0.6 + 
            review_norm.values * 0.4
        )
        
        print(f"    Popularity scores calculated (mean: {self.popularity_scores.mean():.3f})")
    
    def recommend(self, product_id, n=5, user_id=None):
        """
        Generate recommendations untuk satu produk
        
        Args:
            product_id: ID produk yang di-query
            n: Jumlah rekomendasi
            user_id: Optional, untuk personalization
        
        Returns:
            List of dicts dengan keys: product_id, name, score, reason
        """
        
        # Find product index
        product_indices = self.products_df[
            self.products_df['product_id'] == product_id
        ].index
        
        if len(product_indices) == 0:
            return []
        
        product_idx = product_indices[0]
        
        # ===== COMPONENT 1: CONTENT-BASED SCORE =====
        content_scores = self.content_similarity[product_idx]
        
        # ===== COMPONENT 2: COLLABORATIVE FILTERING SCORE =====
        if user_id is not None and user_id < len(self.user_product_matrix):
            user_idx = user_id
            user_preferences = self.user_product_matrix[user_idx]
            
            # Find similar users (based on rating patterns)
            user_similarity = cosine_similarity(
                user_preferences.reshape(1, -1),
                self.user_product_matrix
            )[0]
            
            # Get recommendations dari similar users
            similar_user_indices = user_similarity.argsort()[-10:][::-1]
            collab_scores = np.zeros(len(self.products_df))
            
            for sim_user_idx in similar_user_indices[1:]:  # Skip self
                weight = user_similarity[sim_user_idx]
                collab_scores += self.user_product_matrix[sim_user_idx] * weight
            
            # Normalize
            if collab_scores.max() > 0:
                collab_scores = collab_scores / collab_scores.max()
        else:
            # No user_id: use co-purchase frequency
            collab_scores = self._calculate_copurchase_score(product_idx)
        
        # ===== COMPONENT 3: POPULARITY SCORE =====
        popularity_scores = self.popularity_scores / self.popularity_scores.max()
        
        # ===== HYBRID COMBINATION =====
        hybrid_scores = (
            0.4 * content_scores +
            0.4 * collab_scores +
            0.2 * popularity_scores
        )
        
        # Exclude the queried product itself
        hybrid_scores[product_idx] = -1
        
        # Get top-n
        top_indices = hybrid_scores.argsort()[-n:][::-1]
        
        recommendations = []
        for idx in top_indices:
            if hybrid_scores[idx] > 0:
                recommendation = {
                    'product_id': self.products_df.iloc[idx]['product_id'],
                    'name': self.products_df.iloc[idx]['product_name'],
                    'category': self.products_df.iloc[idx]['category'],
                    'price': float(self.products_df.iloc[idx]['price']),
                    'rating': float(self.products_df.iloc[idx]['rating']),
                    'num_reviews': int(self.products_df.iloc[idx]['num_reviews']),
                    'score': float(hybrid_scores[idx]),
                    'reason': self._explain_recommendation(
                        idx, 
                        content_scores[idx],
                        collab_scores[idx],
                        popularity_scores[idx]
                    )
                }
                recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_copurchase_score(self, product_idx):
        """Calculate co-purchase frequency"""
        purchases = self.interactions_df[
            self.interactions_df['action'] == 'purchase'
        ]
        
        # Users yang beli produk ini
        product_id = self.products_df.iloc[product_idx]['product_id']
        buyers = purchases[
            purchases['product_id'] == product_id
        ]['user_id'].unique()
        
        copurchase = np.zeros(len(self.products_df))
        
        for buyer in buyers:
            buyer_purchases = purchases[
                purchases['user_id'] == buyer
            ]['product_id'].tolist()
            
            for other_product in buyer_purchases:
                other_indices = self.products_df[
                    self.products_df['product_id'] == other_product
                ].index
                
                if len(other_indices) > 0:
                    other_idx = other_indices[0]
                    copurchase[other_idx] += 1
        
        # Normalize
        if copurchase.max() > 0:
            copurchase = copurchase / copurchase.max()
        
        return copurchase
    
    def _explain_recommendation(self, product_idx, content_score, 
                                collab_score, pop_score):
        """Generate human-readable explanation"""
        reasons = []
        
        if content_score > 0.5:
            reasons.append(f"Similar product ({content_score*100:.0f}%)")
        
        if collab_score > 0.5:
            reasons.append(f"Often bought together ({collab_score*100:.0f}%)")
        
        if pop_score > 0.6:
            reasons.append("Popular & highly rated")
        
        return " + ".join(reasons) if reasons else "Recommended"
    
    def save(self, filepath='models/recommendation_engine.pkl'):
        """Simpan trained model ke file"""
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        print(f"✅ Model saved: {filepath}")
    
    @staticmethod
    def load(filepath='models/recommendation_engine.pkl'):
        """Load trained model dari file"""
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Model loaded: {filepath}")
        return model
