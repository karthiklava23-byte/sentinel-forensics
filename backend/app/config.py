import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SENTINEL AI - Integrated Digital Forensics Platform"
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "digital_forensics_db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "cyber_forensics_super_secret_jwt_key_2026_antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
