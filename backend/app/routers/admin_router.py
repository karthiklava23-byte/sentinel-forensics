from fastapi import APIRouter, HTTPException, Depends
from app.auth import get_current_user
from app.database import db
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin & System Settings"])

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin role required for this resource")
    return current_user

@router.get("/users")
def get_users(admin: dict = Depends(require_admin)):
    users = db.find_many("users")
    sanitized = []
    for u in users:
        sanitized.append({
            "id": u.get("id"),
            "username": u.get("username"),
            "email": u.get("email"),
            "full_name": u.get("full_name"),
            "role": u.get("role"),
            "created_at": u.get("created_at"),
            "is_active": u.get("is_active", True)
        })
    return sanitized

@router.get("/logs")
def get_audit_logs(admin: dict = Depends(require_admin)):
    logs = db.find_many("logs")
    return sorted(logs, key=lambda x: x.get("timestamp", ""), reverse=True)

@router.post("/settings")
def update_settings(gemini_api_key: str, admin: dict = Depends(require_admin)):
    settings.GEMINI_API_KEY = gemini_api_key
    return {"message": "Gemini AI Settings updated successfully"}
