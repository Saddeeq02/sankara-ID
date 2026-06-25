from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from datetime import datetime
import math
from routes.settings import get_config

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def calculate_distance(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
    R = 6371000 # Earth radius in meters
    phi_1 = math.radians(lat1)
    phi_2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi_1) * math.cos(phi_2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("/", response_model=schemas.AttendanceResponse)
def clock_in_out(attendance: schemas.AttendanceCreate, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == attendance.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    if not staff.is_active:
        raise HTTPException(status_code=403, detail="Staff member is inactive")

    # Anti-Proxy Logic: verify device UUID
    is_proxy = False
    if staff.uuid and staff.uuid != attendance.device_uuid:
        is_proxy = True

    # If first time, auto-bind device UUID
    if not staff.uuid:
        staff.uuid = attendance.device_uuid
    
    # Check Location Distance (Configurable)
    config = get_config()
    company_lat = config.get("COMPANY_LAT", 11.9804)
    company_lon = config.get("COMPANY_LON", 8.4958)
    enforce_geofencing = config.get("ENFORCE_GEOFENCING", True)

    location_warning = None
    if enforce_geofencing:
        # We assume 200m radius
        distance = calculate_distance(attendance.latitude, attendance.longitude, company_lat, company_lon)
        if distance > 200:
            staff.out_of_bounds_attempts = (staff.out_of_bounds_attempts or 0) + 1
            if staff.out_of_bounds_attempts >= 2:
                staff.score = (staff.score or 0) - 10
                staff.out_of_bounds_attempts = 0 # reset after penalty
                location_warning = f"You are not at the office! Distance: {int(distance)}m. 10 Points deducted for repeat offense."
            else:
                location_warning = f"Please be punctual and clock in at the office. Distance: {int(distance)}m."
    
    # Use local time for punctuality checks
    now = datetime.now()
    today = now.date()

    db_attendance = db.query(models.Attendance).filter(
        models.Attendance.staff_id == attendance.staff_id,
        models.Attendance.date == today
    ).first()

    warning_msg = None
    time_int = now.hour * 100 + now.minute
    staff_score = staff.score or 0

    if attendance.action == "clock_in":
        is_first_clock_in = False
        if db_attendance:
            if db_attendance.clock_in_time:
                raise HTTPException(status_code=400, detail="You have already clocked in today.")
            is_first_clock_in = True
            db_attendance.clock_in_time = now
            if is_proxy:
                db_attendance.is_proxy = True
        else:
            is_first_clock_in = True
            db_attendance = models.Attendance(
                staff_id=attendance.staff_id,
                date=today,
                clock_in_time=now,
                is_proxy=is_proxy,
                latitude=attendance.latitude,
                longitude=attendance.longitude
            )
            db.add(db_attendance)
            
        if is_first_clock_in:
            if time_int <= 930:
                staff_score += 5
                warning_msg = "Clocked In successfully! +5 Points for punctuality."
            else:
                staff_score -= 2
                warning_msg = "Clocked In late. -2 Points penalty."


    elif attendance.action == "clock_out":
        is_first_clock_out = False
        if db_attendance:
            if db_attendance.clock_out_time:
                raise HTTPException(status_code=400, detail="You have already clocked out today.")
            is_first_clock_out = True
            db_attendance.clock_out_time = now
            if is_proxy:
                db_attendance.is_proxy = True
        else:
            is_first_clock_out = True
            db_attendance = models.Attendance(
                staff_id=attendance.staff_id,
                date=today,
                clock_out_time=now,
                is_proxy=is_proxy,
                latitude=attendance.latitude,
                longitude=attendance.longitude
            )
            db.add(db_attendance)
            
        if is_first_clock_out:
            base_msg = ""
            if not db_attendance.clock_in_time:
                base_msg = "Notice: You clocked out without clocking in. "
                
            if time_int < 1700:
                staff_score -= 2
                warning_msg = base_msg + "Clocked Out early. -2 Points penalty."
            elif time_int > 1900:
                staff_score -= 2
                warning_msg = base_msg + "Clocked out very late. -2 Points penalty."
            else:
                warning_msg = base_msg + "Successfully Clocked Out on time!"

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    # Combine warnings
    final_warning = location_warning if location_warning else warning_msg

    # Update staff score
    staff.score = staff_score

    db.commit()
    db.refresh(db_attendance)
    
    return schemas.AttendanceResponse(
        id=db_attendance.id,
        staff_id=db_attendance.staff_id,
        date=db_attendance.date,
        clock_in_time=db_attendance.clock_in_time,
        clock_out_time=db_attendance.clock_out_time,
        is_proxy=db_attendance.is_proxy,
        latitude=db_attendance.latitude,
        longitude=db_attendance.longitude,
        staff_name=staff.full_name,
        warning=final_warning
    )

@router.get("/", response_model=list[schemas.AttendanceResponse])
def get_all_attendance(db: Session = Depends(models.get_db)):
    attendances = db.query(models.Attendance).all()
    result = []
    for att in attendances:
        staff_name = att.staff.full_name if att.staff else "Unknown"
        result.append(schemas.AttendanceResponse(
            id=att.id,
            staff_id=att.staff_id,
            date=att.date,
            clock_in_time=att.clock_in_time,
            clock_out_time=att.clock_out_time,
            is_proxy=att.is_proxy,
            latitude=att.latitude,
            longitude=att.longitude,
            staff_name=staff_name
        ))
    return result

@router.get("/{staff_id}", response_model=list[schemas.AttendanceResponse])
def get_staff_attendance(staff_id: int, db: Session = Depends(models.get_db)):
    attendances = db.query(models.Attendance).filter(models.Attendance.staff_id == staff_id).all()
    result = []
    for att in attendances:
        staff_name = att.staff.full_name if att.staff else "Unknown"
        result.append(schemas.AttendanceResponse(
            id=att.id,
            staff_id=att.staff_id,
            date=att.date,
            clock_in_time=att.clock_in_time,
            clock_out_time=att.clock_out_time,
            is_proxy=att.is_proxy,
            staff_name=staff_name
        ))
    return result
