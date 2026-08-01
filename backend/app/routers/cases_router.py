import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models import CaseCreate, CaseUpdate, CaseResponse, CaseStatus, ThreatLevel
from app.auth import get_current_user
from app.database import db

router = APIRouter(prefix="/api/cases", tags=["Cases Management"])

def ensure_sample_cases():
    cases = db.find_many("cases")
    if not cases:
        c1_id = str(uuid.uuid4())
        c1 = {
            "id": c1_id,
            "case_number": "CASE-2026-0891",
            "title": "Operation Red Line: Executive Spear-Phishing & Data Exfiltration",
            "description": "Investigating targeted spear-phishing attack directed at C-level executive containing malicious attachments and fake Microsoft SSO credential harvester.",
            "category": "Spear Phishing & C2",
            "status": CaseStatus.IN_PROGRESS,
            "priority": ThreatLevel.CRITICAL,
            "assigned_to": "Lead DFIR Investigator",
            "created_by": "admin@cybertrace.io",
            "created_at": "2026-07-27 18:30:00",
            "updated_at": "2026-07-27 21:15:00",
            "evidence_count": 3,
            "threat_score": 88.5
        }
        db.insert_one("cases", c1)
        
        # Preseed evidence for case 1
        db.insert_one("evidence", {
            "id": str(uuid.uuid4()),
            "case_id": c1_id,
            "filename": "urgent_wire_transfer_request.eml",
            "type": "EMAIL",
            "uploaded_at": "2026-07-27 18:40:00",
            "analysis_result": {
                "filename": "urgent_wire_transfer_request.eml",
                "sender": "sec-alert@auth-update-microsoft.com",
                "recipient": "cfo@enterprise-corp.com",
                "subject": "URGENT: Executive Account Password Expiration Alert",
                "date": "2026-07-27 18:00:00",
                "spf_status": "FAIL",
                "dkim_status": "FAIL",
                "dmarc_status": "FAIL",
                "hop_ips": ["185.220.101.5", "45.33.32.156"],
                "suspicious_keywords": ["urgent action required", "password reset", "unauthorized login"],
                "attachments": [{"filename": "Invoice_Update_2026.pdf.exe", "size_bytes": 412000, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "is_suspicious": True}],
                "phishing_score": 92,
                "threat_level": "CRITICAL",
                "summary": "High risk phishing email detected with failing SPF/DKIM authentication and executable payload attachment."
            }
        })
        
        db.insert_one("evidence", {
            "id": str(uuid.uuid4()),
            "case_id": c1_id,
            "filename": "login.auth-secure-update.xyz",
            "type": "URL",
            "uploaded_at": "2026-07-27 18:45:00",
            "analysis_result": {
                "url": "http://login.auth-secure-update.xyz/microsoft/login",
                "domain": "login.auth-secure-update.xyz",
                "is_https": False,
                "domain_age_days": 3,
                "whois_registrar": "NameCheap Inc Privacy Protection",
                "creation_date": "2026-07-24",
                "ip_address": "45.33.32.156",
                "country": "RU",
                "risk_score": 85,
                "threat_level": "CRITICAL",
                "suspicious_features": ["Target Brand Spoofing detected: domain contains 'microsoft'", "Missing SSL/TLS encryption", "Newly registered domain (<7 days old)"],
                "phishing_indicator": True,
                "reputation": "MALICIOUS / HIGH RISK PHISHING"
            }
        })

        db.insert_one("evidence", {
            "id": str(uuid.uuid4()),
            "case_id": c1_id,
            "filename": "host_traffic_capture.pcap",
            "type": "PCAP",
            "uploaded_at": "2026-07-27 19:00:00",
            "analysis_result": {
                "filename": "host_traffic_capture.pcap",
                "total_packets": 320,
                "duration_seconds": 120.0,
                "protocols": {"TCP": 210, "UDP": 70, "HTTP": 30, "DNS": 10},
                "top_source_ips": [{"ip": "192.168.1.105", "count": 180}, {"ip": "185.220.101.5", "count": 140}],
                "top_dest_ips": [{"ip": "185.220.101.5", "count": 140}, {"ip": "8.8.8.8", "count": 20}],
                "dns_queries": ["login.auth-secure-update.xyz", "api.c2-command-node.ru"],
                "http_requests": [{"method": "POST", "url": "http://45.33.32.156/login.php", "user_agent": "Mozilla/5.0", "status": "200 OK"}],
                "suspicious_activities": [
                    {"type": "C2 Server Beaconing", "source_ip": "192.168.1.105", "target_ip": "185.220.101.5", "details": "Active C2 channel heartbeats detected.", "severity": "CRITICAL"}
                ],
                "threat_level": "CRITICAL",
                "summary": "Network PCAP confirms compromised workstation actively communicating with C2 infrastructure."
            }
        })

