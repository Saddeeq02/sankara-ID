from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import models, schemas
from services.pdf_generator import generate_id_card
import os
import requests
import shutil
from typing import Optional
from pydantic import BaseModel


SUPABASE_URL = "https://srepwupmdnkbisyzixvy.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZXB3dXBtZG5rYmlzeXppeHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQwODU0OCwiZXhwIjoyMDk3OTg0NTQ4fQ.0ggdCbqLdPcYIaNq44sZ3McRqGu4IWMZNGwrxr7GRUg"

def upload_to_supabase(file_bytes, filename, content_type="image/jpeg"):
    url = f"{SUPABASE_URL}/storage/v1/object/staff-pictures/{filename}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": content_type
    }
    # Upsert to overwrite if it exists
    headers["x-upsert"] = "true"
    
    response = requests.post(url, headers=headers, data=file_bytes)
    if response.status_code in [200, 201]:
        return f"{SUPABASE_URL}/storage/v1/object/public/staff-pictures/{filename}"
    else:
        print("Supabase Upload Failed:", response.text)
        return None

router = APIRouter(prefix="/staff", tags=["Staff"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/", response_model=schemas.StaffResponse)
async def create_staff(
    full_name: str = Form(...),
    role: str = Form(...),
    department: str = Form(...),
    phone: str = Form(...),
    email: Optional[str] = Form(None),
    address: str = Form(...),
    education: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    picture: UploadFile = File(None),
    db: Session = Depends(models.get_db)
):
    # Check if username is already taken
    existing = db.query(models.Staff).filter(models.Staff.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username is already registered")

    picture_path = None
    if picture and picture.filename:
        # Save photo to uploads directory
        file_ext = os.path.splitext(picture.filename)[1]
        filename = f"staff_{username}{file_ext}"
        
        file_bytes = picture.file.read()
        public_url = upload_to_supabase(file_bytes, filename)
        picture_path = public_url if public_url else None

    db_staff = models.Staff(
        full_name=full_name,
        role=role,
        department=department,
        phone=phone,
        email=email,
        address=address,
        education=education,
        username=username,
        password=password,
        picture_path=picture_path
    )
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.post("/login")
def login_staff(req: LoginRequest, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(
        models.Staff.username == req.username,
        models.Staff.password == req.password
    ).first()
    
    if not staff:
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    return staff

@router.get("/", response_model=list[schemas.StaffResponse])
def get_all_staff(db: Session = Depends(models.get_db)):
    return db.query(models.Staff).all()

@router.get("/{staff_id}", response_model=schemas.StaffResponse)
def get_staff(staff_id: int, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff

@router.put("/{staff_id}", response_model=schemas.StaffResponse)
def update_staff(staff_id: int, update_data: schemas.StaffUpdate, db: Session = Depends(models.get_db)):
    db_staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    if update_data.full_name is not None:
        db_staff.full_name = update_data.full_name
    if update_data.role is not None:
        db_staff.role = update_data.role
    if update_data.department is not None:
        db_staff.department = update_data.department
    if update_data.phone is not None:
        db_staff.phone = update_data.phone
    if update_data.email is not None:
        db_staff.email = update_data.email
    if update_data.address is not None:
        db_staff.address = update_data.address
    if update_data.education is not None:
        db_staff.education = update_data.education
    if update_data.password is not None and update_data.password != "":
        db_staff.password = update_data.password
    if update_data.score is not None:
        db_staff.score = update_data.score
    
    if update_data.uuid is not None:
        if update_data.uuid == "":
            db_staff.uuid = None
        else:
            existing = db.query(models.Staff).filter(models.Staff.uuid == update_data.uuid).first()
            if existing and existing.id != staff_id:
                raise HTTPException(status_code=400, detail="UUID already bound to another staff member")
            db_staff.uuid = update_data.uuid

    if update_data.is_active is not None:
        db_staff.is_active = update_data.is_active

    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.get("/{staff_id}/id_card")
def get_id_card(staff_id: int, template: str = "agri", db: Session = Depends(models.get_db)):
    db_staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    pdf_path = generate_id_card(db_staff.id, db_staff.full_name, db_staff.role, db_staff.department, db_staff.picture_path, template=template)
    return FileResponse(pdf_path, media_type="application/pdf")

@router.post("/{staff_id}/picture", response_model=schemas.StaffResponse)
async def update_staff_picture(
    staff_id: int,
    picture: UploadFile = File(...),
    db: Session = Depends(models.get_db)
):
    db_staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    if picture and picture.filename:
        from PIL import Image
        import io
        
        file_ext = ".jpg"
        filename = f"staff_{db_staff.username}{file_ext}"
        
        contents = await picture.read()
        image = Image.open(io.BytesIO(contents))
        rgb_image = image.convert("RGB")
        out_bytes = io.BytesIO()
        rgb_image.save(out_bytes, "JPEG")
        
        public_url = upload_to_supabase(out_bytes.getvalue(), filename)
        if public_url:
            db_staff.picture_path = public_url
        db.commit()
        db.refresh(db_staff)
        
    return db_staff

@router.delete("/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(models.get_db)):
    db_staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    # Cascade clean up tasks and attendances
    db.query(models.Attendance).filter(models.Attendance.staff_id == staff_id).delete()
    db.query(models.Task).filter(models.Task.staff_id == staff_id).delete()
    
    # Delete profile photo if exists
    if db_staff.picture_path and os.path.exists(db_staff.picture_path):
        try:
            os.remove(db_staff.picture_path)
        except Exception as e:
            print(f"Error removing file {db_staff.picture_path}: {e}")
            
    db.delete(db_staff)
    db.commit()
    return {"detail": "Staff member and all associated records deleted successfully"}

@router.post("/reset_monthly_scores")
def reset_monthly_scores(db: Session = Depends(models.get_db)):
    from datetime import datetime
    now = datetime.now()
    month = now.month
    year = now.year

    staff_list = db.query(models.Staff).all()
    for staff in staff_list:
        if staff.score is not None and staff.score > 0:
            history = models.ScoreHistory(
                staff_id=staff.id,
                month=month,
                year=year,
                score=staff.score
            )
            db.add(history)
            staff.score = 0
            staff.out_of_bounds_attempts = 0
            
    db.commit()
    return {"detail": f"Monthly scores reset successfully for {month}/{year}"}

@router.get("/{staff_id}/score_history", response_model=list[schemas.ScoreHistoryResponse])
def get_score_history(staff_id: int, db: Session = Depends(models.get_db)):
    db_staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    return db.query(models.ScoreHistory).filter(models.ScoreHistory.staff_id == staff_id).all()
