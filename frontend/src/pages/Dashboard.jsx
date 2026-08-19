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
  Hash,
  Crosshair,
  LayoutDashboard
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { analyticsAPI, adminAPI } from '../services/api';
import ThreatBadge from '../components/ThreatBadge';
import CaseModal from '../components/CaseModal';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState(null);
  const [adminLogs, setAdminLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard(user);
  }, [user]);

  const fetchDashboard = async (currentUser) => {
    try {
      const res = await analyticsAPI.getDashboardMetrics();
      setData(res.data);
      // Fetch audit logs separately — admin only
      if (currentUser?.role === 'admin') {
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
      <div className="p-12 text-slate-400 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 animate-pulse">
          <Activity className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Loading Telemetry & Incident Data...</p>
      </div>
    );
  }

  const { metrics = {}, threat_distribution = {}, evidence_type_breakdown = {}, recent_cases = [], recent_scans = [], malware_stats = {}, threat_intel_stats = {}, is_admin_view } = data || {};

  const pieData = [
    { name: 'Critical', value: threat_distribution.CRITICAL, color: '#f43f5e' },
    { name: 'High',     value: threat_distribution.HIGH,     color: '#f59e0b' },
    { name: 'Medium',   value: threat_distribution.MEDIUM,   color: '#eab308' },
    { name: 'Low',      value: threat_distribution.LOW,      color: '#10b981' },
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

      {/* Identity Banner */}
      {!is_admin_view && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#111726] border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">{user?.full_name || user?.email}</p>
              <p className="text-[11px] text-slate-400">Operator Dashboard — assigned cases & forensic scan telemetry</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-medium capitalize">{user?.role || 'Operator'}</span>
        </div>
      )}
      {is_admin_view && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-300">Global Administrative View</p>
              <p className="text-[11px] text-slate-400">Aggregated multi-user telemetry and system-wide incident metrics</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-xs font-medium px-3 py-1.5 bg-[#18202e] border border-slate-700 text-amber-400 rounded-xl hover:bg-[#202b3d] transition-all"
          >
            Manage User Roles &rarr;
          </button>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            Security Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Threat Analytics, Forensic Artifact Processing & Incident Response Telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'analyst' ? (
            <button
              onClick={() => navigate('/analyst')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Crosshair className="w-4 h-4" />
              Open Analyst Workspace
            </button>
          ) : (
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Case / Incident
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ACTIVE CASES</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{metrics.open_cases}</h3>
            <p className="text-[11px] text-blue-400 mt-0.5">{metrics.total_cases} Total Recorded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CRITICAL THREATS</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{metrics.critical_cases}</h3>
            <p className="text-[11px] text-rose-400/80 mt-0.5">High Severity</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ARTIFACTS</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{metrics.total_evidence_artifacts}</h3>
            <p className="text-[11px] text-emerald-400 mt-0.5">Parsed & Analyzed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI CORRELATIONS</p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">{metrics.ai_correlation_jobs}</h3>
            <p className="text-[11px] text-purple-400/80 mt-0.5">Synthesized</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MALWARE SAMPLES</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{metrics.malware_samples_analyzed || 0}</h3>
            <p className="text-[11px] text-amber-400/80 mt-0.5">{malware_stats?.high_risk_count || 0} High Risk</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bug className="w-5 h-5" />
          </div>
        </div>

        <div className="soc-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MALICIOUS IOCS</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{metrics.malicious_iocs_flagged || 0}</h3>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">{metrics.threat_intel_queries || 0} Queried</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Forensic Engines Quick Launch Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => navigate('/email-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Email Forensics</h4>
              <p className="text-[11px] text-slate-400">SPF/DKIM & EML analysis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/url-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">URL Threat Analysis</h4>
              <p className="text-[11px] text-slate-400">Domain WHOIS risk score</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>

        <div
          onClick={() => navigate('/network-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Network PCAP Parser</h4>
              <p className="text-[11px] text-slate-400">Packet C2 beaconing</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
        </div>

        <div
          onClick={() => navigate('/malware-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Malware Forensics</h4>
              <p className="text-[11px] text-slate-400">Binary static analysis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </div>

        <div
          onClick={() => navigate('/threat-intelligence')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Threat Intelligence</h4>
              <p className="text-[11px] text-slate-400">VT, OTX & AbuseIPDB</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Threat Severity Distribution */}
        <div className="soc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Threat Severity Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-medium">{item.name}: <span className="font-bold">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Forensic Evidence Distribution */}
        <div className="soc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Parsed Evidence Artifact Types
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incidents Table & Scan Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Recent Cases Section */}
        <div className="lg:col-span-2 soc-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              Recent Incidents & Cases
            </h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 font-medium transition-colors"
            >
              View All Cases ({metrics.total_cases}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Title / Incident</th>
                  <th className="py-2.5 px-3">Threat Level</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recent_cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#161e31] transition-colors">
                    <td className="py-3 px-3 text-blue-400 font-mono font-semibold">{c.case_number}</td>
                    <td className="py-3 px-3 text-slate-200 max-w-xs truncate font-medium">{c.title}</td>
                    <td className="py-3 px-3">
                      <ThreatBadge level={c.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#182133] border border-slate-700 text-slate-300 text-[10px] font-medium capitalize">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="px-3 py-1 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 text-xs font-medium transition-all"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
                {recent_cases.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">No active cases recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scan Log Stream */}
        <div className="soc-card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              {is_admin_view ? 'Platform Scans' : 'My Recent Scans'}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 bg-[#182133] border border-slate-700 text-slate-300 rounded-full font-medium">
              {(recent_scans || []).length} items
            </span>
          </h3>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {(recent_scans || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-xs">No scan history recorded.</p>
                <p className="text-slate-600 text-[11px] mt-1">Use any forensic engine above to run a scan.</p>
              </div>
            ) : (recent_scans || []).map((scan, idx) => {
              const typeColors = { URL: 'text-blue-400 bg-blue-500/10 border-blue-500/20', EMAIL: 'text-purple-400 bg-purple-500/10 border-purple-500/20', MALWARE: 'text-rose-400 bg-rose-500/10 border-rose-500/20', PCAP: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
              const riskColor = scan.risk_score >= 75 ? 'text-rose-400' : scan.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400';
              return (
                <div key={scan.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#151c2c] border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${typeColors[scan.scan_type] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                      {scan.scan_type}
                    </span>
                    <span className="text-slate-200 truncate font-mono text-[11px]">{scan.target}</span>
                  </div>
                  <span className={`shrink-0 font-bold font-mono ${riskColor}`}>{scan.risk_score}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onCaseCreated={(newCase) => {
          fetchDashboard(user);
          navigate(`/cases/${newCase.id}`);
        }}
      />
    </div>
  );
};

export default Dashboard;
