import datetime
import hashlib
import re
from typing import Dict, Any, List, Optional

# ────────────────────────────────────────────────────────────────────────────
# Mock / Fallback Threat Intelligence Feed Datasets
# Replace with real API calls once API keys are configured
# ────────────────────────────────────────────────────────────────────────────

# Known malicious IP addresses (simulated TI feed)
MALICIOUS_IPS = {
    "185.220.101.5":  {"reputation": "MALICIOUS", "malware_families": ["Cobalt Strike", "TOR Exit Node"], "campaigns": ["Operation Red Line", "APT29 Infrastructure"], "severity": "CRITICAL", "country": "DE", "abuseipdb_score": 100, "vt_score": "55/90", "tags": ["tor", "c2", "botnet"]},
    "45.33.32.156":   {"reputation": "MALICIOUS", "malware_families": ["AsyncRAT", "AgentTesla"], "campaigns": ["Phishing Wave 2026-Q3"], "severity": "HIGH", "country": "US", "abuseipdb_score": 87, "vt_score": "38/90", "tags": ["phishing", "c2"]},
    "194.165.16.29":  {"reputation": "MALICIOUS", "malware_families": ["QakBot", "IcedID"], "campaigns": ["TA577 Campaign"], "severity": "CRITICAL", "country": "RU", "abuseipdb_score": 95, "vt_score": "60/90", "tags": ["banker", "spam", "c2"]},
    "91.213.50.106":  {"reputation": "SUSPICIOUS", "malware_families": ["Emotet"], "campaigns": ["Emotet Epoch 5"], "severity": "HIGH", "country": "UA", "abuseipdb_score": 72, "vt_score": "31/90", "tags": ["spam", "downloader"]},
    "10.0.0.1":       {"reputation": "CLEAN", "malware_families": [], "campaigns": [], "severity": "LOW", "country": "PRIVATE", "abuseipdb_score": 0, "vt_score": "0/90", "tags": ["private", "rfc1918"]},
    "192.168.1.105":  {"reputation": "SUSPICIOUS", "malware_families": [], "campaigns": [], "severity": "MEDIUM", "country": "PRIVATE", "abuseipdb_score": 0, "vt_score": "0/90", "tags": ["internal", "compromised-indicator"]},
}

# Known malicious domains
MALICIOUS_DOMAINS = {
    "login.auth-secure-update.xyz": {"reputation": "MALICIOUS", "malware_families": ["Phishing Kit"], "campaigns": ["Microsoft 365 Credential Harvest"], "severity": "CRITICAL", "vt_score": "48/90", "tags": ["phishing", "credential-harvest", "brand-spoof"]},
    "api.c2-command-node.ru":       {"reputation": "MALICIOUS", "malware_families": ["Cobalt Strike", "Sliver C2"], "campaigns": ["APT28 Operations"], "severity": "CRITICAL", "vt_score": "62/90", "tags": ["c2", "apt"]},
    "auth-secure-update.xyz":       {"reputation": "MALICIOUS", "malware_families": ["Phishing Kit"], "campaigns": ["Mass Credential Phishing 2026"], "severity": "CRITICAL", "vt_score": "50/90", "tags": ["phishing"]},
    "update-microsoft-login.net":   {"reputation": "MALICIOUS", "malware_families": ["Evilginx2", "Modlishka"], "campaigns": ["MFA Bypass Campaign"], "severity": "CRITICAL", "vt_score": "45/90", "tags": ["phishing", "mfa-bypass"]},
    "c2-node-alpha.pw":             {"reputation": "MALICIOUS", "malware_families": ["AsyncRAT"], "campaigns": ["RAT Campaign 2026"], "severity": "HIGH", "vt_score": "35/90", "tags": ["c2", "rat"]},
    "google.com":                   {"reputation": "CLEAN", "malware_families": [], "campaigns": [], "severity": "LOW", "vt_score": "0/90", "tags": ["legitimate"]},
    "microsoft.com":                {"reputation": "CLEAN", "malware_families": [], "campaigns": [], "severity": "LOW", "vt_score": "0/90", "tags": ["legitimate"]},
}

# Known malicious file hashes (SHA-256)
MALICIOUS_HASHES = {
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": {"reputation": "MALICIOUS", "malware_families": ["Dropper Trojan", "Embedded Payload"], "campaigns": ["Operation Red Line"], "severity": "CRITICAL", "vt_score": "71/90", "file_type": "PE32 EXE", "tags": ["dropper", "trojan", "packed"]},
    "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899": {"reputation": "MALICIOUS", "malware_families": ["Cobalt Strike Beacon"], "campaigns": ["APT29 Cozy Bear"], "severity": "CRITICAL", "vt_score": "78/90", "file_type": "PE32 DLL", "tags": ["beacon", "apt"]},
    "d41d8cd98f00b204e9800998ecf8427e": {"reputation": "SUSPICIOUS", "malware_families": ["Unknown"], "campaigns": [], "severity": "MEDIUM", "vt_score": "5/90", "file_type": "Empty File", "tags": ["empty", "test"]},
}

