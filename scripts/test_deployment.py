import requests
import json

BASE_URL = "https://ecommerce-recommendation-backend.vercel.app"

def test_health():
    print("[TEST 1/2] Testing /health endpoint...")
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    print("  -> Status 200 OK | Response:", res.json())

def test_search():
    print("[TEST 2/2] Testing /api/search endpoint...")
    payload = {"query": "cable", "limit": 3}
    res = requests.post(f"{BASE_URL}/api/search", json=payload)
    assert res.status_code == 200, f"Search failed with {res.status_code}"
    data = res.json()
    print(f"  -> Found {data.get('count', 0)} items for query 'cable'")

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING DEPLOYMENT VERIFICATION TESTS")
    print("=" * 60)
    test_health()
    test_search()
    print("\nAll deployment verification tests passed!")
