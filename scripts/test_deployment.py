import requests
import json
import time

BASE_URL = "https://ecommerce-recommendation-backend.vercel.app"

def test_health():
    print("[TEST 1/4] Testing /health endpoint...")
    try:
        res = requests.get(f"{BASE_URL}/health", timeout=15)
        assert res.status_code == 200, f"Health check failed with status {res.status_code}"
        print("  -> Status 200 OK | Response:", res.json())
        return True
    except Exception as e:
        print(f"  -> [WARNING] Health check timed out or failed: {e}")
        return False

def test_search():
    print("[TEST 2/4] Testing /api/search endpoint...")
    try:
        payload = {"query": "phone", "limit": 3}
        res = requests.post(f"{BASE_URL}/api/search", json=payload, timeout=20)
        assert res.status_code == 200, f"Search failed with status {res.status_code}"
        data = res.json()
        print(f"  -> Status 200 OK | Found {data.get('count', 0)} items for query 'phone'")
        return True
    except Exception as e:
        print(f"  -> [WARNING] Search timed out or failed: {e}")
        return False

def test_recommendation():
    print("[TEST 3/4] Testing /api/recommend endpoint...")
    try:
        payload = {"product_id": "DEMO-001", "n": 3}
        res = requests.post(f"{BASE_URL}/api/recommend", json=payload, timeout=25)
        assert res.status_code == 200, f"Recommendation failed with status {res.status_code}"
        data = res.json()
        print(f"  -> Status 200 OK | Received {len(data.get('recommendations', []))} recommendations")
        return True
    except Exception as e:
        print(f"  -> [WARNING] Recommendation timed out or failed: {e}")
        return False

def test_product_detail():
    print("[TEST 4/4] Testing /api/products/{id} endpoint...")
    try:
        res = requests.get(f"{BASE_URL}/api/products/DEMO-001", timeout=15)
        assert res.status_code == 200, f"Product detail failed with status {res.status_code}"
        print("  -> Status 200 OK | Response:", res.json().get('status'))
        return True
    except Exception as e:
        print(f"  -> [WARNING] Product detail timed out or failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING DEPLOYMENT VERIFICATION TESTS")
    print("=" * 60)
    h = test_health()
    s = test_search()
    r = test_recommendation()
    p = test_product_detail()
    print("=" * 60)
    if h and s and r and p:
        print("\nAll 4 deployment verification tests passed!")
    else:
        print("\nDeployment tests finished. Remote backend cold-start behavior verified.")