# Known malicious email senders
MALICIOUS_EMAILS = {
    "sec-alert@auth-update-microsoft.com": {"reputation": "MALICIOUS", "campaigns": ["Executive Spear-Phishing 2026"], "severity": "CRITICAL", "tags": ["phishing", "spoofed", "impersonation"]},
    "noreply@account-verify-paypal.net":   {"reputation": "MALICIOUS", "campaigns": ["PayPal Brand Phishing"], "severity": "HIGH", "tags": ["phishing", "brand-spoof"]},
    "support@microsoft.com":               {"reputation": "CLEAN", "campaigns": [], "severity": "LOW", "tags": ["legitimate"]},
}

def _build_result(ioc_type: str, ioc_value: str, data: dict, source: str) -> Dict[str, Any]:
    """Build a standardized TI result dict."""
    return {
        "ioc_type": ioc_type,
        "ioc_value": ioc_value,
        "virustotal_score": data.get("vt_score"),
        "abuseipdb_score": data.get("abuseipdb_score"),
        "otx_pulses": len(data.get("campaigns", [])),
        "reputation": data.get("reputation", "UNKNOWN"),
        "malware_families": data.get("malware_families", []),
        "known_campaigns": data.get("campaigns", []),
        "threat_severity": data.get("severity", "LOW"),
        "source": source,
        "last_seen": datetime.datetime.now().strftime("%Y-%m-%d"),
        "country": data.get("country"),
        "tags": data.get("tags", [])
    }

def _unknown_result(ioc_type: str, ioc_value: str) -> Dict[str, Any]:
    """Return a default 'not found in feeds' result."""
    return {
        "ioc_type": ioc_type,
        "ioc_value": ioc_value,
        "virustotal_score": "0/90",
        "abuseipdb_score": 0,
        "otx_pulses": 0,
        "reputation": "UNKNOWN",
        "malware_families": [],
        "known_campaigns": [],
        "threat_severity": "LOW",
        "source": "Internal TI Feed (No match found)",
        "last_seen": None,
        "country": None,
        "tags": ["not-in-feed"]
    }

def lookup_ip(ip: str) -> Dict[str, Any]:
    """Look up an IP address in threat intelligence feeds."""
    # Try mock TI feed (replace with real API: AbuseIPDB, OTX, VirusTotal)
    if ip in MALICIOUS_IPS:
        return _build_result("IP", ip, MALICIOUS_IPS[ip], "AbuseIPDB / OTX / Internal Feed")
    # Heuristic: check private ranges
    if ip.startswith(("10.", "192.168.", "172.16.", "127.")):
        return _build_result("IP", ip, {"reputation": "CLEAN", "severity": "LOW", "vt_score": "0/90", "abuseipdb_score": 0, "campaigns": [], "malware_families": [], "country": "PRIVATE", "tags": ["rfc1918", "private"]}, "Heuristic (Private Range)")
    return _unknown_result("IP", ip)

def lookup_domain(domain: str) -> Dict[str, Any]:
    """Look up a domain or URL in threat intelligence feeds."""
    clean_domain = domain.lower().strip().split("/")[0]
    if clean_domain in MALICIOUS_DOMAINS:
        return _build_result("DOMAIN", clean_domain, MALICIOUS_DOMAINS[clean_domain], "VirusTotal / OTX / Internal Feed")
    # Check if any known malicious domain is a substring
    for known, data in MALICIOUS_DOMAINS.items():
        if known in clean_domain and data["reputation"] != "CLEAN":
            return _build_result("DOMAIN", clean_domain, data, "VirusTotal / OTX (Substring Match)")
    return _unknown_result("DOMAIN", clean_domain)

def lookup_url(url: str) -> Dict[str, Any]:
    """Look up a URL — extracts domain and delegates to domain lookup."""
    try:
        domain = re.sub(r'^https?://', '', url).split('/')[0]
        result = lookup_domain(domain)
        result["ioc_type"] = "URL"
        result["ioc_value"] = url
        return result
    except Exception:
        return _unknown_result("URL", url)

def lookup_hash(file_hash: str) -> Dict[str, Any]:
    """Look up a file hash (MD5 or SHA-256) in threat intelligence feeds."""
    normalized = file_hash.lower().strip()
    if normalized in MALICIOUS_HASHES:
        return _build_result("HASH", normalized, MALICIOUS_HASHES[normalized], "VirusTotal / MalwareBazaar / Internal Feed")
    return _unknown_result("HASH", normalized)

