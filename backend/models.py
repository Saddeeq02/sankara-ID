from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

import os

# Default to local SQLite if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sankara_id.db")

# If using PostgreSQL (like Supabase), we don't need check_same_thread
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Render/Supabase sometimes uses postgres:// instead of postgresql://
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    role = Column(String)
    department = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    address = Column(String, nullable=False)
    education = Column(String, nullable=False)
    picture_path = Column(String, nullable=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    uuid = Column(String, unique=True, index=True, nullable=True) # Device ID binding
    is_active = Column(Boolean, default=True)
    score = Column(Integer, default=0)
    out_of_bounds_attempts = Column(Integer, default=0)

    attendances = relationship("Attendance", back_populates="staff")
    tasks = relationship("Task", back_populates="assigned_to")
    score_histories = relationship("ScoreHistory", back_populates="staff", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"))
    date = Column(Date, default=lambda: datetime.utcnow().date())
    clock_in_time = Column(DateTime, nullable=True)
    clock_out_time = Column(DateTime, nullable=True)
    is_proxy = Column(Boolean, default=False) # flagged if UUID doesn't match
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    staff = relationship("Staff", back_populates="attendances")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    points = Column(Integer, default=10)
    status = Column(String, default="pending") # pending, completed, approved
    staff_id = Column(Integer, ForeignKey("staff.id"))

    assigned_to = relationship("Staff", back_populates="tasks")

class ScoreHistory(Base):
    __tablename__ = "score_history"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"))
    month = Column(Integer)
    year = Column(Integer)
    score = Column(Integer)

    staff = relationship("Staff", back_populates="score_histories")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_lat = Column(Float, default=11.9804)
    company_lon = Column(Float, default=8.4958)
    enforce_geofencing = Column(Boolean, default=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
