import requests

token = "sankara_super_secret_token_123"
headers = {"Authorization": f"Bearer {token}"}

# Create a small dummy file
with open("scratch/dummy.png", "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

files = {
    "image": ("dummy.png", open("scratch/dummy.png", "rb"), "image/png")
}

data = {
    "title": "Test Title Python",
    "date": "July 12, 2026",
    "summary": "This is a summary of the test upload."
}

# Post to local
try:
    print("Uploading to local...")
    res = requests.post("http://localhost:8080/api/gallery", headers=headers, data=data, files=files)
    print("Local status code:", res.status_code)
    print("Local response:", res.text)
except Exception as e:
    print("Local upload error:", e)

# Query local database
import sqlite3
try:
    conn = sqlite3.connect("sankara/backend/database/database.sqlite")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM gallery_items")
    rows = cursor.fetchall()
    print("Gallery items in SQLite database after upload:")
    for row in rows:
        print(row)
    conn.close()
except Exception as e:
    print("SQLite query error:", e)