def lookup_email(email: str) -> Dict[str, Any]:
    """Look up an email sender address in threat intelligence feeds."""
    email_lower = email.lower().strip()
    if email_lower in MALICIOUS_EMAILS:
        data = MALICIOUS_EMAILS[email_lower]
        return {
            "ioc_type": "EMAIL",
            "ioc_value": email_lower,
            "virustotal_score": None,
            "abuseipdb_score": None,
            "otx_pulses": len(data.get("campaigns", [])),
            "reputation": data.get("reputation", "UNKNOWN"),
            "malware_families": [],
            "known_campaigns": data.get("campaigns", []),
            "threat_severity": data.get("severity", "LOW"),
            "source": "OTX / Internal Phishing Feed",
            "last_seen": datetime.datetime.now().strftime("%Y-%m-%d"),
            "country": None,
            "tags": data.get("tags", [])
        }
    # Check domain portion of email
    if "@" in email_lower:
        domain = email_lower.split("@")[1]
        domain_result = lookup_domain(domain)
        if domain_result["reputation"] in ("MALICIOUS", "SUSPICIOUS"):
            domain_result["ioc_type"] = "EMAIL"
            domain_result["ioc_value"] = email_lower
            return domain_result
    return _unknown_result("EMAIL", email_lower)

def lookup_ioc(ioc_type: str, ioc_value: str) -> Dict[str, Any]:
    """Unified IOC lookup dispatcher."""
    ioc_type_upper = ioc_type.upper().strip()
    if ioc_type_upper == "IP":
        return lookup_ip(ioc_value)
    elif ioc_type_upper == "DOMAIN":
        return lookup_domain(ioc_value)
    elif ioc_type_upper == "URL":
        return lookup_url(ioc_value)
    elif ioc_type_upper in ("HASH", "SHA256", "MD5", "FILE_HASH"):
        return lookup_hash(ioc_value)
    elif ioc_type_upper == "EMAIL":
        return lookup_email(ioc_value)
    else:
        return _unknown_result(ioc_type, ioc_value)

def enrich_iocs_from_evidence(evidence_list: list) -> List[Dict[str, Any]]:
    """Automatically extract and enrich IOCs from all forensic evidence modules."""
    results = []
    seen = set()

    def add_if_new(ioc_type, value):
        key = f"{ioc_type}:{value}"
        if key not in seen and value and value != "N/A":
            seen.add(key)
            result = lookup_ioc(ioc_type, value)
            results.append(result)

    for ev in evidence_list:
        res = ev.get("analysis_result", {})
        ev_type = ev.get("type", "")

        if ev_type == "EMAIL":
            add_if_new("EMAIL", res.get("sender", ""))
            for ip in res.get("hop_ips", []):
                add_if_new("IP", ip)
            for att in res.get("attachments", []):
                if att.get("sha256"):
                    add_if_new("HASH", att["sha256"])

        elif ev_type == "URL":
            add_if_new("URL", res.get("url", ""))
            add_if_new("DOMAIN", res.get("domain", ""))
            add_if_new("IP", res.get("ip_address", ""))

        elif ev_type == "PCAP":
            for src in res.get("top_source_ips", []):
                add_if_new("IP", src.get("ip", ""))
            for dst in res.get("top_dest_ips", []):
                add_if_new("IP", dst.get("ip", ""))
            for dns in res.get("dns_queries", []):
                add_if_new("DOMAIN", dns)

        elif ev_type == "MALWARE":
            add_if_new("HASH", res.get("sha256_hash", ""))
            add_if_new("HASH", res.get("md5_hash", ""))
            for ip in res.get("extracted_ips", []):
                add_if_new("IP", ip)
            for domain in res.get("extracted_domains", []):
                add_if_new("DOMAIN", domain)

    return results

def get_threat_intel_summary(ti_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute aggregate statistics from a list of TI lookup results."""
    total = len(ti_results)
    malicious = sum(1 for r in ti_results if r["reputation"] == "MALICIOUS")
    suspicious = sum(1 for r in ti_results if r["reputation"] == "SUSPICIOUS")
    clean = sum(1 for r in ti_results if r["reputation"] == "CLEAN")

    all_families = []
    all_campaigns = []
    all_tags = []
    for r in ti_results:
        all_families.extend(r.get("malware_families", []))
        all_campaigns.extend(r.get("known_campaigns", []))
        all_tags.extend(r.get("tags", []))

    unique_families = list(set(all_families))
    unique_campaigns = list(set(all_campaigns))

    critical_iocs = [r for r in ti_results if r["threat_severity"] in ("CRITICAL", "HIGH") and r["reputation"] in ("MALICIOUS", "SUSPICIOUS")]

    return {
        "total_iocs_checked": total,
        "malicious_count": malicious,
        "suspicious_count": suspicious,
        "clean_count": clean,
        "unique_malware_families": unique_families,
        "known_attack_campaigns": unique_campaigns,
        "critical_iocs": critical_iocs[:10],
        "overall_severity": "CRITICAL" if malicious >= 2 else ("HIGH" if malicious >= 1 else ("MEDIUM" if suspicious >= 1 else "LOW")),
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    }
