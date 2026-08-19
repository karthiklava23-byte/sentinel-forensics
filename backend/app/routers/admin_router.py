import datetime
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
    """Get current settings — returns the configured API key for admin panel."""
    stored = db.find_one("settings", {"key": "gemini_api_key"})
    key = stored.get("value", "") if stored else (settings.GEMINI_API_KEY or "")
    return {
        "gemini_api_key": key,
        "gemini_api_key_configured": bool(key),
        "gemini_api_key_preview": f"{key[:8]}...{key[-4:]}" if key and len(key) > 12 else ("SET" if key else "NOT SET")
    }

from typing import Optional
from pydantic import BaseModel

class UserRoleUpdateRequest(BaseModel):
    role: str

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role_body: Optional[UserRoleUpdateRequest] = None,
    role: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """Update role for a user (admin, investigator, analyst). Accepts role in body or query."""
    target_role = (role_body.role if role_body and role_body.role else role or "").lower().strip()
    valid_roles = ["admin", "investigator", "analyst"]

    if target_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role '{target_role}'. Must be one of {valid_roles}")

    # Search user by id, email, or username
    target = db.find_one("users", {"id": user_id})
    if not target:
        target = db.find_one("users", {"email": user_id})
    if not target:
        target = db.find_one("users", {"username": user_id})

    if not target:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    target_id = target.get("id") or target.get("email")
    db.update_one("users", {"id": target.get("id", user_id)}, {"$set": {"role": target_role}})
    if target.get("email"):
        db.update_one("users", {"email": target.get("email")}, {"$set": {"role": target_role}})

    return {
        "message": f"User {target.get('email')} role updated to {target_role}",
        "user_id": target_id,
        "role": target_role
    }

@router.delete("/clear-all-cases")
def clear_all_cases(admin: dict = Depends(require_admin)):
    """Admin endpoint: Purge and remove all cases, evidence, and scans across all roles."""
    cases = db.find_many("cases")
    for c in cases:
        db.delete_one("cases", {"id": c.get("id")})
    evidences = db.find_many("evidence")
    for e in evidences:
        db.delete_one("evidence", {"id": e.get("id")})
    scans = db.find_many("user_scans")
    for s in scans:
        db.delete_one("user_scans", {"id": s.get("id")})
    alerts = db.find_many("analyst_alerts")
    for a in alerts:
        db.delete_one("analyst_alerts", {"id": a.get("id")})

    db.insert_one("logs", {
        "user_email": admin.get("email"),
        "action": "ADMIN_PURGE_ALL_DATA",
        "details": f"Purged {len(cases)} cases, {len(evidences)} evidence artifacts, {len(scans)} scans across all roles.",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return {
        "message": "All demo cases, evidence, scans, and alerts purged successfully.",
        "purged_cases_count": len(cases),
        "purged_evidence_count": len(evidences),
        "purged_scans_count": len(scans)
    }
