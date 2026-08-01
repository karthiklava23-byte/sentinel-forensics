import datetime
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models import UserRegister, UserLogin, UserResponse, Token, UserRole
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def ensure_default_users():
    admin = db.find_one("users", {"email": "karthiklava23@gmail.com"})
    if not admin:
        db.insert_one("users", {
            "id": "admin-karthiklava23",
            "username": "admin",
            "email": "karthiklava23@gmail.com",
            "password_hash": hash_password("karthiklava23-byte"),
            "full_name": "SENTINEL Lead Administrator",
            "role": UserRole.ADMIN,
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_active": True
        })

ensure_default_users()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister):
    existing = db.find_one("users", {"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Prevent public users from registering as admin
    if user_data.role and str(user_data.role).lower() in ["admin", "userrole.admin"]:
        raise HTTPException(status_code=400, detail="Admin registration is restricted.")
        
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": UserRole.INVESTIGATOR,
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "is_active": True
    }
    db.insert_one("users", new_user)
    
    db.insert_one("logs", {
        "user_email": user_data.email,
        "action": "USER_REGISTER",
        "details": f"New user account registered: {user_data.email}",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    return UserResponse(
        id=user_id,
        username=new_user["username"],
        email=new_user["email"],
        full_name=new_user["full_name"],
        role=new_user["role"],
        created_at=new_user["created_at"],
        is_active=True
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    user = db.find_one("users", {"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "investigator")})
    
    db.insert_one("logs", {
        "user_email": user["email"],
        "action": "USER_LOGIN",
        "details": f"Successful login for {user['email']}",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    user_resp = UserResponse(
        id=user.get("id", str(uuid.uuid4())),
        username=user.get("username", "user"),
        email=user["email"],
        full_name=user.get("full_name", "User"),
        role=user.get("role", UserRole.INVESTIGATOR),
        created_at=user.get("created_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        is_active=user.get("is_active", True)
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user.get("id", str(uuid.uuid4())),
        username=current_user.get("username", ""),
        email=current_user["email"],
        full_name=current_user.get("full_name", ""),
        role=current_user.get("role", UserRole.INVESTIGATOR),
        created_at=current_user.get("created_at", ""),
        is_active=current_user.get("is_active", True)
    )
