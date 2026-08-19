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
      <div className="p-12 text-slate-500 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0F172A]/10 border border-[#0F172A]/20 flex items-center justify-center text-[#0F172A] animate-pulse">
          <Activity className="w-6 h-6 animate-spin text-[#0F172A]" />
        </div>
        <p className="text-sm font-semibold text-slate-700 font-sans">Loading Telemetry & Incident Data...</p>
      </div>
    );
  }

  const { metrics = {}, threat_distribution = {}, evidence_type_breakdown = {}, recent_cases = [], recent_scans = [], malware_stats = {}, threat_intel_stats = {}, is_admin_view } = data || {};

  const pieData = [
    { name: 'Critical', value: threat_distribution.CRITICAL, color: '#7F1D1D' },
    { name: 'High',     value: threat_distribution.HIGH,     color: '#C2410C' },
    { name: 'Medium',   value: threat_distribution.MEDIUM,   color: '#D97706' },
    { name: 'Low',      value: threat_distribution.LOW,      color: '#064E3B' },
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
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{user?.full_name || user?.email}</p>
              <p className="text-[11px] text-slate-500">Operator Dashboard — assigned cases & forensic scan telemetry</p>
            </div>
          </div>
          <span className="text-xs px-3 py-0.5 bg-[#0F172A]/10 border border-[#0F172A]/20 text-[#0F172A] rounded-full font-bold capitalize">{user?.role || 'Operator'}</span>
        </div>
      )}
      {is_admin_view && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#7F1D1D] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#7F1D1D]">Global Administrative View</p>
              <p className="text-[11px] text-slate-600">Aggregated multi-user telemetry and system-wide incident metrics</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-xs font-semibold px-3.5 py-1.5 bg-white border border-slate-300 text-[#0F172A] rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Manage User Roles &rarr;
          </button>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-serif-heading font-bold text-[#0F172A] flex items-center gap-2.5 tracking-tight">
            <LayoutDashboard className="w-6 h-6 text-[#0F172A]" />
            Digital Forensics Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Real-Time Telemetry &bull; Chain of Custody Audits &bull; Multi-Engine Forensic Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'analyst' ? (
            <button
              onClick={() => navigate('/analyst')}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
              Open Analyst Workspace
            </button>
          ) : (
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              New Case / Incident
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">ACTIVE CASES</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#0F172A] mt-1">{metrics.open_cases}</h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">{metrics.total_cases} Total Recorded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 border border-[#0F172A]/20 flex items-center justify-center text-[#0F172A]">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </div>

        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">CRITICAL THREATS</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#7F1D1D] mt-1">{metrics.critical_cases}</h3>
            <p className="text-[11px] text-[#7F1D1D] font-bold font-sans mt-0.5">High Severity</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center text-[#7F1D1D]">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">ARTIFACTS</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#0F172A] mt-1">{metrics.total_evidence_artifacts}</h3>
            <p className="text-[11px] text-[#064E3B] font-bold font-sans mt-0.5">Parsed & Analyzed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">AI CORRELATIONS</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#0F172A] mt-1">{metrics.ai_correlation_jobs}</h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">Synthesized</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 border border-[#0F172A]/20 flex items-center justify-center text-[#0F172A]">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">MALWARE SAMPLES</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#7F1D1D] mt-1">{metrics.malware_samples_analyzed || 0}</h3>
            <p className="text-[11px] text-[#7F1D1D] font-bold font-sans mt-0.5">{malware_stats?.high_risk_count || 0} High Risk</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center text-[#7F1D1D]">
            <Bug className="w-5 h-5" />
          </div>
        </div>

        <div className="corporate-card p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">MALICIOUS IOCS</p>
            <h3 className="text-2xl font-bold font-serif-heading text-[#064E3B] mt-1">{metrics.malicious_iocs_flagged || 0}</h3>
            <p className="text-[11px] text-[#064E3B] font-bold font-sans mt-0.5">{metrics.threat_intel_queries || 0} Queried</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 flex items-center justify-center text-[#064E3B]">
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
            <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 text-[#0F172A] flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-serif-heading">Email Forensics</h4>
              <p className="text-[11px] text-slate-500">SPF/DKIM & EML analysis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/url-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center group-hover:bg-[#064E3B] group-hover:text-white transition-all">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-serif-heading">URL Threat Analysis</h4>
              <p className="text-[11px] text-slate-500">Domain WHOIS risk score</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] transition-colors" />
        </div>

        <div
          onClick={() => navigate('/network-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A]/10 text-[#0F172A] flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-serif-heading">Network PCAP Parser</h4>
              <p className="text-[11px] text-slate-500">Packet C2 beaconing</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
        </div>

        <div
          onClick={() => navigate('/malware-forensics')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/10 text-[#7F1D1D] flex items-center justify-center group-hover:bg-[#7F1D1D] group-hover:text-white transition-all">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-serif-heading">Malware Forensics</h4>
              <p className="text-[11px] text-slate-500">Binary static analysis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D] transition-colors" />
        </div>

        <div
          onClick={() => navigate('/threat-intelligence')}
          className="soc-card-interactive p-4 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/10 text-[#7F1D1D] flex items-center justify-center group-hover:bg-[#7F1D1D] group-hover:text-white transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-serif-heading">Threat Intelligence</h4>
              <p className="text-[11px] text-slate-500">VT, OTX & AbuseIPDB</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7F1D1D] transition-colors" />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Threat Severity Distribution */}
        <div className="corporate-card p-5">
          <h3 className="text-base font-serif-heading font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#7F1D1D]" />
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-700 font-semibold">{item.name}: <span className="font-bold">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Forensic Evidence Distribution */}
        <div className="corporate-card p-5">
          <h3 className="text-base font-serif-heading font-bold text-[#0F172A] mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0F172A]" />
            Parsed Evidence Artifact Types
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#0F172A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incidents Table & Scan Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Recent Cases Section */}
        <div className="lg:col-span-2 corporate-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-serif-heading font-bold text-[#0F172A] flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#0F172A]" />
              Recent Incidents & Cases
            </h3>
            <button
              onClick={() => navigate('/cases')}
              className="text-[#0F172A] hover:text-[#7F1D1D] text-xs flex items-center gap-1 font-semibold transition-colors"
            >
              View All Cases ({metrics.total_cases}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold font-sans">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Title / Incident</th>
                  <th className="py-2.5 px-3">Threat Level</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-[#0F172A] font-mono font-bold">{c.case_number}</td>
                    <td className="py-3 px-3 text-slate-900 max-w-xs truncate font-semibold">{c.title}</td>
                    <td className="py-3 px-3">
                      <ThreatBadge level={c.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold capitalize">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="px-3 py-1 rounded-xl bg-[#0F172A] text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
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
        <div className="corporate-card p-5">
          <h3 className="text-base font-serif-heading font-bold text-[#0F172A] mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#064E3B]" />
              {is_admin_view ? 'Platform Scans' : 'My Recent Scans'}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-semibold">
              {(recent_scans || []).length} items
            </span>
          </h3>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {(recent_scans || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-xs font-sans">No scan history recorded.</p>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">Use any forensic engine above to run a scan.</p>
              </div>
            ) : (recent_scans || []).map((scan, idx) => {
              const typeColors = { URL: 'text-[#0F172A] bg-[#0F172A]/10 border-[#0F172A]/20', EMAIL: 'text-purple-800 bg-purple-50 border-purple-200', MALWARE: 'text-[#7F1D1D] bg-[#7F1D1D]/10 border-[#7F1D1D]/20', PCAP: 'text-amber-800 bg-amber-50 border-amber-200' };
              const riskColor = scan.risk_score >= 75 ? 'text-[#7F1D1D]' : scan.risk_score >= 50 ? 'text-amber-700' : 'text-[#064E3B]';
              return (
                <div key={scan.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold ${typeColors[scan.scan_type] || 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                      {scan.scan_type}
                    </span>
                    <span className="text-slate-900 truncate font-mono text-[11px] font-medium">{scan.target}</span>
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
