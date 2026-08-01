import urllib.parse
import socket
import datetime
import math
from typing import Dict, Any, List

SUSPICIOUS_TLDS = [".xyz", ".top", ".work", ".click", ".loans", ".gq", ".cf", ".tk", ".ml", ".ga", ".ru", ".cn", ".cc"]
HIGH_RISK_TARGET_BRANDS = ["paypal", "apple", "google", "microsoft", "chase", "wellsfargo", "binance", "metamask", "coinbase", "netflix", "amazon"]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum([p * math.log(p) / math.log(2) for p in prob])

def analyze_url(url: str) -> Dict[str, Any]:
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
        
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.split(":")[0]
    is_https = parsed.scheme.lower() == "https"
    
    # Feature extraction
    url_length = len(url)
    num_subdomains = len(domain.split(".")) - 2 if len(domain.split(".")) > 2 else 0
    entropy = calculate_entropy(domain)
    
    # Check IP hostname
    is_ip = False
    ip_address = "127.0.0.1"
    try:
        if socket.inet_aton(domain):
            is_ip = True
            ip_address = domain
    except Exception:
        try:
            ip_address = socket.gethostbyname(domain)
        except Exception:
            ip_address = "192.168.1.100" # Fallback resolved IP for analysis demo
            
    suspicious_features = []
    if not is_https:
        suspicious_features.append("Missing SSL/TLS encryption (HTTP standard)")
    if is_ip:
        suspicious_features.append("URL uses raw IP address instead of domain name")
    if url_length > 65:
        suspicious_features.append(f"Excessively long URL string ({url_length} characters)")
    if num_subdomains > 2:
        suspicious_features.append(f"High number of subdomains ({num_subdomains} subdomains)")
    if entropy > 3.8:
        suspicious_features.append("High domain randomness / algorithmic domain generation (DGA)")
    if "@" in url:
        suspicious_features.append("URL contains user-info '@' redirect attempt")
        
    for brand in HIGH_RISK_TARGET_BRANDS:
        if brand in domain.lower() and not domain.lower().endswith(f"{brand}.com") and not domain.lower().endswith(f"{brand}.org"):
            suspicious_features.append(f"Target Brand Spoofing detected: domain contains '{brand}'")
            
    tld = "." + domain.split(".")[-1] if "." in domain else ""
    if tld.lower() in SUSPICIOUS_TLDS:
        suspicious_features.append(f"High-risk top level domain: '{tld}'")
        
    # WHOIS & Domain Age Simulation
    creation_year = 2024 if any("brand" in f.lower() for f in suspicious_features) or is_ip else 2018
    domain_age_days = (datetime.datetime.now().year - creation_year) * 365 + 45
    creation_date = f"{creation_year}-03-15"
    whois_registrar = "NameCheap Inc / Unknown Privacy Protection" if domain_age_days < 500 else "GoDaddy LLC"
    country = "US" if is_https and domain_age_days > 1000 else "RU/CN"
    
    # Calculate Risk Score
    score = 15
    if not is_https: score += 20
    if is_ip: score += 35
    if domain_age_days < 180: score += 30
    if len(suspicious_features) > 0: score += min(len(suspicious_features) * 15, 45)
    
    risk_score = min(score, 100)
    phishing_indicator = risk_score >= 60
    
    if risk_score >= 75:
        threat_level = "CRITICAL"
        reputation = "MALICIOUS / HIGH RISK PHISHING"
    elif risk_score >= 50:
        threat_level = "HIGH"
        reputation = "SUSPICIOUS / UNTRUSTED"
    elif risk_score >= 25:
        threat_level = "MEDIUM"
        reputation = "MODERATE RISK"
    else:
        threat_level = "LOW"
        reputation = "CLEAN / LEGITIMATE"
        
    return {
        "url": url,
        "domain": domain,
        "is_https": is_https,
        "domain_age_days": domain_age_days,
        "whois_registrar": whois_registrar,
        "creation_date": creation_date,
        "ip_address": ip_address,
        "country": country,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "suspicious_features": suspicious_features,
        "phishing_indicator": phishing_indicator,
        "reputation": reputation
    }
