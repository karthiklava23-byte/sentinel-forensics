import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Search, Globe, Mail, Hash, Wifi, AlertTriangle,
  CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight,
  Activity, Flag, Zap, Shield, Target, Database, RefreshCw, Bug
} from 'lucide-react';
import { threatIntelAPI } from '../services/api';

const IOC_TYPES = ['IP', 'DOMAIN', 'URL', 'HASH', 'EMAIL'];

const ReputationBadge = ({ reputation }) => {
  const map = {
    MALICIOUS:  'status-pill-rose font-medium',
    SUSPICIOUS: 'status-pill-amber font-medium',
    CLEAN:      'status-pill-emerald font-medium',
    UNKNOWN:    'bg-[#182030] text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-sans text-xs font-medium',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-sans capitalize ${map[reputation] || map.UNKNOWN}`}>
      {reputation?.toLowerCase()}
    </span>
  );
};

const SeverityBadge = ({ level }) => {
  const map = {
    CRITICAL: 'status-pill-rose font-medium',
    HIGH:     'status-pill-amber font-medium',
    MEDIUM:   'status-pill-amber opacity-90 font-medium',
    LOW:      'status-pill-emerald font-medium',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-sans capitalize ${map[level] || map.LOW}`}>
      {level?.toLowerCase()}
    </span>
  );
};

const TIResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const isMalicious = result.reputation === 'MALICIOUS';
  const isSuspicious = result.reputation === 'SUSPICIOUS';

  const typeIcons = {
    IP: Wifi, DOMAIN: Globe, URL: Globe, EMAIL: Mail, HASH: Hash,
  };
  const TypeIcon = typeIcons[result.ioc_type] || Shield;

  return (
    <div className={`soc-card overflow-hidden transition-all ${isMalicious ? 'border-rose-500/30' : isSuspicious ? 'border-amber-500/30' : ''}`}>
      <div className="px-4 py-3.5 flex items-center gap-3.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${isMalicious ? 'bg-rose-500/10 text-rose-400' : isSuspicious ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
          <TypeIcon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{result.ioc_type}</p>
          <p className="text-xs font-mono text-slate-200 break-all font-medium mt-0.5">{result.ioc_value}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <ReputationBadge reputation={result.reputation} />
          <SeverityBadge level={result.threat_severity} />
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800/80 pt-3.5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {result.virustotal_score && (
            <div className="bg-[#0c1019] rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">VirusTotal</p>
              <p className="text-sm font-bold font-mono text-rose-400">{result.virustotal_score}</p>
              <p className="text-[10px] text-slate-500">engines detected</p>
            </div>
          )}
          {result.abuseipdb_score !== null && result.abuseipdb_score !== undefined && (
            <div className="bg-[#0c1019] rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">AbuseIPDB</p>
              <p className="text-sm font-bold font-mono text-amber-400">{result.abuseipdb_score}%</p>
              <p className="text-[10px] text-slate-500">abuse confidence</p>
            </div>
          )}
          {result.otx_pulses !== null && (
            <div className="bg-[#0c1019] rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">OTX Pulses</p>
              <p className="text-sm font-bold font-mono text-purple-400">{result.otx_pulses}</p>
              <p className="text-[10px] text-slate-500">threat feeds</p>
            </div>
          )}
          {result.country && (
            <div className="bg-[#0c1019] rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Country Location</p>
              <p className="text-sm font-bold font-mono text-blue-400">{result.country}</p>
            </div>
          )}
          {result.malware_families?.length > 0 && (
            <div className="col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <p className="text-[10px] text-rose-400 font-medium uppercase tracking-wider mb-1.5">Malware Families</p>
              <div className="flex flex-wrap gap-1.5">
                {result.malware_families.map((f, i) => (
                  <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          )}
          {result.known_campaigns?.length > 0 && (
            <div className="col-span-2 md:col-span-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider mb-1.5">Known Attack Campaigns</p>
              <div className="flex flex-wrap gap-1.5">
                {result.known_campaigns.map((c, i) => (
                  <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 bg-amber-950/60 border border-amber-500/30 text-amber-300 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {result.tags?.length > 0 && (
            <div className="col-span-2 md:col-span-3">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">Threat Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t, i) => (
                  <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 bg-[#141b29] border border-slate-800 text-slate-400 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="col-span-2 md:col-span-3 text-[10px] text-slate-500 font-mono pt-1">
            Intelligence Source: {result.source} {result.last_seen ? `· Last seen: ${result.last_seen}` : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ThreatIntelPage() {
  const [iocType, setIocType] = useState('IP');
  const [iocValue, setIocValue] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalSummary, setGlobalSummary] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGlobalSummary = async () => {
    setGlobalLoading(true);
    try {
      const res = await threatIntelAPI.getGlobalSummary();
      setGlobalSummary(res.data);
    } catch { /* ignore */ }
    finally { setGlobalLoading(false); }
  };

  useEffect(() => { fetchGlobalSummary(); }, []);

  const handleLookup = async () => {
    if (!iocValue.trim()) return;
    setLoading(true);
    setError(null);
    setLookupResult(null);
    try {
      const res = await threatIntelAPI.lookupIOC(iocType, iocValue.trim());
      setLookupResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Lookup failed. Ensure backend is running.');
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLookup(); };

  const summary = globalSummary?.global_summary || {};

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Threat Intelligence Hub
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">TI Engine</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time IOC reputation lookup across VirusTotal, AbuseIPDB, AlienVault OTX, and MISP
            </p>
          </div>
        </div>

        <button
          onClick={fetchGlobalSummary}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#121724] border border-slate-800 rounded-xl text-xs text-slate-300 font-medium hover:bg-[#182033] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${globalLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* Global Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'IOCs Checked',    value: summary.total_iocs_checked || 0,  color: 'text-blue-400',   icon: Database },
            { label: 'Malicious IOCs',  value: summary.malicious_count || 0,     color: 'text-rose-400',   icon: XCircle },
            { label: 'Suspicious IOCs', value: summary.suspicious_count || 0,    color: 'text-amber-400',  icon: AlertTriangle },
            { label: 'Overall Severity',value: summary.overall_severity || 'LOW', color:
              summary.overall_severity === 'CRITICAL' ? 'text-rose-400' :
              summary.overall_severity === 'HIGH'     ? 'text-amber-400' :
              summary.overall_severity === 'MEDIUM'   ? 'text-amber-400' : 'text-emerald-400',
              icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="soc-card p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Malware Families & Campaigns */}
      {summary && (summary.unique_malware_families?.length > 0 || summary.known_attack_campaigns?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {summary.unique_malware_families?.length > 0 && (
            <div className="soc-card p-4 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-slate-200">Active Malware Families</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.unique_malware_families.map((f, i) => (
                  <span key={i} className="text-[11px] font-mono px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full font-medium">{f}</span>
                ))}
              </div>
            </div>
          )}
          {summary.known_attack_campaigns?.length > 0 && (
            <div className="soc-card p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">Known Attack Campaigns</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.known_attack_campaigns.map((c, i) => (
                  <span key={i} className="text-[11px] font-mono px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IOC Lookup Workbench */}
      <div className="soc-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold text-slate-200">IOC Threat Intelligence Lookup</h2>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            value={iocType}
            onChange={e => setIocType(e.target.value)}
            className="w-full sm:w-36 bg-[#0c1019] border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
          >
            {IOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            value={iocValue}
            onChange={e => setIocValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter ${iocType} value to query (e.g. ${iocType === 'IP' ? '185.220.101.5' : iocType === 'DOMAIN' ? 'evil.com' : iocType === 'EMAIL' ? 'attacker@evil.com' : iocType === 'HASH' ? 'sha256...' : 'https://...'})`}
            className="flex-1 bg-[#0c1019] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
          <button
            onClick={handleLookup}
            disabled={!iocValue.trim() || loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-medium rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-rose-500/20"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{loading ? 'Querying...' : 'Query Threat Feeds'}</span>
          </button>
        </div>

        {/* Quick Example Lookups */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium self-center">Try Example IOCs:</span>
          {[
            { type: 'IP', value: '185.220.101.5' },
            { type: 'DOMAIN', value: 'login.auth-secure-update.xyz' },
            { type: 'EMAIL', value: 'sec-alert@auth-update-microsoft.com' },
            { type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          ].map(({ type, value }) => (
            <button key={value}
              onClick={() => { setIocType(type); setIocValue(value); }}
              className="text-[11px] font-mono px-2.5 py-1 bg-[#0c1019] border border-slate-800 text-slate-300 rounded-full hover:text-blue-400 hover:border-blue-500/40 transition-colors truncate max-w-[220px]">
              {type}: {value.length > 25 ? value.slice(0, 25) + '...' : value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
          <XCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {lookupResult && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Lookup Result</h3>
          <TIResultCard result={lookupResult} />
        </div>
      )}

      {/* All Global IOC Results */}
      {globalSummary?.ioc_results?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            All Case IOCs ({globalSummary.ioc_results.length} detected across platform)
          </h3>
          <div className="space-y-3">
            {globalSummary.ioc_results
              .sort((a, b) => {
                const order = { MALICIOUS: 0, SUSPICIOUS: 1, UNKNOWN: 2, CLEAN: 3 };
                return (order[a.reputation] ?? 99) - (order[b.reputation] ?? 99);
              })
              .map((result, i) => <TIResultCard key={i} result={result} />)
            }
          </div>
        </div>
      )}

      {/* Empty state */}
      {!globalSummary && !globalLoading && (
        <div className="text-center py-16 soc-card">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No threat intelligence data logged yet</p>
          <p className="text-slate-500 text-xs mt-1">Upload forensic evidence in any module to populate IOC threat feeds</p>
        </div>
      )}
    </div>
  );
}
