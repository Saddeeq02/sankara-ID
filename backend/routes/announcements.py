from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from services.push import send_push_notification
from typing import List

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.post("/", response_model=schemas.AnnouncementResponse)
def create_announcement(announcement: schemas.AnnouncementCreate, db: Session = Depends(models.get_db)):
    db_announcement = models.Announcement(**announcement.dict())
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    # Broadcast Push Notification to all active staff members with an FCM token
    active_staff = db.query(models.Staff).filter(
        models.Staff.is_active == True,
        models.Staff.fcm_token.isnot(None),
        models.Staff.fcm_token != ""
    ).all()
    
    for s in active_staff:
        try:
            send_push_notification(
                token=s.fcm_token,
                title="New Announcement: " + db_announcement.title,
                body=db_announcement.content,
                data={"announcement_id": str(db_announcement.id)}
            )
        except Exception as e:
            print(f"Failed to send announcement notification to staff {s.id}: {e}")
            
    return db_announcement

@router.get("/", response_model=List[schemas.AnnouncementResponse])
def get_all_announcements(db: Session = Depends(models.get_db)):
    return db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()
