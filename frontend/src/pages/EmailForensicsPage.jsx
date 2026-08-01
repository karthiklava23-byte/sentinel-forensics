import React, { useState } from 'react';
import { Mail, Upload, ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { evidenceAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const EmailForensicsPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
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
      setError(err.response?.data?.detail || 'Failed to parse EML file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 font-mono">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Mail className="w-6 h-6 text-cyan-400" />
          EMAIL FORENSICS & HEADER INSPECTOR
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive .EML header parsing, SPF/DKIM validation, hop tracing, attachment payload auditing & phishing risk calculation.
        </p>
      </div>

      {/* Upload Workbench Form */}
      <div className="cyber-card p-6 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-slate-400 mb-1">UPLOAD .EML FILE</label>
              <input
                type="file"
                accept=".eml,.msg"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-400"
              />
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded shadow-cyber-glow transition-all"
              >
                {loading ? 'PARSING EML...' : 'PARSE & ANALYZE EMAIL'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Workbench */}
      {result && (
        <div className="cyber-card-glow p-6 rounded-xl font-mono text-xs space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">PARSED ARTIFACT: {result.filename}</span>
              <h2 className="text-base font-bold text-slate-100 mt-1">{result.subject}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400">PHISHING SCORE</span>
                <p className="text-xl font-bold text-rose-400">{result.phishing_score}/100</p>
              </div>
              <ThreatBadge level={result.threat_level} />
            </div>
          </div>

          {/* Email Header Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px]">SENDER (FROM):</span>
              <p className="text-cyan-400 font-bold">{result.sender}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">RECIPIENT (TO):</span>
              <p className="text-slate-200">{result.recipient}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">RETURN-PATH HEADER:</span>
              <p className="text-rose-300 font-semibold">{result.return_path}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">TIMESTAMP:</span>
              <p className="text-slate-300">{result.date}</p>
            </div>
          </div>

          {/* Authentication Protocols (SPF / DKIM / DMARC) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              EMAIL AUTHENTICATION CHECKS
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                result.spf_status === 'PASS' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">SPF PROTOCOL</p>
                  <p className="text-sm font-bold">{result.spf_status}</p>
                </div>
                {result.spf_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>

              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                result.dkim_status === 'PASS' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">DKIM SIGNATURE</p>
                  <p className="text-sm font-bold">{result.dkim_status}</p>
                </div>
                {result.dkim_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>

              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                result.dmarc_status === 'PASS' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">DMARC POLICY</p>
                  <p className="text-sm font-bold">{result.dmarc_status}</p>
                </div>
                {result.dmarc_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* Hop IP Trace & Suspicious Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hop IPs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase">RECEIVED HEADER IP HOPS</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                {result.hop_ips.length > 0 ? (
                  result.hop_ips.map((ip, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-400">Hop #{idx + 1}:</span>
                      <span className="text-cyan-400 font-bold">{ip}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No external IP hops extracted</p>
                )}
              </div>
            </div>

            {/* Suspicious Keywords */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase">SUSPICIOUS KEYWORDS DETECTED</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-wrap gap-2">
                {result.suspicious_keywords.length > 0 ? (
                  result.suspicious_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded text-[11px]">
                      ⚠️ {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500">No high-risk suspicious keywords flagged</p>
                )}
              </div>
            </div>
          </div>

          {/* Attachment Inspection */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase">EMBEDDED ATTACHMENTS ({result.attachments.length})</h4>
            <div className="space-y-2">
              {result.attachments.map((att, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-bold">{att.filename}</span>
                      {att.is_suspicious && (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-500/50 rounded text-[10px]">
                          MALICIOUS PAYLOAD
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">SHA256: {att.sha256}</p>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Size: {(att.size_bytes / 1024).toFixed(1)} KB | {att.content_type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailForensicsPage;
