import React, { useState } from 'react';
import { Mail, Upload, ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle, ChevronRight, Activity } from 'lucide-react';
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Email Forensics & Header Analysis
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">EML Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Analyze email headers, SPF/DKIM validation, hop tracing, attachments, and phishing probability scores
            </p>
          </div>
        </div>
      </div>

      {/* Upload Workbench Form */}
      <div className="soc-card p-6 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Upload Email Message (.EML / .MSG)</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 bg-[#0c1019] text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".eml,.msg"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    {file ? file.name : 'Click to select or drag & drop an .EML file here'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {file ? `File size: ${(file.size / 1024).toFixed(1)} KB` : 'Supports standard .EML and .MSG RFC-822 header formats'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Analyzing Email Headers...</span>
                </>
              ) : (
                <span>Parse & Analyze EML</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Workbench */}
      {result && (
        <div className="soc-card p-6 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[11px] text-slate-400 font-mono">File Artifact: {result.filename}</span>
              <h2 className="text-base font-bold text-slate-100 mt-1">{result.subject}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Phishing Score</span>
                <p className="text-xl font-bold text-rose-400 font-mono">{result.phishing_score}/100</p>
              </div>
              <ThreatBadge level={result.threat_level} />
            </div>
          </div>

          {/* Email Header Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0c1019] p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Sender (From):</span>
              <p className="text-blue-400 font-semibold font-mono mt-0.5">{result.sender}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Recipient (To):</span>
              <p className="text-slate-200 font-mono mt-0.5">{result.recipient}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Return-Path Header:</span>
              <p className="text-rose-300 font-semibold font-mono mt-0.5">{result.return_path}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Timestamp:</span>
              <p className="text-slate-300 mt-0.5">{result.date}</p>
            </div>
          </div>

          {/* Authentication Protocols (SPF / DKIM / DMARC) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Email Authentication Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                result.spf_status === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase font-medium text-slate-400">SPF Protocol</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{result.spf_status}</p>
                </div>
                {result.spf_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                result.dkim_status === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase font-medium text-slate-400">DKIM Signature</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{result.dkim_status}</p>
                </div>
                {result.dkim_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                result.dmarc_status === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <div>
                  <p className="text-[10px] uppercase font-medium text-slate-400">DMARC Policy</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{result.dmarc_status}</p>
                </div>
                {result.dmarc_status === 'PASS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* Hop IP Trace & Suspicious Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Hop IPs */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Received Header IP Hops</h4>
              <div className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                {result.hop_ips.length > 0 ? (
                  result.hop_ips.map((ip, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-400 font-sans">Hop #{idx + 1}:</span>
                      <span className="text-blue-400 font-semibold">{ip}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 font-sans text-xs">No external IP hops extracted</p>
                )}
              </div>
            </div>

            {/* Suspicious Keywords */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Flagged Phishing Keywords</h4>
              <div className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl flex flex-wrap gap-2 text-xs">
                {result.suspicious_keywords.length > 0 ? (
                  result.suspicious_keywords.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-medium text-[11px]">
                      ⚠️ {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">No high-risk suspicious keywords flagged</p>
                )}
              </div>
            </div>
          </div>

          {/* Attachment Inspection */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-semibold text-slate-300">Embedded Attachments ({(result.attachments || []).length})</h4>
            <div className="space-y-2">
              {(result.attachments || []).map((att, idx) => (
                <div key={idx} className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-semibold font-mono text-xs">{att.filename}</span>
                      {att.is_suspicious && (
                        <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-medium">
                          Malicious Payload
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">SHA256: {att.sha256}</p>
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
