import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models import CaseCreate, CaseUpdate, CaseResponse, CaseStatus, ThreatLevel
from app.auth import get_current_user
from app.database import db

router = APIRouter(prefix="/api/cases", tags=["Cases Management"])

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
