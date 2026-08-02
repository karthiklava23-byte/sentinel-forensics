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
    # Update in-memory settings
    settings.GEMINI_API_KEY = gemini_api_key
    # Persist to database so it survives server restarts
    existing = db.find_one("settings", {"key": "gemini_api_key"})
    if existing:
        db.update_one("settings", {"key": "gemini_api_key"}, {"$set": {"value": gemini_api_key}})
    else:
        db.insert_one("settings", {"id": "gemini_api_key", "key": "gemini_api_key", "value": gemini_api_key})
    return {"message": "Gemini AI API key saved and activated successfully"}

@router.get("/settings")
def get_settings(admin: dict = Depends(require_admin)):
    """Get current settings — shows whether API key is configured."""
    stored = db.find_one("settings", {"key": "gemini_api_key"})
    key = stored.get("value", "") if stored else settings.GEMINI_API_KEY
    return {
        "gemini_api_key_configured": bool(key),
        "gemini_api_key_preview": f"{key[:8]}...{key[-4:]}" if key and len(key) > 12 else ("SET" if key else "NOT SET")
    }
