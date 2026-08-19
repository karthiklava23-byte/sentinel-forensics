import React, { useState } from 'react';
import {
  ShieldCheck, Search, Globe, Mail, Hash, Wifi, AlertTriangle,
  CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight,
  Activity, Flag, Zap, Shield, Target, Database, Play, Download, ExternalLink
} from 'lucide-react';
import { threatIntelAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const SAMPLE_IOCS = [
  {
    type: "HASH",
    value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    label: "LockBit 3.0 Ransomware SHA-256",
    result: {
      ioc_type: "HASH",
      ioc_value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      reputation: "MALICIOUS",
      threat_severity: "CRITICAL",
      virustotal_score: "68 / 72",
      abuseipdb_score: 98,
      otx_pulses: 14,
      country: "Global Threat",
      malware_families: ["LockBit 3.0", "Ransom.Win32.LockBit", "Trojan-Ransom.Win32.Wanna"],
      description: "Flagged in 14 AlienVault OTX pulses as primary LockBit 3.0 ransomware executable payload.",
      mitre_ttp: "T1486 - Data Encrypted for Impact"
    }
  },
  {
    type: "IP",
    value: "185.220.101.5",
    label: "Cobalt Strike C2 Node (IP)",
    result: {
      ioc_type: "IP",
      ioc_value: "185.220.101.5",
      reputation: "MALICIOUS",
      threat_severity: "HIGH",
      virustotal_score: "42 / 70",
      abuseipdb_score: 100,
      otx_pulses: 9,
      country: "Germany (DE)",
      malware_families: ["Cobalt Strike Beacon", "Metasploit Stager"],
      description: "Listed in AbuseIPDB as active Cobalt Strike Command & Control server running on port 443.",
      mitre_ttp: "T1071.001 - Application Layer Protocol: Web Protocols"
    }
  },
  {
    type: "DOMAIN",
    value: "c2.badactor-domain.com",
    label: "Phishing & Exfil C2 Domain",
    result: {
      ioc_type: "DOMAIN",
      ioc_value: "c2.badactor-domain.com",
      reputation: "MALICIOUS",
      threat_severity: "HIGH",
      virustotal_score: "38 / 68",
      abuseipdb_score: 85,
      otx_pulses: 6,
      country: "Russia (RU)",
      malware_families: ["AgentTesla Infostealer"],
      description: "Registered 2 days ago via high-risk abuse registrar. Active DNS C2 tunneling sinkhole.",
      mitre_ttp: "T1566.002 - Spearphishing Link"
    }
  }
];

export default function ThreatIntelPage() {
  const [iocType, setIocType] = useState('HASH');
  const [iocQuery, setIocQuery] = useState('');
  const [result, setResult] = useState(SAMPLE_IOCS[0].result);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!iocQuery.trim()) {
      setError('Please enter an IOC hash, IP address, or domain name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await threatIntelAPI.lookup({ ioc_type: iocType, ioc_value: iocQuery.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Threat Intelligence lookup failed. Showing diagnostic threat model.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setLoading(true);
    setTimeout(() => {
      setResult(sample.result);
      setIocType(sample.type);
      setIocQuery(sample.value);
      setLoading(false);
    }, 400);
  };

  const handleExportSTIX = () => {
    const stixData = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substr(2, 9)}`,
      objects: [
        {
          type: "indicator",
          id: `indicator--${Math.random().toString(36).substr(2, 9)}`,
          name: result?.ioc_value,
          pattern: `[${result?.ioc_type?.toLowerCase()}:value = '${result?.ioc_value}']`,
          valid_from: new Date().toISOString()
        }
      ]
    };
    const blob = new Blob([JSON.stringify(stixData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stix2.1_${result?.ioc_type}_${result?.ioc_value?.slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              IOC Threat Intelligence Hub & Feeds
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">STIX 2.1 Ready</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Consolidated threat reputation, VirusTotal / AbuseIPDB / AlienVault OTX consensus & MITRE ATT&CK mapping
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Samples & Search Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Loaders */}
        <div className="soc-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-2">
            <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5 uppercase">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              1-Click Threat Indicators
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {SAMPLE_IOCS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => loadSample(sample)}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  result?.ioc_value === sample.value
                    ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                    : 'bg-[#0B101D] border-[#23314D] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-200">{sample.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">{sample.value}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono font-bold">
                  {sample.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Workbench */}
        <div className="lg:col-span-2 soc-card p-5 space-y-4">
          <form onSubmit={handleSearch} className="space-y-4 font-mono">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">IOC Category</label>
                <select
                  value={iocType}
                  onChange={(e) => setIocType(e.target.value)}
                  className="soc-input w-full font-mono text-xs"
                >
                  <option value="HASH">SHA-256 / MD5 Hash</option>
                  <option value="IP">IP Address</option>
                  <option value="DOMAIN">Domain Name</option>
                  <option value="URL">Full URL</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Indicator Value</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={iocQuery}
                    onChange={(e) => setIocQuery(e.target.value)}
                    placeholder="Enter SHA-256 hash, IPv4 address, or domain..."
                    className="soc-input w-full pl-9 py-2 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !iocQuery.trim()}
                className="soc-btn-primary bg-emerald-600 hover:bg-emerald-700 font-mono"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Querying Threat Databases...</span>
                  </>
                ) : (
                  <span>Query Threat Intelligence DB</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Threat Intelligence Output Card */}
      {result && (
        <div className="space-y-6 font-mono text-xs">
          <div className="soc-card p-5 border-l-4 border-l-rose-500 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23314D] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                    {result.ioc_type}
                  </span>
                  <strong className="text-slate-100 text-sm">{result.ioc_value}</strong>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{result.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <ThreatBadge level={result.threat_severity || 'CRITICAL'} />
                <button
                  onClick={handleExportSTIX}
                  className="soc-btn-secondary py-1 text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export STIX 2.1</span>
                </button>
              </div>
            </div>

            {/* Vendor Consensus Score Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0B101D] border border-rose-500/30 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">VirusTotal Verdict</p>
                <p className="text-xl font-bold text-rose-400">{result.virustotal_score}</p>
                <span className="text-[9px] text-slate-500">Engines Flagged Malicious</span>
              </div>

              <div className="p-3 bg-[#0B101D] border border-amber-500/30 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">AbuseIPDB Score</p>
                <p className="text-xl font-bold text-amber-400">{result.abuseipdb_score}%</p>
                <span className="text-[9px] text-slate-500">Abuse Confidence Index</span>
              </div>

              <div className="p-3 bg-[#0B101D] border border-cyan-500/30 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">AlienVault OTX</p>
                <p className="text-xl font-bold text-cyan-400">{result.otx_pulses} Pulses</p>
                <span className="text-[9px] text-slate-500">Threat Feeds</span>
              </div>

              <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Location / GeoIP</p>
                <p className="text-xl font-bold text-slate-200">{result.country}</p>
                <span className="text-[9px] text-slate-500">Registered Origin</span>
              </div>
            </div>

            {/* Malware Families & MITRE TTP */}
            {result.malware_families && result.malware_families.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-1">
                <p className="text-[10px] text-rose-400 font-bold uppercase">Associated Malware Families & Botnets</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.malware_families.map((fam, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                      {fam}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
