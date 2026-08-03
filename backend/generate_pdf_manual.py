import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip header/footer on title cover page
        
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0f172a"))
        
        # Header text & line
        self.drawString(54, 750, "SENTINEL AI — ALL-IN-ONE SYSTEM DIRECTORY & ROLE CAPABILITIES MANUAL")
        self.setFont("Helvetica", 8)
        self.drawRightString(612 - 54, 750, "COMPLETE FUNCTION & ROLE SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#334155"))
        self.setLineWidth(0.75)
        self.line(54, 742, 612 - 54, 742)
        
        # Footer text & page numbers
        self.line(54, 48, 612 - 54, 48)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        self.drawString(54, 34, "CONFIDENTIAL & CLASSIFIED — FOR AUTHORIZED SECURITY OPERATORS ONLY")
        self.drawRightString(612 - 54, 34, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_manual_pdf(filename="SENTINEL_AI_System_Directory_and_Role_Capabilities.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()

    # Custom typography & styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a"),
        alignment=0,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=12,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10.5,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # -------------------------------------------------------------------------
    # COVER / TITLE BLOCK
    # -------------------------------------------------------------------------
    story.append(Paragraph("SENTINEL AI — ALL-IN-ONE SYSTEM DIRECTORY &amp; ROLE MANUAL", title_style))
    story.append(Paragraph("Master Technical Guide: Complete Function Directory, Inputs &amp; Outputs, Point-Wise Role Capabilities &amp; Side-by-Side Role Comparison Table", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor("#0284c7"), spaceAfter=12))

    # Document Meta Box
    meta_data = [
        [Paragraph("<b>Document Title:</b> Master Directory &amp; Role Capabilities", table_cell_style), Paragraph("<b>Classification:</b> RESTRICTED DFIR / SOC", table_cell_style)],
        [Paragraph("<b>Coverage:</b> 100% Platform APIs &amp; UI Functions", table_cell_style), Paragraph("<b>AI Correlation Engine:</b> Google Gemini 1.5 Flash", table_cell_style)]
    ]
    t_meta = Table(meta_data, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------------------
    # SECTION 1: SYSTEM ARCHITECTURE & MASTER DIRECTORY OVERVIEW
    # -------------------------------------------------------------------------
    story.append(Paragraph("1. System Architecture &amp; Platform Directory", h1_style))
    story.append(Paragraph(
        "<b>SENTINEL AI</b> is a unified Digital Forensics &amp; Incident Response (DFIR) and Security Operations Center (SOC) platform. "
        "The architecture is designed around live real-time analysis engines: raw RFC-822 email parsing, PCAP frame dissection, static PE/ELF entropy calculation, WHOIS lookups, "
        "and SIEM event parsing, all integrated live with Google Gemini AI.",
        body_style
    ))
    story.append(Paragraph(
        "The system strictly segregates capabilities into three roles: <b>SOC Analyst</b>, <b>Forensic Investigator</b>, and <b>System Administrator</b>. "
        "Each role operates in a clutter-free, role-gated workspace.",
        body_style
    ))

    # -------------------------------------------------------------------------
    # SECTION 2: WHAT CAN BE ACHIEVED BY DIFFERENT ROLES (POINT-WISE)
    # -------------------------------------------------------------------------
    story.append(Paragraph("2. What Can Be Achieved by Different Roles (Point-Wise Capabilities)", h1_style))

    # 2.1 SOC ANALYST ROLE
    story.append(Paragraph("2.1 SOC Analyst Role (Primary Goal: Real-Time Alert Triage &amp; Threat Containment)", h2_style))
    analyst_points = [
        "<b>⚡ Rapid Alert Triage:</b> Evaluate incoming SIEM and EDR security alerts in &lt; 30 seconds. Analysts can dismiss false positives, issue immediate IP containment actions, or escalate critical alerts directly into investigation cases.",
        "<b>🏹 Custom Threat Detection (YARA &amp; Sigma):</b> Craft, test, and validate YARA rules and Sigma log detection patterns against live payload text to detect obfuscated PowerShell, Win32 API calls, and C2 traffic.",
        "<b>📜 SIEM Log Stream Anomaly Extraction:</b> Parse raw multi-format log text streams (`.evtx`, Syslog, JSON) to automatically isolate brute-force bursts, shell execution events, and identify top IP talkers.",
        "<b>🌐 External Attack Surface &amp; CVE Auditing:</b> Perform external infrastructure health audits to discover open high-risk ports, SSL certificate status, and matching CVSS vulnerabilities on target assets.",
        "<b>🤖 Instant SOAR Containment Playbooks:</b> Generate 1-click executable mitigation scripts across Linux (`iptables` / BIND sinkholes) and Windows PowerShell firewalls to immediately block compromised hosts, IPs, or domains."
    ]
    for pt in analyst_points:
        story.append(Paragraph(f"• {pt}", bullet_style))

    story.append(Spacer(1, 6))

    # 2.2 FORENSIC INVESTIGATOR ROLE
    story.append(Paragraph("2.2 Forensic Investigator Role (Primary Goal: Incident Reconstruction &amp; Case Building)", h2_style))
    investigator_points = [
        "<b>📁 Official Incident Case Management:</b> Create and maintain formal investigation cases, assign threat severity levels (CRITICAL / HIGH / MEDIUM / LOW), track operational status, and assign case owners.",
        "<b>🔬 Multi-Vector Artifact Correlation:</b> Upload and attach email RFC-822 headers, live URL scans, network PCAP packet files, and malware binaries directly to a unified case timeline.",
        "<b>⏱️ Chronological Attack Reconstruction:</b> Automatically synthesize multi-file evidence sources into a unified, step-by-step chronological attack timeline.",
        "<b>📄 Printable Executive PDF Reports:</b> Generate professional, printable forensic investigation PDF reports complete with executive summaries, evidence tables, IOC indicators, and remediation blueprints.",
        "<b>🤖 AI Threat Correlation:</b> Leverage Google Gemini AI to analyze complex multi-vector evidence files and identify hidden cross-artifact relationships."
    ]
    for pt in investigator_points:
        story.append(Paragraph(f"• {pt}", bullet_style))

    story.append(Spacer(1, 6))

    # 2.3 SYSTEM ADMINISTRATOR ROLE
    story.append(Paragraph("2.3 System Administrator Role (Primary Goal: Governance, RBAC &amp; Platform Health)", h2_style))
    admin_points = [
        "<b>👥 User &amp; Role Management:</b> Dynamically switch user accounts between `Analyst`, `Investigator`, and `Admin` roles with immediate real-time role updates.",
        "<b>🔑 AI Engine Key Management:</b> Configure and persist global Google Gemini API keys across local storage and database backend.",
        "<b>📊 Platform-Wide Telemetry &amp; Audit Logs:</b> View global multi-user metrics, aggregate case totals, and monitor security audit logs across all platform operators."
    ]
    for pt in admin_points:
        story.append(Paragraph(f"• {pt}", bullet_style))

    story.append(Spacer(1, 10))

    # Page Break for Comparison Table
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # SECTION 3: COMPREHENSIVE SIDE-BY-SIDE ROLE COMPARISON TABLE
    # -------------------------------------------------------------------------
    story.append(Paragraph("3. Comprehensive Role Comparison Table", h1_style))
    story.append(Paragraph(
        "The following side-by-side comparison matrix contrasts the permissions, primary objectives, inputs, outputs, and access boundaries of all three platform roles:",
        body_style
    ))

    comp_table_data = [
        [Paragraph("Comparison Dimension", table_header_style), Paragraph("SOC Analyst (`analyst`)", table_header_style), Paragraph("Forensic Investigator (`investigator`)", table_header_style), Paragraph("System Admin (`admin`)", table_header_style)],
        [
            Paragraph("<b>Primary Operational Goal</b>", table_cell_bold),
            Paragraph("Rapid alert triage, threat hunting, log parsing &amp; fast containment", table_cell_style),
            Paragraph("Deep-dive case building, multi-evidence correlation &amp; executive reporting", table_cell_style),
            Paragraph("System governance, user role management, AI key config &amp; audit logging", table_cell_style)
        ],
        [
            Paragraph("<b>Key Workspace / Route</b>", table_cell_bold),
            Paragraph("Analyst Workspace (`/analyst`)", table_cell_style),
            Paragraph("Cases &amp; Incidents (`/cases`)", table_cell_style),
            Paragraph("Admin Control Panel (`/admin`)", table_cell_style)
        ],
        [
            Paragraph("<b>Primary Input Data</b>", table_cell_bold),
            Paragraph("Triage alerts, raw SIEM log text, YARA/Sigma rules, Target IPs/Domains", table_cell_style),
            Paragraph("Case titles, RFC-822 emails, PCAP files, PE binaries, URL links", table_cell_style),
            Paragraph("Gemini API keys, user role selections, audit log queries", table_cell_style)
        ],
        [
            Paragraph("<b>Primary Output Data</b>", table_cell_bold),
            Paragraph("Triage statuses, YARA match lines, log anomaly tables, SOAR block scripts", table_cell_style),
            Paragraph("Unified attack timelines, case artifact links, Printable PDF reports", table_cell_style),
            Paragraph("Updated user roles, active AI status, platform audit log stream", table_cell_style)
        ],
        [
            Paragraph("<b>Case Management Access</b>", table_cell_bold),
            Paragraph("❌ Hidden &amp; Restricted (Auto-escalation only)", table_cell_style),
            Paragraph("✅ FULL ACCESS (Create, Edit, Delete, Attach)", table_cell_style),
            Paragraph("✅ FULL ACCESS (Global view across all users)", table_cell_style)
        ],
        [
            Paragraph("<b>Analyst Tools Access</b>", table_cell_bold),
            Paragraph("✅ FULL ACCESS (Triage, YARA, Logs, SOAR)", table_cell_style),
            Paragraph("❌ Hidden &amp; Restricted", table_cell_style),
            Paragraph("✅ FULL ACCESS", table_cell_style)
        ],
        [
            Paragraph("<b>PDF Report Generation</b>", table_cell_bold),
            Paragraph("❌ Hidden &amp; Restricted", table_cell_style),
            Paragraph("✅ FULL ACCESS (Printable PDF case reports)", table_cell_style),
            Paragraph("✅ FULL ACCESS", table_cell_style)
        ],
        [
            Paragraph("<b>Admin Control Access</b>", table_cell_bold),
            Paragraph("❌ Hidden &amp; Restricted", table_cell_style),
            Paragraph("❌ Hidden &amp; Restricted", table_cell_style),
            Paragraph("✅ FULL ACCESS (Manage users &amp; API keys)", table_cell_style)
        ]
    ]

    t_comp = Table(comp_table_data, colWidths=[110, 130, 132, 132])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (1,1), (1,-1), colors.HexColor("#f0f9ff")),
        ('BACKGROUND', (2,1), (2,-1), colors.HexColor("#fffbeb")),
        ('BACKGROUND', (3,1), (3,-1), colors.HexColor("#faf5ff")),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 12))

    # -------------------------------------------------------------------------
    # SECTION 4: MASTER PLATFORM FUNCTION DIRECTORY (INPUTS & OUTPUTS)
    # -------------------------------------------------------------------------
    story.append(Paragraph("4. Master Platform Function Directory (All Functions &amp; APIs)", h1_style))
    story.append(Paragraph(
        "Below is the complete function directory detailing inputs, outputs, API routes, and structured return data for all platform tools:",
        body_style
    ))

    def make_fn_card(fn_name, route_tag, roles_allowed, input_desc, input_sample, output_desc, output_fields):
        spec_data = [
            [Paragraph(f"<b>{fn_name}</b>", table_header_style), Paragraph(f"<b>Route: {route_tag} | Roles: {roles_allowed}</b>", table_header_style)],
            [Paragraph("<b>INPUT FORMAT:</b>", table_cell_bold), Paragraph(input_desc, table_cell_style)],
            [Paragraph("<b>INPUT EXAMPLE:</b>", table_cell_bold), Paragraph(f"<code>{input_sample}</code>", code_style)],
            [Paragraph("<b>OUTPUT GENERATED:</b>", table_cell_bold), Paragraph(output_desc, table_cell_style)],
            [Paragraph("<b>OUTPUT FIELDS:</b>", table_cell_bold), Paragraph(output_fields, table_cell_style)]
        ]
        t = Table(spec_data, colWidths=[120, 384])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('BACKGROUND', (0,1), (0,-1), colors.HexColor("#f8fafc")),
        ]))
        return t

    # 4.1 Email Forensics
    story.append(Paragraph("4.1 Email Forensics Engine", h2_style))
    story.append(make_fn_card(
        "POST /api/evidence/parse-email",
        "/email-forensics",
        "Analyst, Investigator, Admin",
        "Upload raw `.EML` or `.MSG` email file OR paste raw RFC-822 MIME headers.",
        "From: attacker@malicious-c2.xyz<br/>To: victim@company.com<br/>Subject: Urgent Payment Needed<br/>Received: from 185.220.101.5",
        "Extracts hop transit timeline, verifies SPF/DKIM/DMARC authentication, and hashes attachments.",
        "• <b>hop_trace:</b> Array of IP hops and server hostnames.<br/>"
        "• <b>auth_results:</b> SPF status, DKIM signature validity, DMARC alignment.<br/>"
        "• <b>attachment_hashes:</b> MD5 &amp; SHA-256 checksums of extracted email attachments.<br/>"
        "• <b>threat_level:</b> CRITICAL / HIGH / MEDIUM / LOW rating."
    ))
    story.append(Spacer(1, 8))

    # 4.2 URL Threat Analysis
    story.append(Paragraph("4.2 URL Threat & Infrastructure Analysis Engine", h2_style))
    story.append(make_fn_card(
        "POST /api/evidence/parse-url",
        "/url-forensics",
        "Analyst, Investigator, Admin",
        "Type or paste any target URL, domain name, or IP address into search box.",
        "https://login.paypal-security-update.account-verify.xyz/login.php",
        "Live DNS resolution, WHOIS registrar queries, SSL certificate checks, and brand spoofing detection.",
        "• <b>resolved_ip:</b> Live server IP address, country, ISP.<br/>"
        "• <b>domain_age_days:</b> Days since domain WHOIS registration.<br/>"
        "• <b>shannon_entropy:</b> Randomness rating of URL path.<br/>"
        "• <b>target_brand_spoof:</b> Identified typosquatting brand target."
    ))
    story.append(Spacer(1, 8))

    # 4.3 Network PCAP Forensics
    story.append(Paragraph("4.3 Network PCAP Packet Dissector", h2_style))
    story.append(make_fn_card(
        "POST /api/evidence/parse-pcap",
        "/network-forensics",
        "Analyst, Investigator, Admin",
        "Upload binary `.pcap` or `.pcapng` packet capture file (max 50MB).",
        "binary_capture.pcap (Ethernet/IP frame byte stream)",
        "Dissects binary frames, reconstructs TCP/UDP streams, and extracts DNS queries.",
        "• <b>total_packets &amp; total_bytes:</b> Packet count &amp; bandwidth volume.<br/>"
        "• <b>protocol_breakdown:</b> HTTP, HTTPS, DNS, SSH, FTP traffic ratios.<br/>"
        "• <b>top_talkers:</b> Source and Destination IPs ordered by packet count.<br/>"
        "• <b>dns_queries:</b> Array of resolved domain names."
    ))
    story.append(Spacer(1, 8))

    # Page Break for second half of Directory
    story.append(PageBreak())

    # 4.4 Malware Forensics
    story.append(Paragraph("4.4 Malware Static PE Analysis Engine", h2_style))
    story.append(make_fn_card(
        "POST /api/malware/analyze-binary",
        "/malware-forensics",
        "Analyst, Investigator, Admin",
        "Upload executable binary file (`.exe`, `.dll`, `.bin`, `.elf`, `.apk`, `.pdf`).",
        "update_svc.exe (binary Windows Portable Executable)",
        "Calculates section entropy, extracts Win32 API imports, and flags packing.",
        "• <b>file_hashes:</b> MD5 &amp; SHA-256 binary checksums.<br/>"
        "• <b>entropy_score:</b> 0.00–8.00 rating (Entropy &gt; 7.2 flags packing).<br/>"
        "• <b>suspicious_api_calls:</b> Flagged Win32 APIs (VirtualAllocEx, WriteProcessMemory).<br/>"
        "• <b>malware_family_hint:</b> Classification hint (Ransomware, Spyware, Trojan)."
    ))
    story.append(Spacer(1, 8))

    # 4.5 Threat Intelligence
    story.append(Paragraph("4.5 Multi-Feed Threat Intelligence Lookup", h2_style))
    story.append(make_fn_card(
        "POST /api/threat-intel/enrich",
        "/threat-intelligence",
        "Analyst, Investigator, Admin",
        "Enter any IP address, domain name, file hash (MD5/SHA256), or CVE ID.",
        "185.220.101.5 OR c5b3a...4f2e",
        "Queries global threat intelligence feeds for malicious reputation scores.",
        "• <b>reputation_score:</b> Malicious detection ratio.<br/>"
        "• <b>known_campaigns:</b> Associated APT groups or malware strains.<br/>"
        "• <b>asn_owner:</b> Autonomous System Number &amp; hosting organization."
    ))
    story.append(Spacer(1, 8))

    # 4.6 Analyst Triage & Threat Hunting
    story.append(Paragraph("4.6 Analyst SOC Workspace Functions", h2_style))
    story.append(make_fn_card(
        "POST /api/analyst/triage & /test-rule",
        "/analyst",
        "Analyst, Admin Only",
        "• Alert Action (`FALSE_POSITIVE`, `CONTAIN`, `ESCALATE`)<br/>• YARA / Sigma Rule Code &amp; Test Payload Sample",
        "Rule Code: `rule Detect_Powershell { strings: $s1 = \"VirtualAllocEx\" condition: $s1 }`<br/>Payload: `powershell.exe -enc ... VirtualAllocEx`",
        "Updates alert status (or escalates to Case), and evaluates YARA/Sigma signature matching.",
        "• <b>triage_status:</b> New alert status (FALSE_POSITIVE, CONTAINED, ESCALATED_TO_CASE).<br/>"
        "• <b>hunting_result:</b> Match Status (`MATCH_FOUND` / `NO_MATCH`), match count, matched line snippets."
    ))
    story.append(Spacer(1, 8))

    # 4.7 SOAR Playbooks
    story.append(Paragraph("4.7 SOAR Playbook Generator", h2_style))
    story.append(make_fn_card(
        "POST /api/analyst/playbooks/generate",
        "/analyst",
        "Analyst, Admin Only",
        "Select Action Type (`BLOCK_IP`, `BLOCK_DOMAIN`, `ISOLATE_HOST`) and enter Target Value.",
        "Action: BLOCK_IP | Target: 185.220.101.5",
        "Generates 1-click executable block scripts for Linux and Windows systems.",
        "• <b>bash_payload:</b> Executable Linux `iptables` / BIND sinkhole commands.<br/>"
        "• <b>powershell_payload:</b> Executable Windows PowerShell firewall commands."
    ))
    story.append(Spacer(1, 8))

    # 4.8 Case Management & Admin Role Update
    story.append(Paragraph("4.8 Case Management &amp; Admin Governance Functions", h2_style))
    story.append(make_fn_card(
        "POST /api/cases & PUT /api/admin/users/{id}/role",
        "/cases & /admin",
        "Investigator, Admin",
        "• Case Title, Description, Category, Priority Level<br/>• Target User ID &amp; New Role (`analyst`, `investigator`, `admin`)",
        "Case: Title='Mail Intrusion', Priority='CRITICAL'<br/>Admin Update: UserID='user@company.com', Role='analyst'",
        "Creates official investigation case, or dynamically updates user role permissions.",
        "• <b>case_number:</b> Unique Case ID (e.g., CASE-2026-9041).<br/>"
        "• <b>user_role_update:</b> Updated user permissions and role assignment."
    ))

    story.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # SECTION 5: FILE DIRECTORY & SYSTEM ARCHITECTURE MAP
    # -------------------------------------------------------------------------
    story.append(Paragraph("5. Platform File Directory &amp; Architecture Map", h1_style))
    story.append(Paragraph("The platform backend and frontend code structure is mapped below for reference:", body_style))

    file_map_text = [
        "<b>• Backend Core:</b> <code>backend/main.py</code> (FastAPI app &amp; CORS setup), <code>backend/app/database.py</code> (JSON / MongoDB store)",
        "<b>• Authentication &amp; RBAC:</b> <code>backend/app/auth.py</code>, <code>backend/app/routers/auth_router.py</code>",
        "<b>• Analyst Workspace APIs:</b> <code>backend/app/routers/analyst_router.py</code> (`/api/analyst/alerts`, `/test-rule`, `/parse-logs`, `/scan-attack-surface`, `/playbooks/generate`)",
        "<b>• Case Management APIs:</b> <code>backend/app/routers/cases_router.py</code> (`/api/cases`), <code>backend/app/routers/evidence_router.py</code>",
        "<b>• Forensics Engines:</b> <code>backend/app/routers/malware_router.py</code>, <code>backend/app/routers/threat_intel_router.py</code>, <code>backend/app/routers/gemini_router.py</code>",
        "<b>• Frontend Views:</b> <code>frontend/src/pages/AnalystPage.jsx</code>, <code>Cases.jsx</code>, <code>CaseDetails.jsx</code>, <code>AdminPanel.jsx</code>, <code>Dashboard.jsx</code>",
        "<b>• Navigation &amp; RBAC Guards:</b> <code>frontend/src/components/Sidebar.jsx</code>, <code>MobileBottomNav.jsx</code>, <code>Navbar.jsx</code>, <code>App.jsx</code>"
    ]

    for fmt in file_map_text:
        story.append(Paragraph(fmt, body_style))
        story.append(Spacer(1, 2))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated All-In-One PDF manual at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_manual_pdf()
