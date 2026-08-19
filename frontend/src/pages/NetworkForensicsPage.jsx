import React, { useState } from 'react';
import { Network, Upload, ShieldAlert, Cpu, Activity, Server, FileText, AlertTriangle } from 'lucide-react';
import { evidenceAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';

const NetworkForensicsPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a .PCAP packet capture file');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await evidenceAPI.analyzePcap(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze PCAP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 font-mono">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Network className="w-6 h-6 text-purple-400" />
          NETWORK PCAP FORENSICS & PACKET INSPECTOR
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Extract network protocol statistics, top source/destination talkers, DNS queries, HTTP payloads, and detect C2 beaconing & port scan attacks.
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
            <div className="flex-1 w-full">
              <label className="block text-slate-400 mb-1">UPLOAD PACKET CAPTURE (.PCAP / .PCAPNG)</label>
              <input
                type="file"
                accept=".pcap,.pcapng,.cap,.log"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-950 file:text-purple-400"
              />
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-5">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-black font-bold rounded shadow-neon-purple transition-all"
              >
                {loading ? 'ANALYZING PACKETS...' : 'PARSE & ANALYZE PCAP'}
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
              <span className="text-[10px] text-slate-500 uppercase">CAPTURE FILE: {result.filename}</span>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                Processed {result.total_packets} Packets across {result.duration_seconds}s
              </h2>
            </div>
            <ThreatBadge level={result.threat_level} />
          </div>

          {/* Protocol Distribution */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase">NETWORK PROTOCOL BREAKDOWN</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(result.protocols).map(([proto, count]) => (
                <div key={proto} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase">{proto}</span>
                  <p className="text-base font-bold text-cyan-400 mt-0.5">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Talkers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase mb-2">TOP SOURCE TALKERS (IP)</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                {result.top_source_ips.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-cyan-400 font-bold">{item.ip}</span>
                    <span className="text-slate-400">{item.count} packets</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase mb-2">TOP DESTINATION TALKERS (IP)</h4>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                {result.top_dest_ips.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-rose-400 font-bold">{item.ip}</span>
                    <span className="text-slate-400">{item.count} packets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Captured HTTP Requests */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center justify-between">
              <span>CAPTURED HTTP REQUESTS ({result.http_requests?.length || 0})</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">Extracted from TCP Packets</span>
            </h4>
            {(!result.http_requests || result.http_requests.length === 0) ? (
              <div className="p-4 bg-[#0a0d13] border border-[#1e2638] rounded-lg text-slate-500 text-center text-xs">
                No HTTP web requests detected in this packet capture stream.
              </div>
            ) : (
              <div className="p-3 bg-[#0a0d13] border border-[#1e2638] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2638] text-slate-400 font-mono text-[10px]">
                      <th className="py-2 px-2">METHOD</th>
                      <th className="py-2 px-2">TARGET URL</th>
                      <th className="py-2 px-2">SOURCE IP</th>
                      <th className="py-2 px-2">USER AGENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.http_requests.map((req, idx) => (
                      <tr key={idx} className="border-b border-[#1e2638]/50 last:border-0 hover:bg-[#121721]">
                        <td className="py-2 px-2 font-mono font-bold text-blue-400">{req.method}</td>
                        <td className="py-2 px-2 font-mono text-slate-200 truncate max-w-xs">{req.url}</td>
                        <td className="py-2 px-2 font-mono text-slate-400">{req.source_ip}</td>
                        <td className="py-2 px-2 font-mono text-slate-500 truncate max-w-xs">{req.user_agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Captured DNS Queries */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center justify-between">
              <span>RESOLVED DNS QUERIES ({result.dns_queries?.length || 0})</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">Extracted UDP Port 53 QNAMEs</span>
            </h4>
            {(!result.dns_queries || result.dns_queries.length === 0) ? (
              <div className="p-4 bg-[#0a0d13] border border-[#1e2638] rounded-lg text-slate-500 text-center text-xs">
                No DNS queries detected in this packet capture stream.
              </div>
            ) : (
              <div className="p-3 bg-[#0a0d13] border border-[#1e2638] rounded-lg flex flex-wrap gap-2">
                {result.dns_queries.map((domain, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-[#161c28] border border-[#222b3e] text-slate-300 font-mono text-xs">
                    {domain}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attack Patterns Detected */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              DETECTED ATTACK PATTERNS ({result.suspicious_activities.length})
            </h4>

            {result.suspicious_activities.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs">
                Clean Packet Capture: No malicious attack signatures, C2 beaconing, or unauthorized port scans detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.suspicious_activities.map((act, idx) => (
                  <div key={idx} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">{act.type}</span>
                      <ThreatBadge level={act.severity} />
                    </div>
                    <p className="text-slate-300 text-xs">{act.details}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      SOURCE: <span className="text-blue-400">{act.source_ip}</span> &rarr; TARGET: <span className="text-rose-300">{act.target_ip}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkForensicsPage;
