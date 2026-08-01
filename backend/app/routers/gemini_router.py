from fastapi import APIRouter, HTTPException, Depends
from app.models import GeminiChatRequest, GeminiChatResponse
from app.services.gemini_ai import answer_investigator_question, generate_natural_language_report
from app.auth import get_current_user
from app.database import db

router = APIRouter(prefix="/api/gemini", tags=["Gemini AI Investigation Assistant"])


@router.post("/chat", response_model=GeminiChatResponse)
def gemini_chat(req: GeminiChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Interactive Gemini AI DFIR Chat Assistant.
    Investigators can ask questions about forensic evidence and receive AI-powered answers.
    Optionally attach a case_id for context-aware responses.
    """
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    context = req.context
    if req.case_id and not context:
        # Auto-load case context
        case = db.find_one("cases", {"id": req.case_id})
        if case:
            evidence_list = db.find_many("evidence", {"case_id": req.case_id})
            from app.services.ai_correlation import correlate_case_evidence
            ai_report = correlate_case_evidence(req.case_id, case, evidence_list)
            context = (
                f"Case: {case.get('title')} ({case.get('case_number')})\n"
                f"Status: {case.get('status')} | Priority: {case.get('priority')} | Threat Score: {case.get('threat_score', 0)}/100\n"
                f"Executive Summary: {ai_report.get('executive_summary', 'N/A')}\n"
                f"Attack Vector: {ai_report.get('attack_vector', 'N/A')}\n"
                f"Evidence Modules: {[e.get('type') for e in evidence_list]}\n"
                f"Total IOCs: {len(ai_report.get('correlated_iocs', []))}"
            )

    result = answer_investigator_question(req.question, context)
    return GeminiChatResponse(**result)


@router.get("/report/{case_id}")
def generate_case_report(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generate a Gemini AI-powered natural language forensic investigation report for a case.
    """
    case = db.find_one("cases", {"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    evidence_list = db.find_many("evidence", {"case_id": case_id})
    from app.services.ai_correlation import correlate_case_evidence
    ai_report = correlate_case_evidence(case_id, case, evidence_list)

    nl_report = generate_natural_language_report(case, ai_report, evidence_list)

    return {
        "case_id": case_id,
        "natural_language_report": nl_report,
        "ai_report": ai_report
    }
