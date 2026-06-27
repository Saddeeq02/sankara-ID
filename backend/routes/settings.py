from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsModel(BaseModel):
    COMPANY_LAT: float
    COMPANY_LON: float
    ENFORCE_GEOFENCING: bool

def get_settings_db(db: Session):
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.get("/", response_model=SettingsModel)
def read_settings(db: Session = Depends(models.get_db)):
    s = get_settings_db(db)
    return SettingsModel(
        COMPANY_LAT=s.company_lat,
        COMPANY_LON=s.company_lon,
        ENFORCE_GEOFENCING=s.enforce_geofencing
    )

@router.get("/debug/firebase")
def debug_firebase():
    from services.push import firebase_init_status
    return {"firebase_init_status": firebase_init_status}

@router.post("/", response_model=SettingsModel)
def update_settings(settings: SettingsModel, db: Session = Depends(models.get_db)):
    s = get_settings_db(db)
    s.company_lat = settings.COMPANY_LAT
    s.company_lon = settings.COMPANY_LON
    s.enforce_geofencing = settings.ENFORCE_GEOFENCING
    db.commit()
    db.refresh(s)
    return settings
