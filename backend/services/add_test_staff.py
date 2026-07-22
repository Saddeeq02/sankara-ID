import os
import shutil
import sqlite3

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(base_dir, "sankara_id.db")
uploads_dir = os.path.join(base_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)

# Copy avatar to uploads if present
src_avatar = os.path.join(os.path.dirname(base_dir), "admin-client", "test_avatar.png")
dest_avatar = os.path.join(uploads_dir, "staff_adebayo.png")
if os.path.exists(src_avatar):
    shutil.copy(src_avatar, dest_avatar)
    print("Copied avatar to uploads.")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Clear existing tables to ensure clean IDs
c.execute("DELETE FROM tasks")
c.execute("DELETE FROM attendances")
c.execute("DELETE FROM score_history")
c.execute("DELETE FROM complaints")
c.execute("DELETE FROM announcements")
c.execute("DELETE FROM system_settings")
c.execute("DELETE FROM staff")

# Insert Staff Members
staff_members = [
    (
        1,
        "Adebayo Okonkwo",
        "Head of Regional Sales",
        "Agri-Equipment",
        "+234 801 234 5678",
        "adebayo@sankaranigeria.com",
        "123 Sankara Way, Lagos, Nigeria",
        "B.Sc. Agricultural Engineering",
        "adebayo",
        "password123",
        "uploads/staff_adebayo.png",
        85,
        1
    ),
    (
        2,
        "Saddeeq Abubakar",
        "Senior Machinery Specialist",
        "Operations",
        "+234 802 345 6789",
        "saddeeq@sankaranigeria.com",
        "45 Industrial Layout, Kano, Nigeria",
        "M.Sc. Mechanical Engineering",
        "saddeeq",
        "password123",
        "uploads/staff_Saddeeq.jpg",
        92,
        1
    ),
    (
        3,
        "Abubakar Sadiq",
        "Field Logistics Coordinator",
        "Logistics",
        "+234 803 456 7890",
        "abubakar@sankaranigeria.com",
        "12 Commercial Avenue, Abuja, Nigeria",
        "B.Sc. Supply Chain Management",
        "abubakar",
        "password123",
        "uploads/staff_Abubakar.png",
        78,
        1
    )
]

for s in staff_members:
    c.execute("""
        INSERT INTO staff (id, full_name, role, department, phone, email, address, education, username, password, picture_path, score, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, s)

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

c.execute("""
    INSERT INTO tasks (title, description, points, status, staff_id)
    VALUES (?, ?, ?, ?, ?)
""", ("Inspect Harvester Implements", "Check hydraulic systems and cutter bars on Lovol harvesters.", 60, "completed", 2))

# Insert attendances
c.execute("""
    INSERT INTO attendances (staff_id, date, clock_in_time, clock_out_time, is_proxy, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (1, "2026-07-22", "2026-07-22 08:00:00", "2026-07-22 17:00:00", 0, 11.9804, 8.4958))

c.execute("""
    INSERT INTO attendances (staff_id, date, clock_in_time, clock_out_time, is_proxy, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (2, "2026-07-22", "2026-07-22 07:55:00", "2026-07-22 17:10:00", 0, 11.9804, 8.4958))

c.execute("""
    INSERT INTO attendances (staff_id, date, clock_in_time, clock_out_time, is_proxy, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (3, "2026-07-22", "2026-07-22 08:15:00", "2026-07-22 17:05:00", 0, 11.9804, 8.4958))

# Insert complaints
c.execute("""
    INSERT INTO complaints (staff_id, type, title, description, status, points_awarded, md_response, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", (1, "delay", "Traffic Delay at City Gate", "Unplanned road closure delayed arrival by 20 minutes.", "approved_with_points", 10, "Approved due to verified city gate construction.", "2026-07-20 09:00:00"))

# Insert announcements
c.execute("""
    INSERT INTO announcements (title, content, created_at)
    VALUES (?, ?, ?)
""", ("Scheduled Server Maintenance", "The staff app will undergo scheduled maintenance tonight at 10 PM. Please save all progress.", "2026-07-22 10:00:00"))

# Insert system settings
c.execute("""
    INSERT INTO system_settings (id, company_lat, company_lon, enforce_geofencing)
    VALUES (?, ?, ?, ?)
""", (1, 11.9804, 8.4958, 1))

conn.commit()
conn.close()
print("Successfully inserted test staff, tasks, attendances, complaints, and system settings into SQLite database.")

