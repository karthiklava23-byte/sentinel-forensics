from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.services.threat_intel import lookup_ioc, enrich_iocs_from_evidence, get_threat_intel_summary
from app.auth import get_current_user
from app.database import db

router = APIRouter(prefix="/api/threat-intel", tags=["Threat Intelligence"])


class IOCLookupRequest(BaseModel):
    ioc_type: str   # IP, DOMAIN, URL, HASH, EMAIL
    ioc_value: str


class BulkIOCRequest(BaseModel):
    iocs: List[IOCLookupRequest]


@router.post("/lookup")
def lookup_single_ioc(req: IOCLookupRequest, current_user: dict = Depends(get_current_user)):
    """
    Look up a single IOC (IP, domain, URL, hash, email) against threat intelligence feeds.
    Returns reputation score, malware families, known campaigns, and severity.
    """
    if not req.ioc_value or not req.ioc_value.strip():
        raise HTTPException(status_code=400, detail="IOC value cannot be empty.")
    result = lookup_ioc(req.ioc_type, req.ioc_value.strip())
    return result


@router.post("/lookup/bulk")
def lookup_bulk_iocs(req: BulkIOCRequest, current_user: dict = Depends(get_current_user)):
    """Look up multiple IOCs at once and return consolidated results + summary."""
    if not req.iocs:
        raise HTTPException(status_code=400, detail="No IOCs provided.")
    results = [lookup_ioc(i.ioc_type, i.ioc_value.strip()) for i in req.iocs]
    summary = get_threat_intel_summary(results)
    return {"results": results, "summary": summary}


@router.get("/case/{case_id}")
def get_case_threat_intel(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Auto-enrich all IOCs from a case's evidence with threat intelligence data.
    Returns per-IOC results and an aggregate summary.
    """
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    evidence_list = db.find_many("evidence", {"case_id": case_id})
    ti_results = enrich_iocs_from_evidence(evidence_list)
    summary = get_threat_intel_summary(ti_results)

    return {
        "case_id": case_id,
        "ioc_results": ti_results,
        "summary": summary
    }


@router.get("/summary")
def get_global_threat_intel_summary(current_user: dict = Depends(get_current_user)):
    """Get a global threat intelligence summary across all active cases."""
    all_evidence = db.find_many("evidence")
    ti_results = enrich_iocs_from_evidence(all_evidence)
    summary = get_threat_intel_summary(ti_results)

    return {
        "global_summary": summary,
        "total_evidence_processed": len(all_evidence),
        "ioc_results": ti_results[:50]   # cap at 50 for response size
    }
