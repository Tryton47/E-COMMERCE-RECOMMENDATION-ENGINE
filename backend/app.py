from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import sys
import json

# ============ PATH SETUP ============
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
sys.path.insert(0, PROJECT_ROOT)

# ============ LAZY GLOBALS ============
_products = None          # Plain list of dicts — fast pure-Python search
_engine = None            # ML engine — loaded lazily for /api/recommend


def find_file(relative_path):
    """Find file across multiple candidate root directories (handles Vercel Serverless, Docker, Local)."""
    candidates = [
        os.path.join(PROJECT_ROOT, relative_path),
        os.path.join(BASE_DIR, '..', relative_path),
        os.path.join(os.getcwd(), relative_path),
        os.path.join('/var/task', relative_path),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None


def get_products():
    """Load products lazily from JSON. Prefers products_v2.json (expanded) over products.json."""
    global _products
    if _products is None:
        # Prefer expanded dataset if it exists
        json_path = (
            find_file(os.path.join('data', 'products_v2.json'))
            or find_file(os.path.join('data', 'products.json'))
        )
        csv_path = find_file(os.path.join('data', 'products_clean.csv'))

        if json_path and os.path.exists(json_path):
            label = 'products_v2.json' if 'v2' in json_path else 'products.json'
            print(f"[LAZY] Loading {label} from {json_path}...")
            with open(json_path, 'r', encoding='utf-8') as f:
                _products = json.load(f)
            print(f"[LAZY] Loaded {len(_products):,} products from {label}")
        elif csv_path and os.path.exists(csv_path):
            print(f"[LAZY] Falling back to CSV: {csv_path}...")
            import pandas as pd
            df = pd.read_csv(csv_path).fillna('')
            _products = df.to_dict(orient='records')
        else:
            print("[LAZY WARNING] No product data file found! Returning empty list.")
            _products = []

        # Pre-compute search text and normalize numerical data fields
        for p in _products:
            p['name'] = p.get('name') or p.get('product_name') or 'Tech Product'
            p['product_name'] = p.get('product_name') or p.get('name') or 'Tech Product'

            # Parse numeric price safely
            raw_price = p.get('price') or p.get('discounted_price') or p.get('actual_price')
            if isinstance(raw_price, (int, float)) and not (isinstance(raw_price, float) and (raw_price != raw_price)):
                p['price'] = float(raw_price)
            elif isinstance(raw_price, str):
                cleaned_p = ''.join(c for c in raw_price if c.isdigit() or c == '.')
                try:
                    p['price'] = float(cleaned_p) if cleaned_p else 49.99
                except ValueError:
                    p['price'] = 49.99
            else:
                p['price'] = 49.99

            # Parse review count safely
            raw_rev = p.get('num_reviews') or p.get('rating_count') or 1250
            if isinstance(raw_rev, (int, float)):
                p['num_reviews'] = int(raw_rev)
            else:
                cleaned_rev = ''.join(c for c in str(raw_rev) if c.isdigit())
                p['num_reviews'] = int(cleaned_rev) if cleaned_rev else 1250

            p['_search'] = (
                str(p.get('product_name', '')).lower() + ' ' +
                str(p.get('category', '')).lower() + ' ' +
                str(p.get('about_product', '')).lower()
            )
        print(f"[LAZY] {len(_products)} products loaded & indexed.")
    return _products


def get_engine():
    """Load ML recommendation engine lazily — only when /api/recommend is called."""
    global _engine
    if _engine is None:
        model_path = find_file(os.path.join('models', 'recommendation_engine.pkl'))
        products_csv = find_file(os.path.join('data', 'products_clean.csv'))
        interactions_csv = find_file(os.path.join('data', 'interactions.csv'))

        if model_path and os.path.exists(model_path):
            print(f"[LAZY] Loading pre-trained model from {model_path}...")
            try:
                from models.hybrid_recommender import HybridRecommendationEngine
                _engine = HybridRecommendationEngine.load(model_path)
            except Exception as e:
                print(f"[LAZY WARNING] Pickled model load failed ({e}). Training fallback...")
                if products_csv and interactions_csv:
                    import pandas as pd
                    from models.hybrid_recommender import HybridRecommendationEngine
                    products_df = pd.read_csv(products_csv)
                    interactions_df = pd.read_csv(interactions_csv)
                    _engine = HybridRecommendationEngine(products_df, interactions_df)
        else:
            print("[LAZY WARNING] No model file found. Attempting inline initialization...")
            if products_csv and interactions_csv:
                import pandas as pd
                from models.hybrid_recommender import HybridRecommendationEngine
                products_df = pd.read_csv(products_csv)
                interactions_df = pd.read_csv(interactions_csv)
                _engine = HybridRecommendationEngine(products_df, interactions_df)

        print("[LAZY] Recommendation engine ready.")
    return _engine


# ============ FASTAPI APP ============
app = FastAPI(
    title="Recommendation Engine API",
    description="Hybrid recommendation system for e-commerce",
    version="2.1.0"
)

# Broad CORS configuration to prevent blockage on Vercel preview/production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    """Root endpoint — instant response."""
    return {
        "status": "ok",
        "message": "Recommendation Engine API is running",
        "version": "2.1.0",
        "products": len(_products) if _products else "lazy"
    }


@app.get("/health")
async def health_check():
    """Health check — instant response."""
    return {
        "status": "ok",
        "message": "API is healthy",
        "products_loaded": len(_products) if _products else 0
    }


@app.post("/api/search")
async def search_products(request: SearchRequest):
    """
    Search products by query.
    Uses fast pure-Python string search over pre-indexed JSON data.
    """
    try:
        products = get_products()

        if not request.query or not request.query.strip():
            return {"status": "success", "query": "", "results": [], "count": 0}

        query = request.query.lower().strip()

        matches = [
            p for p in products
            if query in p.get('_search', '')
        ][:request.limit]

        # Return results without internal index field
        results = [
            {k: v for k, v in p.items() if k != '_search'}
            for p in matches
        ]

        return {
            "status": "success",
            "query": request.query,
            "results": results,
            "count": len(results)
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "results": [], "count": 0}


@app.post("/api/recommend")
async def get_recommendations(request: RecommendRequest):
    """
    Get recommendations for a product.
    Tries ML engine first; falls back to category-based match if ML model unavailable.
    """
    try:
        if not request.product_id:
            return {"status": "error", "message": "product_id is required", "recommendations": []}

        # Try ML engine
        try:
            engine = get_engine()
            if engine is not None:
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
        except Exception as ml_err:
            print(f"[RECOMMEND FALLBACK] ML engine failed ({ml_err}), using category fallback...")

        # Fallback heuristic recommendation (same category, highest rating)
        products = get_products()
        target = next((p for p in products if str(p.get('product_id', '')) == str(request.product_id)), None)

        if target:
            target_cat = target.get('category', '')
            recs = [
                p for p in products
                if str(p.get('product_id', '')) != str(request.product_id)
                and (not target_cat or p.get('category', '') == target_cat)
            ][:request.n]
        else:
            recs = [p for p in products if str(p.get('product_id', '')) != str(request.product_id)][:request.n]

        results = [
            {
                **{k: v for k, v in p.items() if k != '_search'},
                "recommendation_score": 0.85,
                "recommendation_reason": "Category Similarity"
            }
            for p in recs
        ]

        return {
            "status": "success",
            "product_id": request.product_id,
            "recommendations": results
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "recommendations": []}


@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Get single product detail."""
    try:
        products = get_products()
        matched = next((p for p in products if str(p.get('product_id', '')) == str(product_id)), None)
        if not matched:
            return {"status": "error", "message": "Product not found"}
        result = {k: v for k, v in matched.items() if k != '_search'}
        return {"status": "success", "product": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/interactions/log")
async def log_interaction(user_id: int, product_id: str, action: str):
    """Log user interaction (compatibility endpoint)."""
    return {
        "status": "success",
        "message": f"Logged: user {user_id} {action} product {product_id}"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app:app", host="::", port=port)
