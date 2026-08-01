import email
from email import policy
import re
import hashlib
from typing import Dict, Any, List

SUSPICIOUS_KEYWORDS = [
    "urgent action required", "verify your account", "account suspended", 
    "password reset", "unauthorized login", "invoice attached", "wire transfer", 
    "bank confirmation", "update payment info", "security alert", "click here immediately",
    "limited time offer", "bitcoin", "crypto payment", "ssn verification", "tax refund"
]

SUSPICIOUS_EXTENSIONS = [".exe", ".scr", ".vbs", ".bat", ".cmd", ".js", ".ps1", ".jar", ".zip", ".iso"]

def parse_eml_file(content_bytes: bytes, filename: str = "sample.eml") -> Dict[str, Any]:
    msg = email.message_from_bytes(content_bytes, policy=policy.default)
    
    sender = msg.get("From", "Unknown Sender")
    recipient = msg.get("To", "Unknown Recipient")
    subject = msg.get("Subject", "(No Subject)")
    date_str = msg.get("Date", "Unknown Date")
    return_path = msg.get("Return-Path", sender)
    
    # Extract Received headers for hop IP tracing
    received_headers = msg.get_all("Received", [])
    hop_ips = []
    ip_regex = re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b')
    for r in received_headers:
        found = ip_regex.findall(str(r))
        for ip in found:
            if not ip.startswith(("127.", "10.", "192.168.", "172.16.")) and ip not in hop_ips:
                hop_ips.append(ip)
                
    # Extract authentication headers
    auth_results = str(msg.get("Authentication-Results", ""))
    arc_results = str(msg.get("ARC-Authentication-Results", ""))
    
    spf_status = "PASS" if "spf=pass" in (auth_results + arc_results).lower() else ("FAIL" if "spf=fail" in (auth_results + arc_results).lower() else "NONE / UNCHECKED")
    dkim_status = "PASS" if "dkim=pass" in (auth_results + arc_results).lower() else ("FAIL" if "dkim=fail" in (auth_results + arc_results).lower() else "NONE / UNCHECKED")
    dmarc_status = "PASS" if "dmarc=pass" in (auth_results + arc_results).lower() else ("FAIL" if "dmarc=fail" in (auth_results + arc_results).lower() else "NONE / UNCHECKED")
    
    # Extract body content
    body_text = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            cdisp = str(part.get('Content-Disposition'))
            if ctype == 'text/plain' and 'attachment' not in cdisp:
                try:
                    body_text += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                except Exception:
                    pass
    else:
        try:
            body_text = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        except Exception:
            body_text = str(msg.get_payload())
            
    # Check for suspicious keywords
    found_keywords = []
    combined_text = (subject + " " + body_text).lower()
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in combined_text:
            found_keywords.append(kw)
            
    # Extract attachments
    attachments = []
    for part in msg.walk():
        if part.get_content_maintype() == 'multipart':
            continue
        if part.get('Content-Disposition') is None:
            continue
            
        att_name = part.get_filename() or "unnamed_attachment"
        att_data = part.get_payload(decode=True) or b""
        att_size = len(att_data)
        att_hash = hashlib.sha256(att_data).hexdigest()
        
        is_suspicious = any(att_name.lower().endswith(ext) for ext in SUSPICIOUS_EXTENSIONS)
        
        attachments.append({
            "filename": att_name,
            "size_bytes": att_size,
            "content_type": part.get_content_type(),
            "sha256": att_hash,
            "is_suspicious": is_suspicious
        })
        
    # Calculate Threat Score & Risk
    score = 10 # Base score
    if spf_status == "FAIL": score += 25
    if dkim_status == "FAIL": score += 20
    if dmarc_status == "FAIL": score += 25
    if len(found_keywords) > 0: score += min(len(found_keywords) * 10, 30)
    if any(a["is_suspicious"] for a in attachments): score += 30
    
    phishing_score = min(score, 100)
    
    if phishing_score >= 75:
        threat_level = "CRITICAL"
    elif phishing_score >= 50:
        threat_level = "HIGH"
    elif phishing_score >= 25:
        threat_level = "MEDIUM"
    else:
        threat_level = "LOW"
        
    summary = f"Email parsed. Sender: {sender}. SPF: {spf_status}, DKIM: {dkim_status}, DMARC: {dmarc_status}. Detected {len(found_keywords)} suspicious keywords and {len(attachments)} attachments."
    
    return {
        "filename": filename,
        "sender": sender,
        "recipient": recipient,
        "subject": subject,
        "date": date_str,
        "return_path": return_path,
        "spf_status": spf_status,
        "dkim_status": dkim_status,
        "dmarc_status": dmarc_status,
        "hop_ips": hop_ips,
        "suspicious_keywords": found_keywords,
        "attachments": attachments,
        "phishing_score": phishing_score,
        "threat_level": threat_level,
        "summary": summary
    }
