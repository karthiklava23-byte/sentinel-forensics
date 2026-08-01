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
    MALICIOUS:  'bg-red-950/60 text-red-400 border-red-800/50',
    SUSPICIOUS: 'bg-orange-950/60 text-orange-400 border-orange-800/50',
    CLEAN:      'bg-green-950/60 text-green-400 border-green-800/50',
    UNKNOWN:    'bg-slate-800 text-slate-400 border-slate-700',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${map[reputation] || map.UNKNOWN}`}>
      {reputation}
    </span>
  );
};

const SeverityBadge = ({ level }) => {
  const map = {
    CRITICAL: 'bg-red-950/60 text-red-400 border-red-800/50',
    HIGH:     'bg-orange-950/60 text-orange-400 border-orange-800/50',
    MEDIUM:   'bg-yellow-950/60 text-yellow-400 border-yellow-800/50',
    LOW:      'bg-green-950/60 text-green-400 border-green-800/50',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${map[level] || map.LOW}`}>
      {level}
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
    <div className={`bg-slate-900/60 border rounded-xl overflow-hidden transition-all
      ${isMalicious ? 'border-red-800/50' : isSuspicious ? 'border-orange-800/40' : 'border-slate-800'}`}>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
          ${isMalicious ? 'bg-red-950/60' : isSuspicious ? 'bg-orange-950/60' : 'bg-slate-800'}`}>
          <TypeIcon className={`w-4 h-4 ${isMalicious ? 'text-red-400' : isSuspicious ? 'text-orange-400' : 'text-slate-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{result.ioc_type}</p>
          <p className="text-xs font-mono text-slate-200 break-all">{result.ioc_value}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ReputationBadge reputation={result.reputation} />
          <SeverityBadge level={result.threat_severity} />
          <button onClick={() => setExpanded(e => !e)} className="p-1 rounded text-slate-500 hover:text-white transition-colors">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          {result.virustotal_score && (
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">VirusTotal</p>
              <p className="text-sm font-bold font-mono text-red-400">{result.virustotal_score}</p>
              <p className="text-[9px] text-slate-500 font-mono">engines detected</p>
            </div>
          )}
          {result.abuseipdb_score !== null && result.abuseipdb_score !== undefined && (
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">AbuseIPDB</p>
              <p className="text-sm font-bold font-mono text-orange-400">{result.abuseipdb_score}%</p>
              <p className="text-[9px] text-slate-500 font-mono">abuse confidence</p>
            </div>
          )}
          {result.otx_pulses !== null && (
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">OTX Pulses</p>
              <p className="text-sm font-bold font-mono text-purple-400">{result.otx_pulses}</p>
              <p className="text-[9px] text-slate-500 font-mono">threat feeds</p>
            </div>
          )}
          {result.country && (
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">Country</p>
              <p className="text-sm font-bold font-mono text-cyan-400">{result.country}</p>
            </div>
          )}
          {result.malware_families?.length > 0 && (
            <div className="col-span-2 bg-red-950/20 border border-red-900/30 rounded-lg p-3">
              <p className="text-[9px] text-red-400 font-mono uppercase tracking-wider mb-1">Malware Families</p>
              <div className="flex flex-wrap gap-1">
                {result.malware_families.map((f, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-red-950/60 border border-red-800/40 text-red-300 rounded">{f}</span>
                ))}
              </div>
            </div>
          )}
          {result.known_campaigns?.length > 0 && (
            <div className="col-span-2 md:col-span-3 bg-orange-950/20 border border-orange-900/30 rounded-lg p-3">
              <p className="text-[9px] text-orange-400 font-mono uppercase tracking-wider mb-1">Known Attack Campaigns</p>
              <div className="flex flex-wrap gap-1">
                {result.known_campaigns.map((c, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-orange-950/60 border border-orange-800/40 text-orange-300 rounded">{c}</span>
                ))}
              </div>
            </div>
          )}
          {result.tags?.length > 0 && (
            <div className="col-span-2 md:col-span-3">
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1">
                {result.tags.map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="col-span-2 md:col-span-3 text-[9px] text-slate-600 font-mono pt-1">
            Source: {result.source} {result.last_seen ? `· Last seen: ${result.last_seen}` : ''}
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-mono">Threat Intelligence</h1>
          <p className="text-sm text-slate-400 font-mono mt-0.5">
            Real-time IOC reputation lookup — VirusTotal · AbuseIPDB · AlienVault OTX · MISP
          </p>
        </div>
        <button
          onClick={fetchGlobalSummary}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${globalLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Global Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'IOCs Checked',    value: summary.total_iocs_checked || 0,  color: 'text-cyan-400',   icon: Database },
            { label: 'Malicious IOCs',  value: summary.malicious_count || 0,     color: 'text-red-400',    icon: XCircle },
            { label: 'Suspicious IOCs', value: summary.suspicious_count || 0,    color: 'text-orange-400', icon: AlertTriangle },
            { label: 'Overall Severity',value: summary.overall_severity || 'LOW', color:
              summary.overall_severity === 'CRITICAL' ? 'text-red-400' :
              summary.overall_severity === 'HIGH'     ? 'text-orange-400' :
              summary.overall_severity === 'MEDIUM'   ? 'text-yellow-400' : 'text-green-400',
              icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active Malware Families & Campaigns */}
      {summary && (summary.unique_malware_families?.length > 0 || summary.known_attack_campaigns?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.unique_malware_families?.length > 0 && (
            <div className="bg-slate-900/60 border border-red-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-4 h-4 text-red-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">Active Malware Families</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.unique_malware_families.map((f, i) => (
                  <span key={i} className="text-[10px] font-mono px-3 py-1.5 bg-red-950/40 border border-red-800/40 text-red-300 rounded-lg">{f}</span>
                ))}
              </div>
            </div>
          )}
          {summary.known_attack_campaigns?.length > 0 && (
            <div className="bg-slate-900/60 border border-orange-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">Known Attack Campaigns</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.known_attack_campaigns.map((c, i) => (
                  <span key={i} className="text-[10px] font-mono px-3 py-1.5 bg-orange-950/40 border border-orange-800/40 text-orange-300 rounded-lg">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* IOC Lookup */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white font-mono">IOC Threat Intelligence Lookup</h2>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            value={iocType}
            onChange={e => setIocType(e.target.value)}
            className="w-full sm:w-36 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-600/60"
          >
            {IOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            value={iocValue}
            onChange={e => setIocValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter ${iocType} to query (e.g. ${iocType === 'IP' ? '185.220.101.5' : iocType === 'DOMAIN' ? 'evil.com' : iocType === 'EMAIL' ? 'attacker@evil.com' : iocType === 'HASH' ? 'sha256...' : 'https://...'})`}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-600/60 focus:ring-1 focus:ring-emerald-600/30"
          />
          <button
            onClick={handleLookup}
            disabled={!iocValue.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-mono font-semibold rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {loading ? 'Querying...' : 'Lookup'}
          </button>
        </div>

        {/* Quick Example Lookups */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider self-center">Try:</span>
          {[
            { type: 'IP', value: '185.220.101.5' },
            { type: 'DOMAIN', value: 'login.auth-secure-update.xyz' },
            { type: 'EMAIL', value: 'sec-alert@auth-update-microsoft.com' },
            { type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
          ].map(({ type, value }) => (
            <button key={value}
              onClick={() => { setIocType(type); setIocValue(value); }}
              className="text-[10px] font-mono px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded hover:text-emerald-400 hover:border-emerald-700/50 transition-colors truncate max-w-[200px]">
              {type}: {value.length > 30 ? value.slice(0, 30) + '...' : value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-800/50 rounded-xl">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm font-mono">{error}</p>
        </div>
      )}

      {lookupResult && (
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Lookup Result</h3>
          <TIResultCard result={lookupResult} />
        </div>
      )}

      {/* All Global IOC Results */}
      {globalSummary?.ioc_results?.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            All Case IOCs ({globalSummary.ioc_results.length} detected)
          </h3>
          <div className="space-y-2">
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
        <div className="text-center py-16">
          <ShieldCheck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-mono text-sm">No threat intelligence data available yet</p>
          <p className="text-slate-600 font-mono text-xs mt-2">Upload forensic evidence to auto-populate IOC threat feeds</p>
        </div>
      )}
    </div>
  );
}
