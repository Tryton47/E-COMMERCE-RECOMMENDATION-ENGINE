from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import sys

# ============ PATH SETUP ============
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
sys.path.insert(0, PROJECT_ROOT)

from models.hybrid_recommender import HybridRecommendationEngine

# ============ DATA & MODEL LOADING ============
DATA_PATH = os.path.join(PROJECT_ROOT, 'data', 'products_clean.csv')
INTERACTIONS_PATH = os.path.join(PROJECT_ROOT, 'data', 'interactions.csv')
MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'recommendation_engine.pkl')

print(f"[STARTUP] Project root: {PROJECT_ROOT}")
print(f"[STARTUP] Data path: {DATA_PATH} (exists: {os.path.exists(DATA_PATH)})")
print(f"[STARTUP] Model path: {MODEL_PATH} (exists: {os.path.exists(MODEL_PATH)})")

# Load product data
products_df = pd.read_csv(DATA_PATH)
print(f"[STARTUP] Loaded {len(products_df)} products")

# Load or train model
if os.path.exists(MODEL_PATH):
    print("[STARTUP] Loading pre-trained model...")
    engine = HybridRecommendationEngine.load(MODEL_PATH)
else:
    print("[STARTUP] No pre-trained model found. Training from scratch...")
    interactions_df = pd.read_csv(INTERACTIONS_PATH)
    engine = HybridRecommendationEngine(products_df, interactions_df)
    engine.save(MODEL_PATH)
    print("[STARTUP] Model trained and saved!")

print("[STARTUP] ✅ API ready!")

# ============ FASTAPI APP ============
app = FastAPI(
    title="Recommendation Engine API",
    description="Hybrid recommendation system for e-commerce",
    version="1.0.0"
)

# CORS — allow all origins for maximum compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ REQUEST MODELS ============
class RecommendRequest(BaseModel):
    product_id: str
    n: int = 5
    user_id: int = None

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

# ============ ENDPOINTS ============

@app.get("/")
async def root():
    """Root endpoint — confirms API is live"""
    return {"status": "ok", "message": "Recommendation Engine API is running", "products": len(products_df)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running", "products_loaded": len(products_df)}

@app.post("/api/recommend")
async def get_recommendations(request: RecommendRequest):
    """Get product recommendations"""
    try:
        recommendations = engine.recommend(
            product_id=request.product_id,
            n=request.n,
            user_id=request.user_id
        )
        return {
            "status": "success",
            "product_id": request.product_id,
            "recommendations": recommendations
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/search")
async def search_products(request: SearchRequest):
    """Search products by name/category"""
    try:
        query = request.query.lower()

        # Search in name and category with NaN protection
        mask = (
            products_df['product_name'].str.lower().str.contains(query, na=False) |
            products_df['category'].str.lower().str.contains(query, na=False)
        )

        results = products_df[mask].head(request.limit)
        
        # Safe serialization
        records = []
        for _, row in results.iterrows():
            record = {}
            for col in results.columns:
                val = row[col]
                if pd.isna(val):
                    record[col] = None
                elif isinstance(val, (np.integer,)):
                    record[col] = int(val)
                elif isinstance(val, (np.floating,)):
                    record[col] = float(val)
                else:
                    record[col] = val
            records.append(record)

        return {
            "status": "success",
            "query": request.query,
            "results": records,
            "count": len(records)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Get single product detail"""
    try:
        product = products_df[
            products_df['product_id'] == product_id
        ].iloc[0].to_dict()

        # Safe type conversion
        for key, val in product.items():
            if pd.isna(val):
                product[key] = None
            elif isinstance(val, (np.integer,)):
                product[key] = int(val)
            elif isinstance(val, (np.floating,)):
                product[key] = float(val)

        return {"status": "success", "product": product}
    except Exception:
        return {"status": "error", "message": "Product not found"}

@app.post("/api/interactions/log")
async def log_interaction(user_id: int, product_id: str, action: str):
    """Log user interaction (for future retraining)"""
    return {
        "status": "success",
        "message": f"Logged: user {user_id} {action} product {product_id}"
    }

if __name__ == "__main__":
    import uvicorn
    # Railway passes the port dynamically via the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    # Binding to "0.0.0.0" and "::" allows both IPv4 and IPv6 connections (Railway uses IPv6 internally)
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port)
