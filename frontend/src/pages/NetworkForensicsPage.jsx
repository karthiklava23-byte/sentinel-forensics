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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-md shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-serif-heading tracking-tight flex items-center gap-2">
              Network PCAP Forensics & Packet Inspector
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-medium font-sans">PCAP Engine</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Protocol statistics, top talkers, DNS QNAME queries, HTTP payloads, and C2 beaconing detection
            </p>
          </div>
        </div>
      </div>

      {/* Input Workbench */}
      <div className="soc-card p-6 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">Upload Packet Capture (.PCAP / .PCAPNG)</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-6 bg-slate-50 text-center transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".pcap,.pcapng,.cap,.log"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-900">
                    {file ? file.name : 'Click to select or drag & drop a packet capture file'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {file ? `File size: ${(file.size / 1024).toFixed(1)} KB` : 'Supports standard Wireshark .PCAP and .PCAPNG packet traces'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-xl transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Analyzing Packets...</span>
                </>
              ) : (
                <span>Parse & Analyze PCAP</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Workbench */}
      {result && (
        <div className="soc-card p-6 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[11px] text-slate-400 font-mono">Capture Artifact: {result.filename}</span>
              <h2 className="text-base font-bold text-slate-100 mt-1">
                Processed {result.total_packets} Packets across {result.duration_seconds}s
              </h2>
            </div>
            <ThreatBadge level={result.threat_level} />
          </div>

          {/* Protocol Distribution */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-semibold text-slate-300">Network Protocol Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(result.protocols).map(([proto, count]) => (
                <div key={proto} className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{proto}</span>
                  <p className="text-base font-bold font-mono text-purple-400 mt-0.5">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Talkers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Top Source Talkers (IP)</h4>
              <div className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                {result.top_source_ips.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-blue-400 font-semibold">{item.ip}</span>
                    <span className="text-slate-400 font-sans">{item.count} packets</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Top Destination Talkers (IP)</h4>
              <div className="p-3.5 bg-[#0c1019] border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                {result.top_dest_ips.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-rose-400 font-semibold">{item.ip}</span>
                    <span className="text-slate-400 font-sans">{item.count} packets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Captured HTTP Requests */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Captured HTTP Requests ({result.http_requests?.length || 0})</span>
              <span className="text-[11px] text-slate-500 font-normal">Extracted from TCP Stream</span>
            </h4>
            {(!result.http_requests || result.http_requests.length === 0) ? (
              <div className="p-4 bg-[#0c1019] border border-slate-800 rounded-xl text-slate-500 text-center text-xs">
                No HTTP web requests detected in this packet stream.
              </div>
            ) : (
              <div className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl overflow-x-auto font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-sans uppercase">
                      <th className="py-2 px-2">Method</th>
                      <th className="py-2 px-2">Target URL</th>
                      <th className="py-2 px-2">Source IP</th>
                      <th className="py-2 px-2">User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.http_requests.map((req, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 last:border-0 hover:bg-[#151c2c]">
                        <td className="py-2 px-2 font-bold text-blue-400">{req.method}</td>
                        <td className="py-2 px-2 text-slate-200 truncate max-w-xs">{req.url}</td>
                        <td className="py-2 px-2 text-slate-400">{req.source_ip}</td>
                        <td className="py-2 px-2 text-slate-500 truncate max-w-xs">{req.user_agent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Captured DNS Queries */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Resolved DNS Queries ({result.dns_queries?.length || 0})</span>
              <span className="text-[11px] text-slate-500 font-normal">Extracted UDP Port 53 QNAMEs</span>
            </h4>
            {(!result.dns_queries || result.dns_queries.length === 0) ? (
              <div className="p-4 bg-[#0c1019] border border-slate-800 rounded-xl text-slate-500 text-center text-xs">
                No DNS queries detected in this packet capture stream.
              </div>
            ) : (
              <div className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl flex flex-wrap gap-2 font-mono text-[11px]">
                {result.dns_queries.map((domain, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#141b29] border border-slate-800 text-slate-300">
                    {domain}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attack Patterns Detected */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Detected Attack Signatures & C2 Alerts ({result.suspicious_activities.length})
            </h4>

            {result.suspicious_activities.length === 0 ? (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                Clean Packet Capture: No malicious attack signatures, C2 beaconing, or unauthorized port scans detected.
              </div>
            ) : (
              <div className="space-y-2">
                {result.suspicious_activities.map((act, idx) => (
                  <div key={idx} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-semibold">{act.type}</span>
                      <ThreatBadge level={act.severity} />
                    </div>
                    <p className="text-slate-300 text-xs">{act.details}</p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Source: <span className="text-blue-400 font-semibold">{act.source_ip}</span> &rarr; Target: <span className="text-rose-300 font-semibold">{act.target_ip}</span>
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
