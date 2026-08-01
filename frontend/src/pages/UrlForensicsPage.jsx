import React, { useState } from 'react';
import { Globe, Search, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
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
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 font-mono">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Globe className="w-6 h-6 text-emerald-400" />
          URL THREAT ANALYSIS & WHOIS INSPECTOR
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform deep feature extraction on suspicious URLs, WHOIS domain age calculation, brand typosquatting checks & phishing probability scoring.
        </p>
      </div>

      {/* Input Workbench */}
      <div className="cyber-card p-6 rounded-xl border border-slate-800 font-mono text-xs space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <label className="block text-slate-400 mb-1">SUSPICIOUS URL / DOMAIN NAME</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. http://login.auth-secure-update.xyz/login"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-5">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded shadow-neon-green transition-all"
              >
                {loading ? 'SCANNING DOMAIN...' : 'SCAN & ANALYZE URL'}
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
              <span className="text-[10px] text-slate-500 uppercase">TARGET DOMAIN: {result.domain}</span>
              <h2 className="text-base font-bold text-cyan-400 mt-1 flex items-center gap-2">
                {result.url}
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400">RISK SCORE</span>
                <p className="text-xl font-bold text-rose-400">{result.risk_score}/100</p>
              </div>
              <ThreatBadge level={result.threat_level} />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px]">ENCRYPTION STATUS:</span>
              <p className={`font-bold ${result.is_https ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.is_https ? 'HTTPS SECURE' : 'HTTP UNENCRYPTED'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 text-[10px]">DOMAIN AGE:</span>
              <p className="text-slate-200 font-bold">{result.domain_age_days} days old</p>
            </div>

            <div>
              <span className="text-slate-500 text-[10px]">RESOLVED IP:</span>
              <p className="text-cyan-400 font-bold">{result.ip_address} ({result.country})</p>
            </div>

            <div>
              <span className="text-slate-500 text-[10px]">REPUTATION SCORE:</span>
              <p className="text-rose-400 font-bold truncate">{result.reputation}</p>
            </div>
          </div>

          {/* WHOIS Information */}
          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase">WHOIS REGISTRATION METADATA</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500">REGISTRAR:</span> {result.whois_registrar}</div>
              <div><span className="text-slate-500">REGISTRATION DATE:</span> {result.creation_date}</div>
            </div>
          </div>

          {/* Suspicious Feature Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              HEURISTIC THREAT INDICATORS DETECTED ({result.suspicious_features.length})
            </h4>

            <div className="space-y-2">
              {result.suspicious_features.map((feat, idx) => (
                <div key={idx} className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForensicsPage;
