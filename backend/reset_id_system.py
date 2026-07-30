import models
from sqlalchemy import text, engine

def reset_id_system_database():
    db = next(models.get_db())
    print("Clearing test data from Sankara ID System database...")

    # Delete records from ID system tables ONLY
    db.query(models.ScoreHistory).delete()
    db.query(models.Task).delete()
    db.query(models.Attendance).delete()
    db.query(models.Complaint).delete()
    db.query(models.Announcement).delete()
    db.query(models.Staff).delete()

    db_type = models.engine.name
    print(f"Database dialect detected: {db_type}")

    if "postgresql" in db_type:
        try:
            db.execute(text("TRUNCATE TABLE staff, tasks, attendance, complaints, announcements, score_history RESTART IDENTITY CASCADE;"))
        except Exception as e:
            print(f"PostgreSQL sequence reset note: {e}")
    elif "sqlite" in db_type:
        try:
            db.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('staff', 'tasks', 'attendance', 'complaints', 'announcements', 'score_history');"))
        except Exception as e:
            print(f"SQLite sequence reset note: {e}")

    db.commit()
    print("Sankara ID System database successfully reset!")
    print("Next registered staff member will start cleanly at ID 1 (SANK-ID-0001).")

if __name__ == "__main__":
    reset_id_system_database()
