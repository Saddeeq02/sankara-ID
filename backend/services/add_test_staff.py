import os
import shutil
import sqlite3

db_path = "/home/fox/sankara_id/backend/sankara_id.db"
os.makedirs("/home/fox/sankara_id/backend/uploads", exist_ok=True)

# Copy avatar to uploads
src_avatar = "/home/fox/sankara_id/admin-client/test_avatar.png"
dest_avatar = "/home/fox/sankara_id/backend/uploads/staff_adebayo.png"
if os.path.exists(src_avatar):
    shutil.copy(src_avatar, dest_avatar)
    print("Copied avatar to uploads.")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Clear existing staff and tasks to ensure clean IDs
c.execute("DELETE FROM tasks")
c.execute("DELETE FROM attendances")
c.execute("DELETE FROM staff")

# Insert Adebayo Okonkwo as staff member #1 (with ID 1)
c.execute("""
    INSERT INTO staff (id, full_name, role, department, phone, email, address, education, username, password, picture_path, score, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    1,
    "Adebayo Okonkwo",
    "Head of Regional Sales",
    "Agri-Equipment",
    "+234 1 234 5678",
    "adebayo@sankaranigeria.com",
    "123 Sankara Way, Lagos, Nigeria",
    "B.Sc. Agricultural Engineering",
    "adebayo",
    "password123",
    "uploads/staff_adebayo.png",
    75, # starting score
    1 # active
))

# Insert test tasks
c.execute("""
    INSERT INTO tasks (title, description, points, status, staff_id)
    VALUES (?, ?, ?, ?, ?)
""", ("Verify Tractor Inventory", "Perform physical audit of all tractors in Warehouse A.", 50, "pending", 1))

c.execute("""
    INSERT INTO tasks (title, description, points, status, staff_id)
    VALUES (?, ?, ?, ?, ?)
""", ("Submit Q2 Sales Report", "Prepare and upload the regional sales statistics.", 100, "completed", 1))

c.execute("""
    INSERT INTO tasks (title, description, points, status, staff_id)
    VALUES (?, ?, ?, ?, ?)
""", ("Conduct Safety Training", "Hold the monthly safety briefing for team members.", 75, "approved", 1))

conn.commit()
conn.close()
print("Successfully inserted test staff and tasks into SQLite database.")