ensure_sample_cases()

@router.get("", response_model=List[CaseResponse])
def get_cases(
    q: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    cases = db.find_many("cases")
    filtered = []
    for c in cases:
        if status and c.get("status") != status:
            continue
        if priority and c.get("priority") != priority:
            continue
        if q:
            query = q.lower()
            match = query in c.get("title", "").lower() or query in c.get("case_number", "").lower() or query in c.get("description", "").lower()
            if not match:
                continue
        filtered.append(CaseResponse(
            id=c["id"],
            case_number=c.get("case_number", "CASE-000"),
            title=c.get("title", ""),
            description=c.get("description", ""),
            category=c.get("category", "General"),
            status=c.get("status", CaseStatus.OPEN),
            priority=c.get("priority", ThreatLevel.MEDIUM),
            assigned_to=c.get("assigned_to", "Unassigned"),
            created_by=c.get("created_by", "system"),
            created_at=c.get("created_at", ""),
            updated_at=c.get("updated_at", ""),
            evidence_count=c.get("evidence_count", 0),
            threat_score=c.get("threat_score", 0.0)
        ))
    return filtered

@router.post("", response_model=CaseResponse)
def create_case(case_in: CaseCreate, current_user: dict = Depends(get_current_user)):
    case_id = str(uuid.uuid4())
    case_num = f"CASE-{datetime.datetime.now().year}-{str(uuid.uuid4().int)[:4]}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    new_case = {
        "id": case_id,
        "case_number": case_num,
        "title": case_in.title,
        "description": case_in.description,
        "category": case_in.category,
        "status": CaseStatus.OPEN,
        "priority": case_in.priority,
        "assigned_to": case_in.assigned_to or current_user.get("full_name", "Investigator"),
        "created_by": current_user["email"],
        "created_at": now_str,
        "updated_at": now_str,
        "evidence_count": 0,
        "threat_score": 0.0
    }
    db.insert_one("cases", new_case)
    
    db.insert_one("logs", {
        "user_email": current_user["email"],
        "action": "CASE_CREATE",
        "details": f"Created case {case_num}: '{case_in.title}'",
        "timestamp": now_str
    })
    
    return CaseResponse(**new_case)

@router.get("/{case_id}")
def get_case_detail(case_id: str, current_user: dict = Depends(get_current_user)):
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    evidence_list = db.find_many("evidence", {"case_id": case_id})
    
    # Run AI Correlation on demand if evidence exists
    from app.services.ai_correlation import correlate_case_evidence
    ai_report = correlate_case_evidence(case_id, case, evidence_list)
    
    return {
        "case": case,
        "evidence": evidence_list,
        "ai_report": ai_report
    }

@router.put("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, case_update: CaseUpdate, current_user: dict = Depends(get_current_user)):
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    update_data = {k: v for k, v in case_update.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    updated = db.update_one("cases", {"id": case_id}, {"$set": update_data})
    
    db.insert_one("logs", {
        "user_email": current_user["email"],
        "action": "CASE_UPDATE",
        "details": f"Updated case {case.get('case_number')}: {list(update_data.keys())}",
        "timestamp": update_data["updated_at"]
    })
    
    return CaseResponse(**updated)

@router.delete("/{case_id}")
def delete_case(case_id: str, current_user: dict = Depends(get_current_user)):
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    db.delete_one("cases", {"id": case_id})
    # delete associated evidence
    evidences = db.find_many("evidence", {"case_id": case_id})
    for ev in evidences:
        db.delete_one("evidence", {"id": ev["id"]})
        
    db.insert_one("logs", {
        "user_email": current_user["email"],
        "action": "CASE_DELETE",
        "details": f"Deleted case {case.get('case_number')}",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    return {"message": "Case and associated evidence deleted successfully"}
