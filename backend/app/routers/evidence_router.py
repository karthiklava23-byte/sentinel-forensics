import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
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
async def analyze_email_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    content = await file.read()
    result = parse_eml_file(content, file.filename)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.insert_one("user_scans", {
        "id":         str(uuid.uuid4()),
        "user_email": current_user["email"],
        "scan_type":  "EMAIL",
        "target":     file.filename,
        "threat_level": str(result.get("threat_level", "UNKNOWN")),
        "risk_score": int(result.get("phishing_score", 0)),
        "scanned_at": now_str,
    })
    return result


@router.post("/analyze-url")
def analyze_url_endpoint(
    url: Optional[str] = Form(None),
    target_url: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    final_url = (url or target_url or "").strip()
    if not final_url:
        raise HTTPException(status_code=400, detail="Target URL parameter is required.")
    result = analyze_url(final_url)
    safe_result = {
        "url":               str(result.get("url", "")),
        "domain":            str(result.get("domain", "")),
        "is_https":          bool(result.get("is_https", False)),
        "domain_age_days":   int(result.get("domain_age_days", 0)),
        "whois_registrar":   str(result.get("whois_registrar", "Unknown")),
        "creation_date":     str(result.get("creation_date", "Unknown")),
        "ip_address":        str(result.get("ip_address", "N/A")),
        "country":           str(result.get("country", "N/A")),
        "risk_score":        int(result.get("risk_score", 0)),
        "threat_level":      str(result.get("threat_level", "UNKNOWN")),
        "suspicious_features": [str(f) for f in (result.get("suspicious_features") or [])],
        "phishing_indicator":bool(result.get("phishing_indicator", False)),
        "reputation":        str(result.get("reputation", "UNKNOWN")),
    }
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.insert_one("user_scans", {
        "id":         str(uuid.uuid4()),
        "user_email": current_user["email"],
        "scan_type":  "URL",
        "target":     final_url,
        "threat_level": safe_result["threat_level"],
        "risk_score": safe_result["risk_score"],
        "scanned_at": now_str,
    })
    return safe_result



@router.post("/analyze-pcap")
async def analyze_pcap_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    content = await file.read()
    result = parse_pcap_file(content, file.filename)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.insert_one("user_scans", {
        "id":         str(uuid.uuid4()),
        "user_email": current_user["email"],
        "scan_type":  "PCAP",
        "target":     file.filename,
        "threat_level": str(result.get("threat_level", "UNKNOWN")),
        "risk_score": int(result.get("risk_score", 0)),
        "scanned_at": now_str,
    })
    return result


@router.post("/analyze-malware")
async def analyze_malware_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    filename = file.filename or "unknown_binary"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in MALWARE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(MALWARE_EXTENSIONS))}"
        )
    content = await file.read()
    result = analyze_malware_file(content, filename)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.insert_one("user_scans", {
        "id":         str(uuid.uuid4()),
        "user_email": current_user["email"],
        "scan_type":  "MALWARE",
        "target":     filename,
        "threat_level": str(result.get("threat_level", "UNKNOWN")),
        "risk_score": int(result.get("malware_risk_score", 0)),
        "scanned_at": now_str,
    })
    return result
