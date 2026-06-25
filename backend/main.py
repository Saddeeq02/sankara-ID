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

# Serve uploaded profile pictures
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from routes import staff, attendance, tasks, settings

app.include_router(staff.router)
app.include_router(attendance.router)
app.include_router(tasks.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sankara ID API"}

@app.get("/tractor_bg.png")
def get_tractor_bg():
    return FileResponse("/home/fox/.gemini/antigravity/brain/a06d73b6-7044-4d08-b40b-de4994c92983/tractor_background_1782322788371.png")
