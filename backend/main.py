import sys
import site
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth_router, cases_router, evidence_router,
    analytics_router, admin_router
)
from app.routers import malware_router, threat_intel_router, gemini_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-Powered Integrated Digital Forensics Platform API — Gemini AI Edition",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(cases_router.router)
app.include_router(evidence_router.router)
app.include_router(analytics_router.router)
app.include_router(admin_router.router)
app.include_router(malware_router.router)
app.include_router(threat_intel_router.router)
app.include_router(gemini_router.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "api_docs": "/docs",
        "version": "2.0.0",
        "ai_engine": "Google Gemini AI Investigation Assistant",
        "modules": [
            "Email Forensics",
            "URL Threat Analysis",
            "Network PCAP Forensics",
            "Malware Forensics",
            "Threat Intelligence",
            "Gemini AI Correlation Engine"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
