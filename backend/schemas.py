from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# --- Staff Schemas ---
class StaffBase(BaseModel):
    full_name: str
    role: str
    department: str
    phone: str
    email: Optional[str] = None
    address: str
    education: str
    username: str

class StaffCreate(StaffBase):
    password: str

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    education: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    uuid: Optional[str] = None
    score: Optional[int] = None

class StaffResponse(StaffBase):
    id: int
    picture_path: Optional[str] = None
    uuid: Optional[str] = None
    is_active: bool
    score: int

    class Config:
        orm_mode = True
        from_attributes = True

# --- Attendance Schemas ---
class AttendanceCreate(BaseModel):
    staff_id: int
    action: str # "clock_in" or "clock_out"
    device_uuid: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceResponse(BaseModel):
    id: int
    staff_id: int
    date: date
    clock_in_time: Optional[datetime] = None
    clock_out_time: Optional[datetime] = None
    is_proxy: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    staff_name: Optional[str] = None
    warning: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    points: int = 10
    staff_id: int

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    status: str

    class Config:
        orm_mode = True
        from_attributes = True

# --- Score History Schemas ---
class ScoreHistoryResponse(BaseModel):
    id: int
    staff_id: int
    month: int
    year: int
    score: int

    class Config:
        orm_mode = True
        from_attributes = True
