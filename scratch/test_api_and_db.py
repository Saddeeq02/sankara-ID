import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, '/home/fox/sankara_id/backend')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_endpoints():
    print("Testing GET / ...")
    r = client.get("/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    print("  Root OK:", r.json())

    print("Testing GET /staff/ ...")
    r = client.get("/staff/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    staff = r.json()
    print(f"  Staff list count: {len(staff)}")
    for s in staff:
        print(f"    - ID: {s['id']}, Name: {s['full_name']}, Picture: {s['picture_path']}")
        if s['picture_path']:
            pic_url = f"/{s['picture_path']}"
            r_pic = client.get(pic_url)
            print(f"      Image GET {pic_url} -> Status {r_pic.status_code}, Length: {len(r_pic.content)} bytes")
            assert r_pic.status_code == 200, f"Failed to get image {pic_url}"

    print("Testing GET /tasks/ ...")
    r = client.get("/tasks/")
    assert r.status_code == 200
    print(f"  Tasks count: {len(r.json())}")

    print("Testing GET /attendance/ ...")
    r = client.get("/attendance/")
    assert r.status_code == 200
    print(f"  Attendance logs count: {len(r.json())}")

    print("Testing GET /complaints/ ...")
    r = client.get("/complaints/")
    assert r.status_code == 200
    print(f"  Complaints count: {len(r.json())}")

    print("Testing GET /announcements/ ...")
    r = client.get("/announcements/")
    assert r.status_code == 200
    print(f"  Announcements count: {len(r.json())}")

    print("Testing GET /tractor_bg.png ...")
    r = client.get("/tractor_bg.png")
    assert r.status_code == 200, f"Expected 200 for tractor_bg, got {r.status_code}"
    print(f"  Tractor BG status: {r.status_code}, Length: {len(r.content)} bytes")

    print("ALL API ENDPOINT & IMAGE SERVING TESTS PASSED SUCCESSFULY!")

if __name__ == "__main__":
    test_endpoints()
