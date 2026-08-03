import os
import sys
import site

user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.routers import (
    auth_router, cases_router, evidence_router,
    analytics_router, admin_router
)
from app.routers import malware_router, threat_intel_router, gemini_router, analyst_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-Powered Integrated Digital Forensics Platform API — Gemini AI Edition",
    version="2.0.0"
)

# CORS configuration — allow all origins cleanly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
app.include_router(analyst_router.router)

@app.get("/api/health")
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

# Serve static frontend assets if embedded (Docker / Single-Server Deployments)
static_dir = os.path.join(os.path.dirname(__file__), "app", "static")
if not os.path.exists(static_dir):
    static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
