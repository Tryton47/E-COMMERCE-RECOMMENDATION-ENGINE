from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import sys
sys.path.insert(0, '../')
from models.hybrid_recommender import HybridRecommendationEngine

# Load data & model
print("Loading data & model...")
products_df = pd.read_csv('../data/products_clean.csv')
engine = HybridRecommendationEngine.load('../models/recommendation_engine.pkl')

# FastAPI app
app = FastAPI(
    title="Recommendation Engine API",
    description="Hybrid recommendation system untuk e-commerce",
    version="1.0.0"
)

# CORS (allow React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://myapp.vercel.app",
        "https://myrecommendation.vercel.app",
        "https://e-commerce-recommendation-engine-production.up.railway.app"
    ],
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}

@app.post("/api/recommend")
async def get_recommendations(request: RecommendRequest):
    """
    Get product recommendations
    
    Example:
    {
        "product_id": "PROD_00101",
        "n": 5,
        "user_id": 123
    }
    """
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
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/search")
async def search_products(request: SearchRequest):
    """
    Search products by name/category
    
    Example:
    {
        "query": "Product",
        "limit": 10
    }
    """
    try:
        query = request.query.lower()
        
        # Search di name dan category
        mask = (
            products_df['product_name'].str.lower().str.contains(query) |
            products_df['category'].str.lower().str.contains(query)
        )
        
        results = products_df[mask].head(request.limit).to_dict('records')
        
        # Convert tipe data untuk JSON serialization
        for result in results:
            result['price'] = float(result['price'])
            result['rating'] = float(result['rating'])
            result['num_reviews'] = int(result['num_reviews'])
        
        return {
            "status": "success",
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Get single product detail"""
    try:
        product = products_df[
            products_df['product_id'] == product_id
        ].iloc[0].to_dict()
        
        product['price'] = float(product['price'])
        product['rating'] = float(product['rating'])
        product['num_reviews'] = int(product['num_reviews'])
        
        return {
            "status": "success",
            "product": product
        }
    except:
        return {
            "status": "error",
            "message": "Product not found"
        }

@app.post("/api/interactions/log")
async def log_interaction(user_id: int, product_id: str, action: str):
    """Log user interaction (untuk future retraining)"""
    # In production, ini disimpan ke database
    # For now, just return success
    return {
        "status": "success",
        "message": f"Logged: user {user_id} {action} product {product_id}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
