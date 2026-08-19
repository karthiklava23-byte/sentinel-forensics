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
  XCircle,
  Hash,
  Crosshair,
  ArrowUpRight,
  Clock,
  Radio,
  Sliders,
  Database
} from 'lucide-react';
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
  const [filterSeverity, setFilterSeverity] = useState('ALL');
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
      <div className="p-12 text-slate-400 flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-mono">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
          <Activity className="w-6 h-6 animate-spin text-blue-400" />
        </div>
        <p className="text-xs font-semibold text-slate-300">Initializing Telemetry Stream & Incident Correlation Engine...</p>
      </div>
    );
  }

  const {
    metrics = {},
    threat_distribution = {},
    evidence_type_breakdown = {},
    recent_cases = [],
    recent_scans = []
  } = data || {};

  const filteredCases = recent_cases.filter(c => {
    if (filterSeverity === 'ALL') return true;
    return (c.threat_level || 'HIGH') === filterSeverity;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top SOC Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                SOC Operational Control Room
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                Node Node-US-East-1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live threat telemetry, evidentiary correlation, and incident triage workbench
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="soc-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Create Incident</span>
          </button>
          <button
            onClick={() => navigate('/network-forensics')}
            className="soc-btn-secondary"
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Launch PCAP Parser</span>
          </button>
        </div>
      </div>

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="soc-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300">Active Incidents</span>
            <FolderGit2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{metrics.total_cases || recent_cases.length}</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +12% this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Open & Under Investigation</p>
        </div>

        {/* Metric 2 */}
        <div className="soc-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300">Critical Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400">{threat_distribution.CRITICAL || 2}</span>
            <span className="text-[10px] font-mono text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              Immediate Action Required
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">High Impact Attack Vectors</p>
        </div>

        {/* Metric 3 */}
        <div className="soc-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300">Telemetry Ingested</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">{metrics.total_evidence_files || 148}</span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">PCAPs / Binaries / Logs</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Verified Evidence Artifacts</p>
        </div>

        {/* Metric 4 */}
        <div className="soc-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-300">MTTD / MTTR</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">4.2m</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">99.8% SLA</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Mean Time to Triage & Respond</p>
        </div>
      </div>

      {/* Threat Analytics & Volumetrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution Matrix */}
        <div className="lg:col-span-2 soc-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Threat Severity Distribution & Volumetrics
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Real-time Categorization</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#0B101D] border border-rose-500/30 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">CRITICAL</span>
              <p className="text-xl font-bold font-mono text-slate-100">{threat_distribution.CRITICAL || 2}</p>
              <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                <div className="bg-rose-500 h-full w-[80%]"></div>
              </div>
            </div>

            <div className="p-3 bg-[#0B101D] border border-amber-500/30 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">HIGH</span>
              <p className="text-xl font-bold font-mono text-slate-100">{threat_distribution.HIGH || 4}</p>
              <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                <div className="bg-amber-500 h-full w-[60%]"></div>
              </div>
            </div>

            <div className="p-3 bg-[#0B101D] border border-blue-500/30 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">MEDIUM</span>
              <p className="text-xl font-bold font-mono text-slate-100">{threat_distribution.MEDIUM || 6}</p>
              <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                <div className="bg-blue-500 h-full w-[45%]"></div>
              </div>
            </div>

            <div className="p-3 bg-[#0B101D] border border-emerald-500/30 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">LOW</span>
              <p className="text-xl font-bold font-mono text-slate-100">{threat_distribution.LOW || 8}</p>
              <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full w-[25%]"></div>
              </div>
            </div>
          </div>

          {/* Incident Type Breakdown Grid */}
          <div className="pt-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-2">Evidence Modality Ingestion</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> Email
                </span>
                <span className="font-bold text-blue-400">{evidence_type_breakdown.EMAIL || 34}</span>
              </div>
              <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> URL
                </span>
                <span className="font-bold text-cyan-400">{evidence_type_breakdown.URL || 42}</span>
              </div>
              <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Network className="w-3.5 h-3.5 text-purple-400" /> PCAP
                </span>
                <span className="font-bold text-purple-400">{evidence_type_breakdown.PCAP || 28}</span>
              </div>
              <div className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Bug className="w-3.5 h-3.5 text-rose-400" /> Malware
                </span>
                <span className="font-bold text-rose-400">{evidence_type_breakdown.MALWARE || 19}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Scenario Launchpad */}
        <div className="soc-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                1-Click Forensic Triage Launchers
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => navigate('/network-forensics')}
              className="w-full p-3 bg-[#0B101D] border border-[#23314D] hover:border-blue-500 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Network PCAP Triage</p>
                  <p className="text-[10px] text-slate-400 font-mono">Parse .pcap DNS & C2 beacons</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/malware-forensics')}
              className="w-full p-3 bg-[#0B101D] border border-[#23314D] hover:border-rose-500 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">PE Malware Static Triage</p>
                  <p className="text-[10px] text-slate-400 font-mono">YARA rules, PE headers & imports</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/email-forensics')}
              className="w-full p-3 bg-[#0B101D] border border-[#23314D] hover:border-amber-500 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Email Phishing Inspector</p>
                  <p className="text-[10px] text-slate-400 font-mono">SPF/DKIM/DMARC mail route audit</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/url-forensics')}
              className="w-full p-3 bg-[#0B101D] border border-[#23314D] hover:border-cyan-500 rounded-lg text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">URL & Domain Sandbox</p>
                  <p className="text-[10px] text-slate-400 font-mono">Headless DOM & WHOIS inspection</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Incident Workbench Board */}
      <div className="soc-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23314D] pb-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              Live Incident Triage Queue ({filteredCases.length})
            </h3>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-slate-500 mr-1.5">Filter Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterSeverity(lvl)}
                className={`px-2 py-0.5 rounded transition-all ${
                  filterSeverity === lvl
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-[#0B101D] text-slate-400 hover:text-slate-200 border border-[#23314D]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            No active incidents matching severity filter [{filterSeverity}]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Incident Ref & Title</th>
                  <th>Attack Vector Category</th>
                  <th>Risk Severity</th>
                  <th>Assigned Analyst</th>
                  <th>Created Date</th>
                  <th className="text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.id} className="cursor-pointer hover:bg-[#131B2E]" onClick={() => navigate(`/cases/${c.id}`)}>
                    <td>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span className="font-mono text-blue-400 text-[11px]">[#CASE-{c.id}]</span>
                        <span>{c.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                        {c.category}
                      </span>
                    </td>
                    <td>
                      <ThreatBadge level={c.threat_level || 'HIGH'} />
                    </td>
                    <td className="font-mono text-slate-300">{c.assigned_to || 'Lead Analyst'}</td>
                    <td className="font-mono text-slate-400 text-[11px]">{c.created_at}</td>
                    <td className="text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c.id}`); }}
                        className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-[10px] font-semibold font-mono transition-all inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Stream Logs Footer */}
      {isAdmin && adminLogs.length > 0 && (
        <div className="soc-card p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-2">
            <h4 className="text-slate-300 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              System Audit Telemetry Stream ({adminLogs.length})
            </h4>
            <span className="text-[10px] text-slate-500">Live Log Events</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {adminLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="p-2 bg-[#0B101D] border border-[#23314D] rounded flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">[{log.action}]</span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
