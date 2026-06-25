from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter(prefix="/settings", tags=["Settings"])

CONFIG_FILE = "config.json"

class SettingsModel(BaseModel):
    COMPANY_LAT: float
    COMPANY_LON: float
    ENFORCE_GEOFENCING: bool

def get_config():
    if not os.path.exists(CONFIG_FILE):
        return {
            "COMPANY_LAT": 11.9804,
            "COMPANY_LON": 8.4958,
            "ENFORCE_GEOFENCING": True
        }
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def save_config(config_data):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config_data, f, indent=4)

@router.get("/", response_model=SettingsModel)
def read_settings():
    return get_config()

@router.post("/", response_model=SettingsModel)
def update_settings(settings: SettingsModel):
    save_config(settings.dict())
    return settings
