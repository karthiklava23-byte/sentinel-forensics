from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional, Any
from enum import Enum
import datetime

class UserRole(str, Enum):
    ADMIN = "admin"
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"

class CaseStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class ThreatLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EvidenceType(str, Enum):
    EMAIL = "EMAIL"
    PCAP = "PCAP"
    URL = "URL"
    LOG = "LOG"
    ATTACHMENT = "ATTACHMENT"
    MALWARE = "MALWARE"

# Authentication Models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = UserRole.INVESTIGATOR

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: str
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Investigation Case Models
class CaseCreate(BaseModel):
    title: str
    description: str
    category: str = "Phishing & Network Attack"
    priority: ThreatLevel = ThreatLevel.HIGH
    assigned_to: Optional[str] = "Lead Forensic Investigator"

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[ThreatLevel] = None
    assigned_to: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    description: str
    category: str
    status: CaseStatus
    priority: ThreatLevel
    assigned_to: str
    created_by: str
    created_at: str
    updated_at: str
    evidence_count: int = 0
    threat_score: float = 0.0

# Forensics Models
class EmailForensicsAnalysis(BaseModel):
    filename: str
    sender: str
    recipient: str
    subject: str
    date: str
    return_path: Optional[str] = None
    spf_status: str
    dkim_status: str
    dmarc_status: str
    hop_ips: List[str] = []
    suspicious_keywords: List[str] = []
    attachments: List[Dict[str, Any]] = []
    phishing_score: int
    threat_level: ThreatLevel
    summary: str

class URLForensicsAnalysis(BaseModel):
    url: str
    domain: str
    is_https: bool
    domain_age_days: int
    whois_registrar: str
    creation_date: str
    ip_address: str
    country: str
    risk_score: int
    threat_level: ThreatLevel
    suspicious_features: List[str] = []
    phishing_indicator: bool
    reputation: str

class PacketSummary(BaseModel):
    timestamp: str
    protocol: str
    src_ip: str
    src_port: Optional[int]
    dst_ip: str
    dst_port: Optional[int]
    info: str
    flagged: bool = False
    flag_reason: Optional[str] = None

class NetworkForensicsAnalysis(BaseModel):
    filename: str
    total_packets: int
    duration_seconds: float
    protocols: Dict[str, int]
    top_source_ips: List[Dict[str, Any]]
    top_dest_ips: List[Dict[str, Any]]
    dns_queries: List[str]
    http_requests: List[Dict[str, str]]
    suspicious_activities: List[Dict[str, Any]]
    threat_level: ThreatLevel
    summary: str

# Malware Forensics Models
class MalwareForensicsAnalysis(BaseModel):
    filename: str
    file_size_bytes: int
    file_type: str
    md5_hash: str
    sha256_hash: str
    entropy: float
    is_packed: bool
    imported_dlls: List[str] = []
    suspicious_api_calls: List[str] = []
    suspicious_strings: List[str] = []
    extracted_ips: List[str] = []
    extracted_domains: List[str] = []
    suspicious_behaviors: List[Dict[str, str]] = []
    malware_risk_score: int
    threat_level: ThreatLevel
    malware_family_hint: Optional[str] = None
    summary: str

# Threat Intelligence Models
class ThreatIntelResult(BaseModel):
    ioc_type: str          # IP, URL, DOMAIN, EMAIL, HASH
    ioc_value: str
    virustotal_score: Optional[str] = None
    abuseipdb_score: Optional[int] = None
    otx_pulses: Optional[int] = None
    reputation: str         # CLEAN, SUSPICIOUS, MALICIOUS
    malware_families: List[str] = []
    known_campaigns: List[str] = []
    threat_severity: ThreatLevel
    source: str             # Which TI service returned this
    last_seen: Optional[str] = None
    country: Optional[str] = None
    tags: List[str] = []

# Gemini AI Chat Models
class GeminiChatRequest(BaseModel):
    case_id: Optional[str] = None
    question: str
    context: Optional[str] = None

class GeminiChatResponse(BaseModel):
    answer: str
    suggested_actions: List[str] = []
    confidence: str = "HIGH"

class TimelineEvent(BaseModel):
    timestamp: str
    stage: str
    source_module: str
    description: str
    ioc: Optional[str] = None
    severity: ThreatLevel

class AICorrelationReport(BaseModel):
    case_id: str
    overall_threat_score: int
    threat_level: ThreatLevel
    executive_summary: str
    attack_vector: str
    correlated_iocs: List[Dict[str, str]]
    timeline: List[TimelineEvent]
    mitigation_recommendations: List[str]
    gemini_ai_insights: Optional[str] = None
    generated_at: str

# Activity Log
class ActivityLog(BaseModel):
    id: str
    user_email: str
    action: str
    details: str
    timestamp: str
