import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.auth import get_current_user
from app.database import db
from app.services.email_forensics import parse_eml_file
from app.services.url_forensics import analyze_url
from app.services.pcap_forensics import parse_pcap_file
from app.services.malware_forensics import analyze_malware_file

router = APIRouter(prefix="/api/evidence", tags=["Forensic Evidence & Analysis"])

MALWARE_EXTENSIONS = {".exe", ".dll", ".apk", ".bin", ".sys", ".scr", ".com"}

@router.post("/upload/{case_id}")
async def upload_evidence(
    case_id: str,
    evidence_type: str = Form(...),
    file: Optional[UploadFile] = File(None),
    url_input: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    analysis_result = {}
    filename = "evidence_artifact"

    ev_type_upper = evidence_type.upper()

    if ev_type_upper == "EMAIL":
        if not file:
            raise HTTPException(status_code=400, detail="EML file required for email forensics")
        filename = file.filename
        content = await file.read()
        analysis_result = parse_eml_file(content, filename)

    elif ev_type_upper == "PCAP":
        if not file:
            raise HTTPException(status_code=400, detail="PCAP file required for network forensics")
        filename = file.filename
        content = await file.read()
        analysis_result = parse_pcap_file(content, filename)

    elif ev_type_upper == "URL":
        target_url = url_input or (file.filename if file else "http://example.com")
        filename = target_url
        analysis_result = analyze_url(target_url)

    elif ev_type_upper == "MALWARE":
        if not file:
            raise HTTPException(status_code=400, detail="Binary file required for malware forensics")
        filename = file.filename
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in MALWARE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(MALWARE_EXTENSIONS))}"
            )
        content = await file.read()
        analysis_result = analyze_malware_file(content, filename)

    else:
        filename = file.filename if file else "log_artifact.txt"
        analysis_result = {
            "filename": filename,
            "summary": "Log file uploaded and parsed into forensic timeline.",
            "threat_level": "MEDIUM"
        }

    evidence_id = str(uuid.uuid4())
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    evidence_doc = {
        "id":              evidence_id,
        "case_id":         case_id,
        "filename":        filename,
        "type":            ev_type_upper,
        "uploaded_at":     now_str,
        "uploaded_by":     current_user["email"],
        "analysis_result": analysis_result
    }
    db.insert_one("evidence", evidence_doc)

    # Update case evidence count & threat score
    evidences = db.find_many("evidence", {"case_id": case_id})
    new_count   = len(evidences)

    # Determine best threat score field for the evidence type
    if ev_type_upper == "MALWARE":
        threat_score = analysis_result.get("malware_risk_score", 70.0)
    else:
        threat_score = (
            analysis_result.get("phishing_score")
            or analysis_result.get("risk_score")
            or 70.0
        )

    db.update_one("cases", {"id": case_id}, {
        "$set": {
            "evidence_count": new_count,
            "updated_at":     now_str,
            "threat_score":   float(threat_score)
        }
    })

    db.insert_one("logs", {
        "user_email": current_user["email"],
        "action":     "EVIDENCE_UPLOAD",
        "details":    f"Uploaded {ev_type_upper} evidence '{filename}' to case {case.get('case_number')}",
        "timestamp":  now_str
    })

    return {
        "message": "Evidence analyzed and added to case successfully",
        "evidence": evidence_doc
    }


@router.post("/analyze-email")
async def analyze_email_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    return parse_eml_file(content, file.filename)


@router.post("/analyze-url")
def analyze_url_endpoint(url: str = Form(...)):
    return analyze_url(url)


@router.post("/analyze-pcap")
async def analyze_pcap_endpoint(file: UploadFile = File(...)):
    content = await file.read()
    return parse_pcap_file(content, file.filename)


@router.post("/analyze-malware")
async def analyze_malware_endpoint(file: UploadFile = File(...)):
    filename = file.filename or "unknown_binary"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in MALWARE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(MALWARE_EXTENSIONS))}"
        )
    content = await file.read()
    return analyze_malware_file(content, filename)
