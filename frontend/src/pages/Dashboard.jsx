import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  ShieldAlert,
  FileText,
  Cpu,
  Plus,
  Mail,
  Globe,
  Network,
  Activity,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Bug,
  ShieldCheck,
  Sparkles,
  XCircle,
  Hash
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { analyticsAPI, adminAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';
import CaseModal from '../components/CaseModal';
import GeminiChatModal from '../components/GeminiChatModal';
import { MessageSquare, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsAPI.getDashboardMetrics();
      setData(res.data);
      // Fetch audit logs separately — admin only
      if (user?.role === 'admin') {
        try {
          const logsRes = await adminAPI.getLogs();
          setAdminLogs(logsRes.data || []);
        } catch (_) { /* non-admin: silently skip */ }
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 font-mono text-cyan-400 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 animate-spin text-cyan-400" />
          <span>LOADING TELEMETRY DASHBOARD...</span>
        </div>
      </div>
    );
  }

  const { metrics, threat_distribution, evidence_type_breakdown, recent_cases, malware_stats, threat_intel_stats } = data;

  const pieData = [
    { name: 'CRITICAL', value: threat_distribution.CRITICAL, color: '#ff2a6d' },
    { name: 'HIGH', value: threat_distribution.HIGH, color: '#f59e0b' },
    { name: 'MEDIUM', value: threat_distribution.MEDIUM, color: '#eab308' },
    { name: 'LOW', value: threat_distribution.LOW, color: '#10b981' },
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Email',   count: evidence_type_breakdown.EMAIL   || 0 },
    { name: 'URL',     count: evidence_type_breakdown.URL     || 0 },
    { name: 'PCAP',    count: evidence_type_breakdown.PCAP    || 0 },
    { name: 'Malware', count: evidence_type_breakdown.MALWARE || 0 },
    { name: 'Log',     count: evidence_type_breakdown.LOG     || 0 },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
            CYBER INCIDENT COMMAND CENTER
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Real-time Threat Correlation, Evidence Processing & Forensic Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-cyber-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            NEW INVESTIGATION CASE
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">ACTIVE CASES</p>
            <h3 className="text-2xl font-mono font-bold text-slate-100 mt-1">{metrics.open_cases}</h3>
            <p className="text-[11px] font-mono text-cyan-400 mt-1">Out of {metrics.total_cases} Total Cases</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">CRITICAL THREATS</p>
            <h3 className="text-2xl font-mono font-bold text-rose-400 mt-1">{metrics.critical_cases}</h3>
            <p className="text-[11px] font-mono text-rose-400/80 mt-1">High Severity Incidents</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-neon-red">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">EVIDENCE ARTIFACTS</p>
            <h3 className="text-2xl font-mono font-bold text-slate-100 mt-1">{metrics.total_evidence_artifacts}</h3>
            <p className="text-[11px] font-mono text-emerald-400 mt-1">Parsed & Analyzed</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">AI ENGINE CORRELATION</p>
            <h3 className="text-2xl font-mono font-bold text-purple-400 mt-1">{metrics.ai_correlation_jobs}</h3>
            <p className="text-[11px] font-mono text-purple-400/80 mt-1">Timeline Models Built</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-neon-purple">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Malware Forensics KPI */}
        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">MALWARE SAMPLES</p>
            <h3 className="text-2xl font-mono font-bold text-orange-400 mt-1">{metrics.malware_samples_analyzed || 0}</h3>
            <p className="text-[11px] font-mono text-orange-400/80 mt-1">{malware_stats?.high_risk_count || 0} High-Risk Detected</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Bug className="w-6 h-6" />
          </div>
        </div>

        {/* Threat Intelligence KPI */}
        <div className="cyber-card p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">MALICIOUS IOCs</p>
            <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-1">{metrics.malicious_iocs_flagged || 0}</h3>
            <p className="text-[11px] font-mono text-emerald-400/80 mt-1">{metrics.threat_intel_queries || 0} Total Queried</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Malware & Threat Intel Stats Row */}
      {(malware_stats || threat_intel_stats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
          {/* Malware Stats */}
          <div className="cyber-card p-5 rounded-xl border border-orange-900/30">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-bold text-slate-200">MALWARE FORENSICS STATISTICS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Samples Analyzed',   value: malware_stats?.total_samples_analyzed || 0,   color: 'text-orange-400' },
                { label: 'High Risk Binaries', value: malware_stats?.high_risk_count || 0,           color: 'text-red-400' },
                { label: 'Avg Entropy',        value: malware_stats?.avg_entropy || '0.00',           color: 'text-yellow-400' },
                { label: 'Packed Samples',     value: malware_stats?.packed_samples || 0,            color: 'text-orange-400' },
                { label: 'Flagged API Calls',  value: malware_stats?.total_flagged_api_calls || 0,  color: 'text-red-400' },
                { label: 'Critical Malware',   value: malware_stats?.critical_malware || 0,          color: 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold font-mono mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            {malware_stats?.detected_malware_families?.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Detected Families</p>
                <div className="flex flex-wrap gap-1.5">
                  {malware_stats.detected_malware_families.map((f, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-red-950/40 border border-red-800/40 text-red-300 rounded">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Threat Intel Stats */}
          <div className="cyber-card p-5 rounded-xl border border-emerald-900/30">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200">THREAT INTELLIGENCE STATISTICS</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'IOCs Queried',     value: threat_intel_stats?.total_iocs_queried  || 0,  color: 'text-cyan-400' },
                { label: 'Malicious IOCs',   value: threat_intel_stats?.malicious_ioc_count || 0,  color: 'text-red-400' },
                { label: 'Suspicious IOCs',  value: threat_intel_stats?.suspicious_ioc_count || 0, color: 'text-orange-400' },
                { label: 'Clean IOCs',       value: threat_intel_stats?.clean_ioc_count     || 0,  color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold font-mono mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            {threat_intel_stats?.active_attack_campaigns?.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Active Campaigns</p>
                <div className="flex flex-wrap gap-1.5">
                  {threat_intel_stats.active_attack_campaigns.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 bg-orange-950/40 border border-orange-800/40 text-orange-300 rounded">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forensic Workbenches Quick Launch Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div 
          onClick={() => navigate('/email-forensics')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Email Forensics Workbench</h4>
              <p className="text-[11px] text-slate-400">Inspect .EML headers & SPF/DKIM</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
        </div>

        <div 
          onClick={() => navigate('/url-forensics')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">URL Threat Scanner</h4>
              <p className="text-[11px] text-slate-400">Analyze domain age & WHOIS risk</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
        </div>

        <div
          onClick={() => navigate('/network-forensics')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-all">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Network PCAP Parser</h4>
              <p className="text-[11px] text-slate-400">Analyze packets & C2 beaconing</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
        </div>

        <div
          onClick={() => navigate('/malware-forensics')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-orange-500/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Malware Forensics</h4>
              <p className="text-[11px] text-slate-400">Binary analysis & risk scoring</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
        </div>

        <div
          onClick={() => navigate('/threat-intelligence')}
          className="cyber-card p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Threat Intelligence</h4>
              <p className="text-[11px] text-slate-400">IOC lookup · VT · AbuseIPDB · OTX</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Threat Severity Distribution */}
        <div className="cyber-card p-5 rounded-xl border border-slate-800 font-mono">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            THREAT SEVERITY DISTRIBUTION
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Forensic Evidence Distribution */}
        <div className="cyber-card p-5 rounded-xl border border-slate-800 font-mono">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            PARSED EVIDENCE ARTIFACT TYPES
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Investigations Quick List & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Active Cases (2 cols) */}
        <div className="lg:col-span-2 cyber-card p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              RECENT ACTIVE INVESTIGATIONS
            </h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-cyan-400 hover:underline text-xs flex items-center gap-1"
            >
              VIEW ALL CASES ({metrics.total_cases})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">CASE ID</th>
                  <th className="py-2.5 px-3">TITLE / INCIDENT</th>
                  <th className="py-2.5 px-3">THREAT LEVEL</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recent_cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-bold">{c.case_number}</td>
                    <td className="py-3 px-3 text-slate-200 max-w-xs truncate">{c.title}</td>
                    <td className="py-3 px-3">
                      <ThreatBadge level={c.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[10px]">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 text-[11px]"
                      >
                        INVESTIGATE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Stream — ADMIN ONLY */}
        {isAdmin && (
          <div className="cyber-card p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              FORENSIC AUDIT LOGS
              <span className="ml-auto text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-700/50 text-amber-400 rounded font-mono">ADMIN ONLY</span>
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {adminLogs.slice(0, 10).map((log, idx) => (
                <div key={log.id || idx} className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="text-cyan-400 font-semibold">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{log.details}</p>
                  <p className="text-[9px] text-slate-500 mt-1">BY: {log.user_email}</p>
                </div>
              ))}
              {adminLogs.length === 0 && (
                <p className="text-slate-600 text-[11px]">No audit log entries yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onCaseCreated={(newCase) => {
          fetchDashboard();
          navigate(`/cases/${newCase.id}`);
        }}
      />
    </div>
  );
};

export default Dashboard;
