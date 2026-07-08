from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from services.push import send_push_notification
from typing import List

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/", response_model=schemas.ComplaintResponse)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == complaint.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
        
    db_complaint = models.Complaint(**complaint.dict())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    # Optional: notify admin if FCM exists for admin or just print/log
    print(f"Complaint logged by {staff.full_name}: {db_complaint.title}")
    
    # Populate staff_name manually for response compatibility
    db_complaint.staff_name = staff.full_name
    return db_complaint

@router.get("/", response_model=List[schemas.ComplaintResponse])
def get_all_complaints(db: Session = Depends(models.get_db)):
    complaints = db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
    for c in complaints:
        if c.staff:
            c.staff_name = c.staff.full_name
    return complaints

@router.get("/staff/{staff_id}", response_model=List[schemas.ComplaintResponse])
def get_staff_complaints(staff_id: int, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
        
    complaints = db.query(models.Complaint).filter(models.Complaint.staff_id == staff_id).order_by(models.Complaint.created_at.desc()).all()
    for c in complaints:
        c.staff_name = staff.full_name
    return complaints

@router.put("/{complaint_id}/respond", response_model=schemas.ComplaintResponse)
def respond_to_complaint(complaint_id: int, payload: schemas.ComplaintRespondPayload, db: Session = Depends(models.get_db)):
    db_complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    db_complaint.status = payload.status
    db_complaint.md_response = payload.md_response
    
    if payload.status == "approved_with_points":
        db_complaint.points_awarded = payload.points_awarded
        # Add points to staff score
        if db_complaint.staff:
            db_complaint.staff.score = (db_complaint.staff.score or 0) + payload.points_awarded
    else:
        db_complaint.points_awarded = 0
        
    db.commit()
    db.refresh(db_complaint)
    
    # Notify staff member via FCM
    if db_complaint.staff and db_complaint.staff.fcm_token:
        status_text = "approved" if "approved" in payload.status else "rejected"
        points_text = f" and awarded {payload.points_awarded} points" if payload.status == "approved_with_points" else ""
        send_push_notification(
            token=db_complaint.staff.fcm_token,
            title="Complaint Status Updated",
            body=f"Your complaint '{db_complaint.title}' has been {status_text}{points_text}.",
            data={"complaint_id": str(db_complaint.id)}
        )
        
    if db_complaint.staff:
        db_complaint.staff_name = db_complaint.staff.full_name
        
    return db_complaint
