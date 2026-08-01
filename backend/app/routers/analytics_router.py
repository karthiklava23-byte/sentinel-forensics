from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.database import db

router = APIRouter(prefix="/api/analytics", tags=["Dashboard & Analytics"])

@router.get("/dashboard")
def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    cases     = db.find_many("cases")
    evidences = db.find_many("evidence")
    logs      = db.find_many("logs")

    total_cases    = len(cases)
    open_cases     = len([c for c in cases if c.get("status") in ["OPEN", "IN_PROGRESS"]])
    resolved_cases = len([c for c in cases if c.get("status") in ["RESOLVED", "CLOSED"]])
    critical_cases = len([c for c in cases if c.get("priority") == "CRITICAL"])

    threat_distribution = {
        "CRITICAL": len([c for c in cases if c.get("priority") == "CRITICAL"]),
        "HIGH":     len([c for c in cases if c.get("priority") == "HIGH"]),
        "MEDIUM":   len([c for c in cases if c.get("priority") == "MEDIUM"]),
        "LOW":      len([c for c in cases if c.get("priority") == "LOW"]),
    }

    evidence_type_breakdown = {
        "EMAIL":   len([e for e in evidences if e.get("type") == "EMAIL"]),
        "URL":     len([e for e in evidences if e.get("type") == "URL"]),
        "PCAP":    len([e for e in evidences if e.get("type") == "PCAP"]),
        "LOG":     len([e for e in evidences if e.get("type") == "LOG"]),
        "MALWARE": len([e for e in evidences if e.get("type") == "MALWARE"]),
    }

    # ── Malware Forensics Statistics ──────────────────────────────────────────
    malware_evidences  = [e for e in evidences if e.get("type") == "MALWARE"]
    malware_results    = [e.get("analysis_result", {}) for e in malware_evidences]
    high_risk_malware  = len([r for r in malware_results if r.get("malware_risk_score", 0) >= 70])
    avg_entropy        = round(
        sum(r.get("entropy", 0) for r in malware_results) / len(malware_results), 2
    ) if malware_results else 0.0
    total_api_flags    = sum(len(r.get("suspicious_api_calls", [])) for r in malware_results)
    packed_samples     = len([r for r in malware_results if r.get("is_packed")])

    malware_families_all = []
    for r in malware_results:
        fam = r.get("malware_family_hint")
        if fam:
            malware_families_all.append(fam)
    unique_malware_families = list(set(malware_families_all))

    malware_stats = {
        "total_samples_analyzed": len(malware_evidences),
        "high_risk_count": high_risk_malware,
        "avg_entropy": avg_entropy,
        "packed_samples": packed_samples,
        "total_flagged_api_calls": total_api_flags,
        "detected_malware_families": unique_malware_families[:5],
        "critical_malware": len([r for r in malware_results if r.get("threat_level") == "CRITICAL"])
    }

    # ── Threat Intelligence Statistics ────────────────────────────────────────
    try:
        from app.services.threat_intel import enrich_iocs_from_evidence, get_threat_intel_summary
        ti_results = enrich_iocs_from_evidence(evidences)
        ti_summary = get_threat_intel_summary(ti_results)
    except Exception:
        ti_results = []
        ti_summary = {
            "total_iocs_checked": 0,
            "malicious_count": 0,
            "suspicious_count": 0,
            "clean_count": 0,
            "unique_malware_families": [],
            "known_attack_campaigns": [],
            "overall_severity": "LOW",
            "critical_iocs": []
        }

    threat_intel_stats = {
        "total_iocs_queried":         ti_summary.get("total_iocs_checked", 0),
        "malicious_ioc_count":        ti_summary.get("malicious_count", 0),
        "suspicious_ioc_count":       ti_summary.get("suspicious_count", 0),
        "clean_ioc_count":            ti_summary.get("clean_count", 0),
        "active_malware_families":    ti_summary.get("unique_malware_families", [])[:5],
        "active_attack_campaigns":    ti_summary.get("known_attack_campaigns", [])[:5],
        "overall_ti_severity":        ti_summary.get("overall_severity", "LOW"),
        "critical_ioc_list":          ti_summary.get("critical_iocs", [])[:5]
    }

    # ── Sort and return ────────────────────────────────────────────────────────
    sorted_logs = sorted(logs, key=lambda x: x.get("timestamp", ""), reverse=True)[:10]

    return {
        "metrics": {
            "total_cases":              total_cases,
            "open_cases":               open_cases,
            "resolved_cases":           resolved_cases,
            "critical_cases":           critical_cases,
            "total_evidence_artifacts": len(evidences),
            "ai_correlation_jobs":      len(cases),
            "malware_samples_analyzed": len(malware_evidences),
            "threat_intel_queries":     ti_summary.get("total_iocs_checked", 0),
            "malicious_iocs_flagged":   ti_summary.get("malicious_count", 0),
        },
        "threat_distribution":     threat_distribution,
        "evidence_type_breakdown": evidence_type_breakdown,
        "malware_stats":           malware_stats,
        "threat_intel_stats":      threat_intel_stats,
        "recent_logs":             sorted_logs,
        "recent_cases":            sorted(cases, key=lambda x: x.get("updated_at", ""), reverse=True)[:5]
    }
