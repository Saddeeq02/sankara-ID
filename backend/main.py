from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models

# In a real app, you would use Alembic for migrations
# For this prototype, we'll just create the tables if they don't exist
models.Base.metadata.create_all(bind=models.engine)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Sankara ID API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

# Serve uploaded profile pictures using absolute path
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

from routes import staff, attendance, tasks, settings, complaints, announcements

app.include_router(staff.router)
app.include_router(attendance.router)
app.include_router(tasks.router)
app.include_router(settings.router)
app.include_router(complaints.router)
app.include_router(announcements.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sankara ID API"}

@app.get("/tractor_bg.png")
def get_tractor_bg():
    bg_path = os.path.join(uploads_dir, "tractor_bg.png")
    if not os.path.exists(bg_path):
        bg_path = os.path.join(uploads_dir, "techco_bg.png")
    return FileResponse(bg_path)

