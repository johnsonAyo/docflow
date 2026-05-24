import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def print_res(res, name):
    print(f"--- {name} ---")
    print(f"Status: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)
    print()

print("Waiting for server...")
for _ in range(5):
    try:
        res = requests.get(f"{BASE_URL}/health")
        if res.status_code == 200:
            print("Server is up!")
            break
    except:
        time.sleep(1)

# Health
res = requests.get(f"{BASE_URL}/health")
print_res(res, "GET /health")

# Create Workflow
res = requests.post(f"{BASE_URL}/api/v1/workflows", json={
    "name": "Smoke Test Workflow",
    "document_type": "Invoice"
})
print_res(res, "POST /api/v1/workflows")

if res.status_code in (200, 201):
    wf_id = res.json()["id"]

    # Get Workflow
    res = requests.get(f"{BASE_URL}/api/v1/workflows/{wf_id}")
    print_res(res, "GET /api/v1/workflows/{id}")

    # List Workflows
    res = requests.get(f"{BASE_URL}/api/v1/workflows")
    print_res(res, "GET /api/v1/workflows")

    # Upload Artifact
    res = requests.put(
        f"{BASE_URL}/api/v1/documents/artifacts/test-upload.txt",
        data=b"Hello, DocFlow!",
        headers={"Content-Type": "text/plain"}
    )
    print_res(res, "PUT /api/v1/documents/artifacts/test-upload.txt")
