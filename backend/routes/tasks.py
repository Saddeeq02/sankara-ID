from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from services.push import send_push_notification

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(models.get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == task.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Send Push Notification
    if staff.fcm_token:
        send_push_notification(
            token=staff.fcm_token,
            title="New Task Assigned!",
            body=f"You have been assigned a new task: {db_task.title}",
            data={"task_id": str(db_task.id)}
        )
        
    return db_task

@router.get("/", response_model=list[schemas.TaskResponse])
def get_tasks(db: Session = Depends(models.get_db)):
    return db.query(models.Task).all()

@router.get("/staff/{staff_id}", response_model=list[schemas.TaskResponse])
def get_staff_tasks(staff_id: int, db: Session = Depends(models.get_db)):
    return db.query(models.Task).filter(models.Task.staff_id == staff_id).all()

@router.put("/{task_id}/complete", response_model=schemas.TaskResponse)
def complete_task(task_id: int, db: Session = Depends(models.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}/approve", response_model=schemas.TaskResponse)
def approve_task(task_id: int, db: Session = Depends(models.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status != "completed":
        raise HTTPException(status_code=400, detail="Task must be completed before approval")
        
    task.status = "approved"
    
    # Award points to staff
    staff = db.query(models.Staff).filter(models.Staff.id == task.staff_id).first()
    if staff:
        staff.score += task.points

    db.commit()
    db.refresh(task)
    return task
