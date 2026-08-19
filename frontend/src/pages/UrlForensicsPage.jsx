import React, { useState } from 'react';
import { Globe, Search, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Activity, Play, Database, Server, Lock, Eye } from 'lucide-react';
import { evidenceAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const SAMPLE_URLS = [
  {
    name: "Credential Harvesting Phishing Domain",
    url: "http://login.auth-secure-update.xyz/signin",
    type: "PHISHING",
    result: {
      url: "http://login.auth-secure-update.xyz/signin",
      domain: "login.auth-secure-update.xyz",
      ip_address: "185.220.101.42",
      country: "Russia (RU)",
      registrar: "NameCheap Inc (Abuse Host)",
      creation_date: "2026-08-18 (1 day old)",
      ssl_issuer: "Let's Encrypt (Free DV Certificate)",
      threat_score: 95,
      threat_level: "CRITICAL",
      verdict: "CREDENTIAL HARVESTING DOMAIN",
      dns_records: [
        { type: "A", value: "185.220.101.42", ttl: "300s" },
        { type: "MX", value: "mail.auth-secure-update.xyz", ttl: "3600s" },
        { type: "TXT", value: "v=spf1 -all", ttl: "3600s" }
      ],
      dom_elements_flagged: [
        "Hidden password input capturing keyup events",
        "Spoofed Microsoft OAuth 2.0 brand logo SVG",
        "Form submission pointing to external C2 endpoint"
      ]
    }
  },
  {
    name: "Drive-By Browser Exploit Kit Sandbox",
    url: "http://free-cracked-software-installer.top/download",
    type: "EXPLOIT KIT",
    result: {
      url: "http://free-cracked-software-installer.top/download",
      domain: "free-cracked-software-installer.top",
      ip_address: "194.26.29.88",
      country: "Panama (PA)",
      registrar: "Eranean Registrar LTD",
      creation_date: "2026-08-10 (9 days old)",
      ssl_issuer: "Self-Signed (Untrusted)",
      threat_score: 88,
      threat_level: "HIGH",
      verdict: "DRIVE-BY EXPLOIT KIT",
      dns_records: [
        { type: "A", value: "194.26.29.88", ttl: "60s" }
      ],
      dom_elements_flagged: [
        "Automated invisible iframe payload download (.zip.exe)",
        "Obfuscated JavaScript packed via JSFuck encoding"
      ]
    }
  }
];

const UrlForensicsPage = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(SAMPLE_URLS[0].result);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e?.preventDefault();
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
      setError(err.response?.data?.detail || 'Failed to scan URL. Showing diagnostic sample domain model.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setLoading(true);
    setTimeout(() => {
      setResult(sample.result);
      setUrl(sample.url);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              URL & Domain Reputation Sandbox
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">Domain Engine v2.4</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              WHOIS domain age calculation, DNS record matrix, typosquatting detection, SSL certificate inspection & DOM risk evaluation
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Samples & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Quick Loaders */}
        <div className="soc-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-2">
            <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5 uppercase">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Sample Domain Artifacts
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(sample)}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  result?.domain === sample.result.domain
                    ? 'bg-cyan-600/20 border-cyan-500 text-white font-semibold'
                    : 'bg-[#0B101D] border-[#23314D] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-200">{sample.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{sample.url}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold">
                  {sample.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* URL Input Form */}
        <div className="lg:col-span-2 soc-card p-5 space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 font-mono">Target Domain or Full URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. http://login.auth-secure-update.xyz/login"
                  className="soc-input w-full pl-9 py-2 font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="soc-btn-primary bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto font-mono"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Inspecting DNS & DOM...</span>
                </>
              ) : (
                <span>Scan & Analyze URL</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Output Results Workbench */}
      {result && (
        <div className="space-y-6 font-mono text-xs">
          {/* Verdict Banner */}
          <div className="soc-card p-5 border-l-4 border-l-rose-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Verdict:</span>
                <strong className="text-rose-400 text-sm">{result.verdict}</strong>
                <ThreatBadge level={result.threat_level || 'CRITICAL'} />
              </div>
              <p className="text-slate-300">Target URL: <span className="text-cyan-400 font-bold">{result.url}</span></p>
              <p className="text-slate-400 text-[11px]">Domain: <strong>{result.domain}</strong> • IP Address: <strong>{result.ip_address}</strong> ({result.country})</p>
            </div>

            <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg text-center shrink-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Reputation Risk Score</p>
              <p className="text-2xl font-bold text-rose-400">{result.threat_score}/100</p>
            </div>
          </div>

          {/* WHOIS Data & DNS Record Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WHOIS Data */}
            <div className="soc-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
                <Database className="w-4 h-4 text-blue-400" />
                WHOIS Domain Registration Data
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded flex justify-between">
                  <span className="text-slate-400">Domain Registrar:</span>
                  <span className="text-slate-200 font-bold">{result.registrar}</span>
                </div>
                <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded flex justify-between">
                  <span className="text-slate-400">Creation Date:</span>
                  <span className="text-rose-400 font-bold">{result.creation_date}</span>
                </div>
                <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded flex justify-between">
                  <span className="text-slate-400">SSL Certificate Issuer:</span>
                  <span className="text-slate-200 font-bold">{result.ssl_issuer}</span>
                </div>
              </div>
            </div>

            {/* DNS Records */}
            <div className="soc-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
                <Server className="w-4 h-4 text-cyan-400" />
                DNS Resource Records
              </h4>

              <div className="space-y-2 text-xs">
                {result.dns_records?.map((dns, idx) => (
                  <div key={idx} className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">[{dns.type}]</span>
                    <span className="text-slate-200">{dns.value}</span>
                    <span className="text-slate-500 text-[10px]">TTL: {dns.ttl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DOM Element Inspection */}
          {result.dom_elements_flagged && result.dom_elements_flagged.length > 0 && (
            <div className="soc-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
                <Eye className="w-4 h-4 text-amber-400" />
                Headless DOM Inspector & Malicious Script Flags
              </h4>

              <div className="space-y-2 text-xs">
                {result.dom_elements_flagged.map((flag, i) => (
                  <div key={i} className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2 text-slate-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlForensicsPage;
