import models
from routes.staff import extract_name_credentials

def sync_existing_staff():
    db = next(models.get_db())
    staff_members = db.query(models.Staff).all()
    print(f"Syncing credentials for {len(staff_members)} existing staff members...")

    for s in staff_members:
        first_name, second_name = extract_name_credentials(s.full_name)
        old_user = s.username
        old_pass = s.password

        # Set password to second name
        s.password = second_name

        # Ensure username is valid first_name
        if not s.username or s.username.startswith("staff_"):
            s.username = first_name

        print(f"ID {s.id}: '{s.full_name}' | User: '{old_user}' -> '{s.username}' | Pass: '{old_pass}' -> '{s.password}'")

    db.commit()
    print("All existing staff credentials synced successfully!")

if __name__ == "__main__":
    sync_existing_staff()
