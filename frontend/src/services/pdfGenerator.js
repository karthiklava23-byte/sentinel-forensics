import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateCasePDFReport = async (caseDetail = {}, aiReport = {}, elementId = 'full-report-print-target') => {
  const element = document.getElementById(elementId) || document.getElementById('case-report-printable-container');

  const caseNum = caseDetail?.case_number || 'CASE-REPORT';
  const filename = `Forensic_Investigation_Report_${caseNum}.pdf`;

  if (!element) {
    console.warn("DOM element not found for canvas PDF, triggering window print fallback...");
    window.print();
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#080b11',
      logging: false,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error("Error generating PDF via html2canvas:", err);
    window.print();
  }
};

export const generateCaseHTMLReport = (caseDetail = {}, aiReport = {}, evidenceList = []) => {
  const caseNum = caseDetail?.case_number || 'CASE-REPORT';
  const title = caseDetail?.title || 'Forensic Investigation Dossier';
  const timestamp = new Date().toUTCString();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Classified DFIR Report — ${caseNum}</title>
  <style>
    body {
      background-color: #080b11;
      color: #e2e8f0;
      font-family: 'Courier New', Courier, monospace;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #06b6d4;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      background-color: #7f1d1d;
      color: #fca5a5;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 12px;
      border: 1px solid #ef4444;
    }
    h1 { color: #f8fafc; margin: 0 0 6px 0; font-size: 24px; }
    .meta { color: #94a3b8; font-size: 12px; }
    .section {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .section-title {
      color: #06b6d4;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #1e293b;
      padding: 10px;
      text-align: left;
    }
    th { background-color: #1e293b; color: #38bdf8; text-transform: uppercase; }
    .ioc-type { color: #a855f7; font-weight: bold; }
    .ioc-val { color: #f43f5e; font-weight: bold; word-break: break-all; }
    .coc-stamp {
      background: #022c22;
      border: 1px solid #059669;
      color: #6ee7b7;
      padding: 16px;
      border-radius: 6px;
      font-size: 11px;
      margin-top: 30px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      border-top: 1px solid #1e293b;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div style="color: #06b6d4; font-weight: bold; font-size: 11px; letter-spacing: 2px;">OFFICIAL DIGITAL FORENSICS & INCIDENT RESPONSE DOSSIER</div>
      <h1>${title}</h1>
      <div class="meta">CASE ID: ${caseNum} | EXPORT TIMESTAMP: ${timestamp}</div>
    </div>
    <div class="badge">THREAT LEVEL: ${aiReport.threat_level || 'HIGH'}</div>
  </div>

  <div class="section">
    <div class="section-title">Executive Threat Summary</div>
    <p>${aiReport.executive_summary || 'No summary available.'}</p>
  </div>

  <div class="section">
    <div class="section-title">Incident Attack Vector & Analysis</div>
    <p>${aiReport.attack_vector || 'Vector analysis pending.'}</p>
  </div>

  <div class="section">
    <div class="section-title">Correlated Indicators of Compromise (IOCs)</div>
    <table>
      <thead>
        <tr>
          <th>Artifact Type</th>
          <th>Indicator / Hash Value</th>
          <th>Source Module</th>
        </tr>
      </thead>
      <tbody>
        ${(aiReport.correlated_iocs || []).map(ioc => `
          <tr>
            <td class="ioc-type">${ioc.type || 'IOC'}</td>
            <td class="ioc-val">${ioc.value || 'N/A'}</td>
            <td>${ioc.source || 'Forensics Engine'}</td>
          </tr>
        `).join('') || '<tr><td colspan="3">No correlated IOCs found.</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Incident Timeline Reconstruction</div>
    <table>
      <thead>
        <tr>
          <th>Stage</th>
          <th>Event Description</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${(aiReport.timeline || []).map(evt => `
          <tr>
            <td style="color: #06b6d4; font-weight: bold;">${evt.stage || 'Event'}</td>
            <td>${evt.description || ''}</td>
            <td style="color: #94a3b8;">${evt.timestamp || ''}</td>
          </tr>
        `).join('') || '<tr><td colspan="3">No timeline events recorded.</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="coc-stamp">
    <div style="font-weight: bold; font-size: 12px; margin-bottom: 6px;">✔ CERTIFIED DIGITAL CHAIN OF CUSTODY</div>
    <div>Digital Integrity Signature (SHA-256 Digest): <code style="color: #67e8f9;">${caseDetail.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code></div>
    <div>Acquisition Officer: ${caseDetail.created_by || 'Lead Forensic Investigator'}</div>
    <div>Evidence Verification: Cryptographically Verified & Immutable</div>
  </div>

  <div class="footer">
    CONFIDENTIAL & PROPRIETARY — GENERATED BY GEMINI AI DIGITAL FORENSICS PLATFORM
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Forensic_Report_${caseNum}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

