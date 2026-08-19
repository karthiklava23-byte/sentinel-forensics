import React, { useState } from 'react';
import { Globe, Search, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Activity } from 'lucide-react';
import { evidenceAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const UrlForensicsPage = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a target URL to analyze');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await evidenceAPI.analyzeUrl(url);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to scan URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              URL Threat Scanner & WHOIS Inspector
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Domain Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deep feature extraction, WHOIS domain age calculation, typosquatting checks, and phishing probability scoring
            </p>
          </div>
        </div>
      </div>

      {/* Input Workbench */}
      <div className="soc-card p-6 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Suspicious URL or Domain Name</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. http://login.auth-secure-update.xyz/login"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#0c1019] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 md:mt-6 w-full md:w-auto">
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Scanning Domain...</span>
                  </>
                ) : (
                  <span>Scan & Analyze URL</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Workbench */}
      {result && (
        <div className="soc-card p-6 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Target Domain: {result.domain}</span>
              <h2 className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-2 font-mono">
                {result.url}
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Score</span>
                <p className="text-xl font-bold text-rose-400 font-mono">{result.risk_score}/100</p>
              </div>
              <ThreatBadge level={result.threat_level} />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0c1019] p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Encryption Status:</span>
              <p className={`font-bold mt-0.5 ${result.is_https ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.is_https ? 'HTTPS Encrypted' : 'HTTP Insecure'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Domain Age:</span>
              <p className="text-slate-200 font-semibold font-mono mt-0.5">{String(result.domain_age_days || 0)} days old</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Resolved IP Address:</span>
              <p className="text-blue-400 font-semibold font-mono mt-0.5">{String(result.ip_address || 'N/A')} ({String(result.country || 'US')})</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Reputation Score:</span>
              <p className="text-rose-400 font-semibold truncate mt-0.5">{String(result.reputation || 'UNKNOWN')}</p>
            </div>
          </div>

          {/* WHOIS Information */}
          <div className="p-4 bg-[#0c1019] rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 className="text-xs font-semibold text-slate-300">WHOIS Registration Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
              <div><span className="text-slate-400 font-sans">Registrar:</span> {typeof result.whois_registrar === 'object' ? JSON.stringify(result.whois_registrar) : String(result.whois_registrar || 'N/A')}</div>
              <div><span className="text-slate-400 font-sans">Created Date:</span> {typeof result.creation_date === 'object' ? JSON.stringify(result.creation_date) : String(result.creation_date || 'N/A')}</div>
            </div>
          </div>

          {/* Suspicious Feature Indicators */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Heuristic Threat Indicators Detected ({(result?.suspicious_features || []).length})
            </h4>

            <div className="space-y-2">
              {(result?.suspicious_features || []).length > 0 ? (
                (result?.suspicious_features || []).map((feat, idx) => (
                  <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-center gap-2.5 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{typeof feat === 'object' ? (feat.details || feat.feature || JSON.stringify(feat)) : String(feat)}</span>
                  </div>
                ))
              ) : (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2.5 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No suspicious URL heuristics detected. Domain appears legitimate.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForensicsPage;
