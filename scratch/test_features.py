import sys
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    print("Starting integration test for Staff Complaints & Announcements...")
    
    # 1. Create a temporary test staff member
    print("\n1. Creating test staff member...")
    staff_data = {
        "full_name": "Test Engineer",
        "role": "QA Tester",
        "department": "Engineering",
        "phone": "+23480000000",
        "email": "tester@sankaranigerialimited.com",
        "address": "123 Test Lane, Lagos",
        "education": "B.Sc. Computer Science",
        "username": f"tester_{int(time.time())}",
        "password": "password123"
    }
    
    # Note: Staff endpoint expects multipart/form-data
    res = requests.post(f"{BASE_URL}/staff/", data=staff_data)
    if res.status_code != 200:
        print(f"FAILED: Create staff returned {res.status_code}: {res.text}")
        sys.exit(1)
        
    staff = res.json()
    staff_id = staff["id"]
    print(f"SUCCESS: Created staff ID: {staff_id}, Username: {staff['username']}, Initial Score: {staff['score']}")
    
    # 2. Log a complaint / absence excuse
    print("\n2. Logging absence complaint...")
    complaint_data = {
        "type": "absence",
        "title": "Family Emergency",
        "description": "I will be absent tomorrow due to an urgent family matter.",
        "staff_id": staff_id
    }
    
    res = requests.post(f"{BASE_URL}/complaints/", json=complaint_data)
    if res.status_code != 200:
        print(f"FAILED: Create complaint returned {res.status_code}: {res.text}")
        sys.exit(1)
        
    complaint = res.json()
    complaint_id = complaint["id"]
    print(f"SUCCESS: Created complaint ID: {complaint_id}, Status: {complaint['status']}")
    
    # 3. Retrieve all complaints
    print("\n3. Fetching all complaints...")
    res = requests.get(f"{BASE_URL}/complaints/")
    if res.status_code != 200:
        print(f"FAILED: Fetch complaints returned {res.status_code}")
        sys.exit(1)
        
    all_complaints = res.json()
    found = any(c["id"] == complaint_id for c in all_complaints)
    if not found:
        print("FAILED: Logged complaint not found in all complaints list.")
        sys.exit(1)
    print("SUCCESS: Found logged complaint in admin list.")
    
    # 4. Retrieve complaints by staff ID
    print("\n4. Fetching complaints for staff member...")
    res = requests.get(f"{BASE_URL}/complaints/staff/{staff_id}")
    if res.status_code != 200:
        print(f"FAILED: Fetch staff complaints returned {res.status_code}")
        sys.exit(1)
        
    staff_complaints = res.json()
    if len(staff_complaints) != 1 or staff_complaints[0]["id"] != complaint_id:
        print(f"FAILED: Staff complaints list incorrect: {staff_complaints}")
        sys.exit(1)
    print("SUCCESS: Retrieved staff member's complaints list correctly.")
    
    # 5. MD Responds to Complaint and Awards Points
    print("\n5. MD responding and awarding points...")
    response_payload = {
        "status": "approved_with_points",
        "points_awarded": 15,
        "md_response": "Take care of your family. Approved with 15 points."
    }
    
    res = requests.put(f"{BASE_URL}/complaints/{complaint_id}/respond", json=response_payload)
    if res.status_code != 200:
        print(f"FAILED: MD respond returned {res.status_code}: {res.text}")
        sys.exit(1)
        
    updated_complaint = res.json()
    print(f"SUCCESS: Response logged. Status: {updated_complaint['status']}, Points: {updated_complaint['points_awarded']}, MD Comment: {updated_complaint['md_response']}")
    
    # 6. Verify staff score has increased
    print("\n6. Verifying staff score updated in database...")
    res = requests.get(f"{BASE_URL}/staff/{staff_id}")
    if res.status_code != 200:
        print(f"FAILED: Fetch staff returned {res.status_code}")
        sys.exit(1)
        
    updated_staff = res.json()
    if updated_staff["score"] != 15:
        print(f"FAILED: Staff score is {updated_staff['score']}, expected 15.")
        sys.exit(1)
    print(f"SUCCESS: Staff score updated successfully to {updated_staff['score']}")
    
    # 7. Post general announcement
    print("\n7. Posting general announcement...")
    announcement_data = {
        "title": "Scheduled Server Maintenance",
        "content": "The staff app will undergo scheduled maintenance tonight at 10 PM. Please save all progress."
    }
    res = requests.post(f"{BASE_URL}/announcements/", json=announcement_data)
    if res.status_code != 200:
        print(f"FAILED: Post announcement returned {res.status_code}: {res.text}")
        sys.exit(1)
        
    announcement = res.json()
    announcement_id = announcement["id"]
    print(f"SUCCESS: Announcement posted successfully with ID: {announcement_id}")
    
    # 8. Fetch announcements
    print("\n8. Fetching all announcements...")
    res = requests.get(f"{BASE_URL}/announcements/")
    if res.status_code != 200:
        print(f"FAILED: Fetch announcements returned {res.status_code}")
        sys.exit(1)
        
    all_announcements = res.json()
    found_announcement = any(a["id"] == announcement_id for a in all_announcements)
    if not found_announcement:
        print("FAILED: Posted announcement not found in history.")
        sys.exit(1)
    print("SUCCESS: Retrieved announcement history successfully.")
    
    # Clean up test staff
    print("\n9. Cleaning up test staff...")
    requests.delete(f"{BASE_URL}/staff/{staff_id}")
    print("SUCCESS: Test staff and all associated records deleted.")
    
    print("\nALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_flow()
