import React, { useState } from 'react';
import { Mail, Upload, ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle, ChevronRight, Activity, Play, Send, Server, Globe, Link2, ShieldAlert } from 'lucide-react';
import { evidenceAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const SAMPLE_EMAILS = [
  {
    name: "Executive CEO Urgent Wire Transfer Phish",
    filename: "urgent_wire_transfer.eml",
    type: "BEC PHISHING",
    result: {
      filename: "urgent_wire_transfer.eml",
      sender: "ceo-office@company-corp-auth-secure.com",
      display_name: "John Doe (CEO)",
      recipient: "finance-dept@company.com",
      subject: "URGENT: Confidential Acquisition Wire Payment Required",
      date: "Wed, 19 Aug 2026 14:22:10 +0000",
      return_path: "bounce@phish-domain-relay.ru",
      auth_alignment: {
        spf: { status: "FAIL", detail: "SoftFail IP 185.220.101.9 not listed in SPF record" },
        dkim: { status: "FAIL", detail: "Signature invalid / key mismatch" },
        dmarc: { status: "FAIL", detail: "Domain spoofing detected" }
      },
      phishing_score: 94,
      threat_level: "CRITICAL",
      verdict: "EXECUTIVE BEC PHISHING SPOOF",
      mail_hops: [
        { hop: 1, from: "185.220.101.9 (Sender IP)", to: "relay.phish-mail.ru", delay: "0s" },
        { hop: 2, from: "relay.phish-mail.ru", to: "mx1.company.com (Edge Guard)", delay: "1.2s" },
        { hop: 3, from: "mx1.company.com", to: "inbox.company.com", delay: "0.4s" }
      ],
      extracted_links: [
        { url: "http://company-corp-auth-secure.com/login.php", text: "Approve Wire Payment Online", risk: "CRITICAL" },
        { url: "https://support.microsoft.com", text: "Help Center", risk: "LOW" }
      ],
      attachments: [
        { name: "Acquisition_Wire_Details.pdf.exe", size: "184 KB", sha256: "a48f29...b82c", threat: "Executable extension disguised as PDF" }
      ]
    }
  },
  {
    name: "Microsoft 365 Password Expiration Alert",
    filename: "m365_password_expired.eml",
    type: "CREDENTIAL HARVEST",
    result: {
      filename: "m365_password_expired.eml",
      sender: "no-reply@microsoft-security-alert-center.net",
      display_name: "Microsoft 365 Security Team",
      recipient: "employee@company.com",
      subject: "Action Required: Password Expires in 2 Hours",
      date: "Wed, 19 Aug 2026 11:05:00 +0000",
      return_path: "spammer@bad-host-server.com",
      auth_alignment: {
        spf: { status: "FAIL", detail: "IP 194.26.29.5 unaligned" },
        dkim: { status: "NONE", detail: "No DKIM signature header present" },
        dmarc: { status: "FAIL", detail: "Strict policy rejection triggered" }
      },
      phishing_score: 89,
      threat_level: "HIGH",
      verdict: "CREDENTIAL HARVESTING PHISH",
      mail_hops: [
        { hop: 1, from: "194.26.29.5", to: "mx-edge.company.com", delay: "0.8s" }
      ],
      extracted_links: [
        { url: "https://login-microsoft365-verify.com/auth", text: "Keep Current Password", risk: "HIGH" }
      ],
      attachments: []
    }
  }
];

const EmailForensicsPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(SAMPLE_EMAILS[0].result);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!file) {
      setError('Please select an .EML file to analyze');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await evidenceAPI.analyzeEmail(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to parse EML file. Showing diagnostic sample model.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setLoading(true);
    setTimeout(() => {
      setResult(sample.result);
      setFile(null);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Email Forensics & Header Authentication Inspector
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono font-semibold">EML Engine v2.8</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              RFC-822 header inspection, SPF/DKIM/DMARC alignment validation, visual mail hop tracing & attachment malware scanning
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Samples & Custom Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Quick Loaders */}
        <div className="soc-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-2">
            <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5 uppercase">
              <Play className="w-3.5 h-3.5 text-blue-400" />
              1-Click Sample Email Evidence
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {SAMPLE_EMAILS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(sample)}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  result?.filename === sample.filename
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-[#0B101D] border-[#23314D] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-200">{sample.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{sample.filename}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold">
                  {sample.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom EML Uploader */}
        <div className="lg:col-span-2 soc-card p-5 space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 font-mono">Upload Email Header (.EML / .MSG File)</label>
              <div className="border-2 border-dashed border-[#23314D] hover:border-blue-500 rounded-lg p-5 bg-[#0B101D] text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".eml,.msg"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-slate-200 font-mono">
                    {file ? file.name : 'Click to select or drag & drop .EML message file'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Parses headers without downloading external tracking pixels or executing embedded scripts
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="soc-btn-primary w-full sm:w-auto font-mono"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Parsing RFC-822 Headers...</span>
                </>
              ) : (
                <span>Parse & Analyze EML Message</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Inspection Output Workbench */}
      {result && (
        <div className="space-y-6">
          {/* Hero Summary & Verdict Card */}
          <div className="soc-card p-5 border-l-4 border-l-rose-500 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Verdict:</span>
                <strong className="text-slate-100 font-mono text-sm text-rose-400">{result.verdict}</strong>
                <ThreatBadge level={result.threat_level || 'CRITICAL'} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-slate-300">
                <p>From: <span className="text-slate-100 font-semibold">{result.display_name}</span> &lt;{result.sender}&gt;</p>
                <p>To: <span className="text-slate-200">{result.recipient}</span></p>
                <p>Subject: <span className="text-amber-300 font-semibold">{result.subject}</span></p>
                <p>Return-Path: <span className="text-rose-400 font-mono">{result.return_path}</span></p>
              </div>
            </div>

            <div className="p-4 bg-[#0B101D] border border-[#23314D] rounded-lg text-center font-mono shrink-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Phishing Risk Score</p>
              <p className="text-3xl font-bold text-rose-400">{result.phishing_score}/100</p>
              <span className="text-[9px] text-rose-300 font-bold">SUSPECTED SPOOF</span>
            </div>
          </div>

          {/* Authentication Alignment Badges */}
          <div className="soc-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Email Authentication Security Alignment (SPF / DKIM / DMARC)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* SPF */}
              <div className="p-3 bg-[#0B101D] border border-rose-500/30 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">SPF Protocol</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                    {result.auth_alignment?.spf?.status || 'FAIL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{result.auth_alignment?.spf?.detail}</p>
              </div>

              {/* DKIM */}
              <div className="p-3 bg-[#0B101D] border border-rose-500/30 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">DKIM Signature</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                    {result.auth_alignment?.dkim?.status || 'FAIL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{result.auth_alignment?.dkim?.detail}</p>
              </div>

              {/* DMARC */}
              <div className="p-3 bg-[#0B101D] border border-rose-500/30 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">DMARC Policy</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                    {result.auth_alignment?.dmarc?.status || 'FAIL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{result.auth_alignment?.dmarc?.detail}</p>
              </div>
            </div>
          </div>

          {/* Mail Hop Route Diagram & Body Links Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Mail Hop Trace */}
            <div className="soc-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
                <Server className="w-4 h-4 text-blue-400" />
                Visual Mail Hop Relay Trace
              </h4>

              <div className="space-y-3 font-mono text-xs">
                {result.mail_hops?.map((hop) => (
                  <div key={hop.hop} className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="text-blue-400 font-bold">Hop #{hop.hop}</span>
                      <span>Relay Delay: {hop.delay}</span>
                    </div>
                    <p className="text-slate-200">From: <span className="text-rose-400 font-semibold">{hop.from}</span></p>
                    <p className="text-slate-300">To: <span className="text-cyan-400">{hop.to}</span></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Body Hyperlinks */}
            <div className="soc-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
                <Link2 className="w-4 h-4 text-amber-400" />
                Extracted Body Hyperlinks ({result.extracted_links?.length || 0})
              </h4>

              <div className="space-y-2 font-mono text-xs">
                {result.extracted_links?.map((lnk, i) => (
                  <div key={i} className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{lnk.text}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        {lnk.risk} RISK
                      </span>
                    </div>
                    <p className="text-cyan-400 text-[11px] font-mono break-all">{lnk.url}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailForensicsPage;
