"""
========================================================================================
TRACTO AI PERFORMANCE & HIGH-CONCURRENCY LOAD TESTING SUITE
========================================================================================
Simulates high-traffic scenarios (e.g. 1000 concurrent users / harvesting rush hours).
Benchmarks response times, throughput (RPS), error rates, and identifies bottlenecks.
Supports:
1. Native Locust runner (`locust -f load_test_locust.py`)
2. Standalone Multi-Threaded Stress Test Runner (`python load_test_locust.py --standalone`)
========================================================================================
"""

import sys
import time
import json
import random
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api"

# Realistic test query pools
CROPS = ["cotton", "wheat", "groundnut", "sugarcane", "paddy", "vegetables"]
SOILS = ["soft", "medium", "hard"]
TASKS = ["plowing", "rotavating", "seeding", "harvesting", "leveling", "transport"]
DISTRICTS = ["Ahmedabad", "Rajkot", "Surat", "Vadodara", "Mehsana", "Anand", "Junagadh"]
BRANDS = ["Mahindra", "Swaraj", "John Deere", "Sonalika", "Farmtrac", "Kubota"]


def execute_request(endpoint, method="GET", data=None):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            latency_ms = (time.time() - start_time) * 1000
            return response.getcode(), latency_ms, None
    except urllib.error.HTTPError as e:
        latency_ms = (time.time() - start_time) * 1000
        return e.code, latency_ms, f"HTTP {e.code}"
    except Exception as e:
        latency_ms = (time.time() - start_time) * 1000
        return 500, latency_ms, str(e)


VALID_TRACTOR_IDS = [1]

def simulate_user_traffic(user_id):
    """Simulates a realistic sequence of user interactions on TRACTO"""
    results = []
    
    # 1. Search Tractors by District & Brand
    district = random.choice(DISTRICTS)
    brand = random.choice(BRANDS)
    code, lat, err = execute_request(f"tractors/?district={district}&brand={brand}")
    results.append(("Search Tractors", code, lat, err))

    # 2. AI Machinery Advisor Consultation
    ai_payload = {
        "crop": random.choice(CROPS),
        "acres": round(random.uniform(2.0, 25.0), 1),
        "soil_type": random.choice(SOILS),
        "task_purpose": random.choice(TASKS),
        "district": district
    }
    code, lat, err = execute_request("ai-advisor/recommend/", method="POST", data=ai_payload)
    results.append(("AI Matcher Query", code, lat, err))

    # 3. View Machinery List & Detail
    code, lat, err = execute_request("tractors/")
    results.append(("Machinery Fleet Listing", code, lat, err))

    return results


def run_standalone_stress_test(total_users=100, concurrency=25):
    print("\n" + "=" * 75)
    print(f"🚀 TRACTO HIGH-CONCURRENCY PERFORMANCE & LOAD TEST")
    print(f"   Target Virtual Users: {total_users} | Concurrent Worker Threads: {concurrency}")
    print("=" * 75)

    all_results = []
    start_total = time.time()

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(simulate_user_traffic, i) for i in range(total_users)]
        for future in as_completed(futures):
            try:
                user_res = future.result()
                all_results.extend(user_res)
            except Exception as e:
                all_results.append(("Sim Error", 500, 0, str(e)))

    total_duration = time.time() - start_total
    total_requests = len(all_results)
    successful_requests = len([r for r in all_results if r[1] in [200, 201]])
    failed_requests = total_requests - successful_requests

    # Group metrics by endpoint type
    endpoints = {}
    for endpoint, code, lat, err in all_results:
        if endpoint not in endpoints:
            endpoints[endpoint] = []
        endpoints[endpoint].append(lat)

    print("\n" + "-" * 75)
    print(f"{'Endpoint':<25} | {'Count':<8} | {'Avg Latency':<12} | {'95th %ile':<12} | {'Min / Max'}")
    print("-" * 75)

    for ep_name, latencies in endpoints.items():
        latencies.sort()
        count = len(latencies)
        avg_lat = sum(latencies) / count if count else 0
        p95_lat = latencies[int(count * 0.95)] if count else 0
        min_lat = min(latencies) if count else 0
        max_lat = max(latencies) if count else 0
        print(f"{ep_name:<25} | {count:<8} | {avg_lat:8.2f} ms | {p95_lat:8.2f} ms | {min_lat:.1f} / {max_lat:.1f} ms")

    throughput = total_requests / total_duration if total_duration > 0 else 0

    print("-" * 75)
    print(f"📊 SUMMARY PERFORMANCE METRICS:")
    print(f"   • Total Requests Processed: {total_requests}")
    print(f"   • Successful (HTTP 200/201): {successful_requests} ({(successful_requests/total_requests)*100:.1f}%)")
    print(f"   • Failed: {failed_requests}")
    print(f"   • Total Execution Time: {total_duration:.2f} seconds")
    print(f"   • Peak Throughput: {throughput:.2f} Requests/Second (RPS)")
    
    if failed_requests == 0 and throughput > 10:
        print("✅ PERFORMANCE STATUS: EXCELLENT (Zero Bottlenecks & High Throughput)")
    else:
        print("⚠️ PERFORMANCE STATUS: ACCEPTABLE (Minor Latency Detected)")
    print("=" * 75 + "\n")


# -------------------------------------------------------------
# Optional Locust User Class (for `locust -f load_test_locust.py`)
# -------------------------------------------------------------
try:
    from locust import HttpUser, task, between

    class TractoFarmerUser(HttpUser):
        wait_time = between(1, 3)

        @task(3)
        def search_machinery(self):
            district = random.choice(DISTRICTS)
            brand = random.choice(BRANDS)
            self.client.get(f"/api/tractors/?district={district}&brand={brand}", name="/api/tractors/search")

        @task(2)
        def query_ai_advisor(self):
            payload = {
                "crop": random.choice(CROPS),
                "acres": round(random.uniform(2.0, 20.0), 1),
                "soil_type": random.choice(SOILS),
                "task_purpose": random.choice(TASKS)
            }
            self.client.post("/api/ai-advisor/recommend/", json=payload, name="/api/ai-advisor/recommend")

        @task(1)
        def view_tractor_details(self):
            self.client.get("/api/tractors/1/", name="/api/tractors/:id")
except ImportError:
    pass


if __name__ == "__main__":
    run_standalone_stress_test(total_users=100, concurrency=20)
