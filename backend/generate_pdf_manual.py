import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
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
        self.drawString(54, 750, "SENTINEL AI — INTEGRATED DIGITAL FORENSICS & SOC PLATFORM")
        self.setFont("Helvetica", 8)
        self.drawRightString(612 - 54, 750, "SYSTEM & FUNCTION INPUT/OUTPUT MANUAL")
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


def build_manual_pdf(filename="SENTINEL_AI_System_Input_Output_Manual.pdf"):
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

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#0f172a"),
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # -------------------------------------------------------------------------
    # COVER / TITLE BLOCK
    # -------------------------------------------------------------------------
    story.append(Spacer(1, 20))
    story.append(Paragraph("SENTINEL AI — DIGITAL FORENSICS &amp; SOC PLATFORM", title_style))
    story.append(Paragraph("Comprehensive Technical Guide: Role Functions, Exact Inputs, Expected Outputs &amp; Operational Architecture", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=3, color=colors.HexColor("#0284c7"), spaceAfter=15))

    # Meta Info Box
    meta_data = [
        [Paragraph("<b>Document Version:</b> 2.4.0", table_cell_style), Paragraph("<b>Classification:</b> RESTRICTED DFIR", table_cell_style)],
        [Paragraph("<b>Target Audience:</b> SOC Analysts, Forensic Investigators, Admins", table_cell_style), Paragraph("<b>AI Engine:</b> Google Gemini 1.5 Flash", table_cell_style)]
    ]
    t_meta = Table(meta_data, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # SECTION 1: SYSTEM OVERVIEW & ARCHITECTURE
    # -------------------------------------------------------------------------
    story.append(Paragraph("1. System Architecture &amp; Operational Overview", h1_style))
    story.append(Paragraph(
        "<b>SENTINEL AI</b> is an enterprise-grade Digital Forensics and Incident Response (DFIR) platform combined with a "
        "Security Operations Center (SOC) Workspace. The system parses multi-vector evidence streams in real time—including RFC-822 emails, "
        "network PCAP binaries, PE/ELF executables, domain WHOIS records, and SIEM event streams—correlated live with the <b>Google Gemini AI Engine</b>.",
        body_style
    ))
    story.append(Paragraph(
        "The architecture enforces strict <b>Role-Based Access Control (RBAC)</b> so that each security professional operates in a streamlined, "
        "uncluttered environment tailored to their exact workflow. All computations run on live dynamic execution engines without pre-packaged static fallbacks.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # -------------------------------------------------------------------------
    # SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
    # -------------------------------------------------------------------------
    story.append(Paragraph("2. Role-Based Access Control (RBAC) Matrix", h1_style))
    story.append(Paragraph(
        "The platform segregates duties into three distinct operational roles. Below is the functional permission and visibility matrix:",
        body_style
    ))

    rbac_data = [
        [Paragraph("Feature / Module", table_header_style), Paragraph("SOC Analyst", table_header_style), Paragraph("Forensic Investigator", table_header_style), Paragraph("System Admin", table_header_style)],
        [Paragraph("<b>Analyst Workspace (/analyst)</b><br/>(Triage, YARA, SIEM Parser, SOAR)", table_cell_style), Paragraph("<b>FULL ACCESS</b>", table_cell_bold), Paragraph("Hidden &amp; Restricted", table_cell_style), Paragraph("FULL ACCESS", table_cell_style)],
        [Paragraph("<b>Case Management (/cases)</b><br/>(Case Creation, Evidence Attachment)", table_cell_style), Paragraph("Hidden &amp; Restricted", table_cell_style), Paragraph("<b>FULL ACCESS</b>", table_cell_bold), Paragraph("FULL ACCESS", table_cell_style)],
        [Paragraph("<b>PDF Investigation Reports (/reports)</b>", table_cell_style), Paragraph("Hidden &amp; Restricted", table_cell_style), Paragraph("<b>FULL ACCESS</b>", table_cell_bold), Paragraph("FULL ACCESS", table_cell_style)],
        [Paragraph("<b>Standalone Forensics Tools</b><br/>(Email, URL, PCAP, Malware, Threat Intel)", table_cell_style), Paragraph("FULL ACCESS", table_cell_style), Paragraph("FULL ACCESS", table_cell_style), Paragraph("FULL ACCESS", table_cell_style)],
        [Paragraph("<b>Gemini AI Chat Assistant</b>", table_cell_style), Paragraph("FULL ACCESS", table_cell_style), Paragraph("FULL ACCESS", table_cell_style), Paragraph("FULL ACCESS", table_cell_style)],
        [Paragraph("<b>Admin Control Panel (/admin)</b>", table_cell_style), Paragraph("Hidden &amp; Restricted", table_cell_style), Paragraph("Hidden &amp; Restricted", table_cell_style), Paragraph("<b>FULL ACCESS</b>", table_cell_bold)]
    ]

    t_rbac = Table(rbac_data, colWidths=[160, 114, 115, 115])
    t_rbac.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (1,1), (1,1), colors.HexColor("#e0f2fe")),
        ('BACKGROUND', (2,2), (2,3), colors.HexColor("#fef3c7")),
        ('BACKGROUND', (3,6), (3,6), colors.HexColor("#f3e8ff")),
    ]))
    story.append(t_rbac)
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # SECTION 3: DETAILED FUNCTION INPUT & OUTPUT SPECIFICATION
    # -------------------------------------------------------------------------
    story.append(Paragraph("3. Complete Module Input &amp; Output Specifications", h1_style))
    story.append(Paragraph(
        "This section details the exact input required for every tool in each role, alongside the precise structured output generated by the engine.",
        body_style
    ))

    # Helper function for function specification tables
    def make_spec_table(title, role_tag, input_desc, input_example, output_desc, output_fields):
        spec_data = [
            [Paragraph(f"<b>{title}</b>", table_header_style), Paragraph(f"<b>ROLE: {role_tag}</b>", table_header_style)],
            [Paragraph("<b>REQUIRED INPUT FORMAT:</b>", table_cell_bold), Paragraph(input_desc, table_cell_style)],
            [Paragraph("<b>INPUT EXAMPLE:</b>", table_cell_bold), Paragraph(f"<code>{input_example}</code>", code_style)],
            [Paragraph("<b>GENERATED OUTPUT SUMMARY:</b>", table_cell_bold), Paragraph(output_desc, table_cell_style)],
            [Paragraph("<b>STRUCTURED OUTPUT FIELDS:</b>", table_cell_bold), Paragraph(output_fields, table_cell_style)]
        ]
        t = Table(spec_data, colWidths=[140, 364])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,1), (0,-1), colors.HexColor("#f8fafc")),
        ]))
        return t

    # --- 3.1 EMAIL FORENSICS ---
    story.append(Paragraph("3.1 Email Forensics Module (/email-forensics)", h2_style))
    story.append(make_spec_table(
        "Email RFC-822 Header & Attachment Analyzer",
        "Analyst, Investigator, Admin",
        "Upload raw `.EML` or `.MSG` email file or paste raw RFC-822 MIME headers into text input area.",
        "From: CEO &lt;ceo@company.com&gt;<br/>To: Finance &lt;finance@company.com&gt;<br/>Subject: Urgent Wire Transfer<br/>Received: from mail.attacker.com (185.220.101.5)",
        "Parses email headers, verifies authentication signatures, computes attachment checksums, and assesses phishing risk.",
        "• <b>Hop Trace:</b> Array of IP hops, timestamps, and server hostnames.<br/>"
        "• <b>Auth Checks:</b> SPF (Pass/Fail), DKIM signature validity, DMARC alignment.<br/>"
        "• <b>Attachment Hashes:</b> MD5 &amp; SHA256 cryptographic hashes of attachments.<br/>"
        "• <b>Risk Score:</b> 0–100 Threat Rating (CRITICAL / HIGH / MEDIUM / LOW)."
    ))
    story.append(Spacer(1, 12))

    # --- 3.2 URL THREAT ANALYSIS ---
    story.append(Paragraph("3.2 URL Threat Analysis Module (/url-forensics)", h2_style))
    story.append(make_spec_table(
        "Live URL & Domain Infrastructure Analyzer",
        "Analyst, Investigator, Admin",
        "Type or paste any target URL, domain name, or IP address into the search input box.",
        "https://login.paypal-security-update.account-verify.xyz/login.php",
        "Executes live DNS resolution, WHOIS registrar queries, SSL certificate verification, and brand spoofing detection.",
        "• <b>Resolved IP &amp; Location:</b> Server IP address, country, ISP, and hosting provider.<br/>"
        "• <b>Domain Age:</b> Days since registration (flags domains &lt; 30 days old).<br/>"
        "• <b>Shannon Entropy:</b> Mathematical randomness score of URL path.<br/>"
        "• <b>Brand Spoofing Flag:</b> Identifies typosquatting target (e.g. PayPal, Google, Microsoft)."
    ))
    story.append(Spacer(1, 12))

    # --- 3.3 NETWORK PCAP FORENSICS ---
    story.append(Paragraph("3.3 Network PCAP Forensics Module (/network-forensics)", h2_style))
    story.append(make_spec_table(
        "Binary PCAP Network Stream Dissector",
        "Analyst, Investigator, Admin",
        "Upload binary `.pcap` or `.pcapng` packet capture file (max 50MB per upload).",
        "sample_capture.pcap (binary Ethernet/IP frames containing TCP/UDP/DNS flows)",
        "Dissects packet layers, reconstructs TCP conversations, flags beaconing IPs, and extracts DNS domain queries.",
        "• <b>Bandwidth &amp; Packet Metrics:</b> Total packets, total bytes, duration.<br/>"
        "• <b>Protocol Breakdown:</b> HTTP, HTTPS, DNS, SSH, FTP packet ratios.<br/>"
        "• <b>Top IP Talkers:</b> Source/Destination IPs ordered by packet volume.<br/>"
        "• <b>Extracted DNS Queries:</b> List of resolved domain names from DNS frames."
    ))
    story.append(Spacer(1, 12))

    # Page Break for next section
    story.append(PageBreak())

    # --- 3.4 MALWARE FORENSICS ---
    story.append(Paragraph("3.4 Malware Forensics Module (/malware-forensics)", h2_style))
    story.append(make_spec_table(
        "PE / ELF Static Binary Analysis Engine",
        "Analyst, Investigator, Admin",
        "Upload executable binary file (`.exe`, `.dll`, `.bin`, `.elf`, `.apk`, `.pdf`).",
        "update_svc.exe (binary Windows Portable Executable file)",
        "Computes entropy across file sections, extracts Win32 API import flags, and identifies malware packing.",
        "• <b>File Hashes:</b> MD5 &amp; SHA-256 binary checksums.<br/>"
        "• <b>Entropy Score:</b> 0.00–8.00 rating (Entropy &gt; 7.2 flags packing/encryption).<br/>"
        "• <b>Suspicious API Imports:</b> Flags APIs like <code>VirtualAllocEx</code>, <code>WriteProcessMemory</code>, <code>CreateRemoteThread</code>.<br/>"
        "• <b>Malware Family Hint:</b> Heuristic classification (e.g., Ransomware, Spyware, Trojan)."
    ))
    story.append(Spacer(1, 12))

    # --- 3.5 THREAT INTELLIGENCE ---
    story.append(Paragraph("3.5 Threat Intelligence Module (/threat-intelligence)", h2_style))
    story.append(make_spec_table(
        "Multi-Feed Threat Intel IOC Lookup",
        "Analyst, Investigator, Admin",
        "Enter any IP address, domain name, file hash (MD5/SHA256), or CVE ID.",
        "185.220.101.5 OR c5b3a...4f2e OR attacker-c2.xyz",
        "Queries multi-feed threat intelligence databases for reputation scores and campaign tagging.",
        "• <b>Reputation Score:</b> Malicious detection ratio across threat feeds.<br/>"
        "• <b>Known Campaigns:</b> Associated APT groups or malware operations.<br/>"
        "• <b>Geolocation &amp; ASN:</b> Autonomous System Number and host organization."
    ))
    story.append(Spacer(1, 12))

    # --- 3.6 ANALYST WORKSPACE ---
    story.append(Paragraph("3.6 Analyst SOC Workspace (/analyst)", h2_style))
    story.append(Paragraph("Dedicated workspace for Security Operations Center Analysts containing 5 interactive sub-tools:", body_style))

    analyst_sub_data = [
        [Paragraph("Sub-Tool", table_header_style), Paragraph("Input Required", table_header_style), Paragraph("Output Generated", table_header_style)],
        [
            Paragraph("<b>1. Alert Triage Queue</b>", table_cell_bold),
            Paragraph("Click action buttons: <code>FALSE POSITIVE</code>, <code>CONTAIN IP</code>, or <code>ESCALATE</code> on incoming alerts.", table_cell_style),
            Paragraph("Alert status changes immediately. <code>ESCALATE</code> automatically creates an official investigation case.", table_cell_style)
        ],
        [
            Paragraph("<b>2. Threat Hunting Workbench</b>", table_cell_bold),
            Paragraph("• Select <b>YARA</b> or <b>SIGMA</b> mode.<br/>• Paste Rule Code in textarea.<br/>• Paste Test Log/Payload sample.", table_cell_style),
            Paragraph("Signature validation report: Match Status (MATCH_FOUND / NO_MATCH), match count, and matched line snippets.", table_cell_style)
        ],
        [
            Paragraph("<b>3. SIEM Log Parser</b>", table_cell_bold),
            Paragraph("Paste raw Syslog, EVTX, or JSON log text stream into log input box.", table_cell_style),
            Paragraph("Structured anomaly summary: Lines parsed, Failed login count, Shell execution events, and Top IP talkers.", table_cell_style)
        ],
        [
            Paragraph("<b>4. Attack Surface Scanner</b>", table_cell_bold),
            Paragraph("Type target IP address or Domain name into search box.", table_cell_style),
            Paragraph("Security Health Grade (A–F), overall risk score, open ports table, and matching CVE vulnerabilities.", table_cell_style)
        ],
        [
            Paragraph("<b>5. SOAR Playbook Engine</b>", table_cell_bold),
            Paragraph("Select action type (Block IP, Sinkhole Domain, Isolate Endpoint) and enter Target Value.", table_cell_style),
            Paragraph("Executable 1-click containment payloads: Linux <code>iptables</code> / BIND scripts and Windows PowerShell firewalls.", table_cell_style)
        ]
    ]

    t_analyst = Table(analyst_sub_data, colWidths=[120, 184, 200])
    t_analyst.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor("#f0f9ff")),
    ]))
    story.append(t_analyst)
    story.append(Spacer(1, 12))

    # --- 3.7 CASE MANAGEMENT & REPORTS ---
    story.append(Paragraph("3.7 Case Management &amp; Incident Reports (/cases &amp; /reports)", h2_style))
    story.append(make_spec_table(
        "Incident Case Creator & PDF Report Generator",
        "Investigator, Admin",
        "• Case Title, Description, Category, Threat Level (CRITICAL / HIGH / MEDIUM / LOW).<br/>• Upload evidence artifacts to case.",
        "Title: 'Corporate Mail Server Ransomware Intrusion'<br/>Threat Level: CRITICAL<br/>Category: Malware",
        "Unified case file, automated attack timeline, evidence correlation matrix, and downloadable executive PDF report.",
        "• <b>Case Number:</b> Unique ID (e.g. CASE-2026-9041).<br/>"
        "• <b>Unified Timeline:</b> Chronological sequence of all uploaded artifacts.<br/>"
        "• <b>Executive Report PDF:</b> Printable PDF containing executive summary, IOC table, and remediation steps."
    ))
    story.append(Spacer(1, 15))

    # -------------------------------------------------------------------------
    # SECTION 4: STEP-BY-STEP OPERATOR WORKFLOW GUIDE
    # -------------------------------------------------------------------------
    story.append(Paragraph("4. Step-by-Step Operator Workflow Guide", h1_style))
    
    guide_text = [
        "<b>Step 1: Logging In &amp; Role Verification</b><br/>"
        "Navigate to <code>/login</code> and log in with your account credentials. Check the bottom of the left sidebar to verify your assigned role (<b>ANALYST</b>, <b>INVESTIGATOR</b>, or <b>ADMIN</b>).",
        
        "<b>Step 2: Analyst Triage Workflow (For SOC Analysts)</b><br/>"
        "1. Go to <b>Analyst Workspace</b> (<code>/analyst</code>).<br/>"
        "2. In the <b>Alert Triage Queue</b>, review incoming alerts. Click <code>FALSE POSITIVE</code> for noise, or <code>CONTAIN IP</code> to generate block scripts.<br/>"
        "3. Click <code>ESCALATE</code> on high-severity alerts to create an official case.<br/>"
        "4. Use the <b>SIEM Log Parser</b> or <b>Threat Hunting Workbench</b> to validate YARA/Sigma detection rules against new payloads.",

        "<b>Step 3: Investigation Workflow (For Forensic Investigators)</b><br/>"
        "1. Go to <b>Cases &amp; Incidents</b> (<code>/cases</code>).<br/>"
        "2. Click <b>NEW INVESTIGATION CASE</b> and fill in incident details.<br/>"
        "3. Open the case details and upload evidence into Email, URL, PCAP, or Malware tabs.<br/>"
        "4. Click <b>GENERATE PDF REPORT</b> to export an official forensic report.",

        "<b>Step 4: AI Correlation &amp; System Administration (For Admins)</b><br/>"
        "1. Configure your Google Gemini API key in <b>Admin Control Panel</b> (<code>/admin</code>).<br/>"
        "2. Monitor platform audit trail logs and switch user roles as needed."
    ]

    for gt in guide_text:
        story.append(Paragraph(gt, body_style))
        story.append(Spacer(1, 4))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF manual at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_manual_pdf()
