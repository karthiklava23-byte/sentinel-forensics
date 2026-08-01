import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Upload,
  Download,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  FileText,
  Clock,
  Mail,
  Globe,
  Network,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Bug,
  MessageSquare,
  Lock
} from 'lucide-react';
import { casesAPI } from '../services/api';
import { generateCasePDFReport, generateCaseHTMLReport } from '../services/pdfGenerator';
import ThreatBadge from '../components/ThreatBadge';
import EvidenceUploadModal from '../components/EvidenceUploadModal';
import GeminiChatModal from '../components/GeminiChatModal';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const fetchCaseDetail = async () => {
    setLoading(true);
    try {
      const res = await casesAPI.getCaseDetail(id);
      setData(res.data);
    } catch (err) {
      console.error("Fetch case detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await casesAPI.updateCase(id, { status: newStatus });
      fetchCaseDetail();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleExportPDF = async () => {
    if (!data) return;
    setDownloadingPDF(true);
    await generateCasePDFReport(data.case, data.ai_report, 'case-report-printable-container');
    setDownloadingPDF(false);
  };

  const handleExportHTML = () => {
    if (!data) return;
    generateCaseHTMLReport(data.case, data.ai_report, data.evidence || []);
  };

  if (loading || !data) {
    return (
      <div className="p-12 font-mono text-cyan-400 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <span>RUNNING AI EVIDENCE CORRELATION...</span>
        </div>
      </div>
    );
  }

  const c = data?.case || {};
  const evidence = data?.evidence || [];
  const ai_report = data?.ai_report || {};

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-sm">{c.case_number}</span>
              <ThreatBadge level={c.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">{c.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={c.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
          >
            <option value="OPEN">STATUS: OPEN</option>
            <option value="IN_PROGRESS">STATUS: IN_PROGRESS</option>
            <option value="RESOLVED">STATUS: RESOLVED</option>
            <option value="CLOSED">STATUS: CLOSED</option>
          </select>

          <button
            onClick={() => setIsEvidenceModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            ATTACH EVIDENCE
          </button>

          <button
            onClick={handleExportHTML}
            className="px-3.5 py-2 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-mono font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT HTML
          </button>

          <button
            onClick={handleExportPDF}
            disabled={downloadingPDF}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-cyber-glow"
          >
            <Download className="w-4 h-4" />
            {downloadingPDF ? 'GENERATING PDF...' : 'DOWNLOAD PDF REPORT'}
          </button>
        </div>
      </div>

      {/* Main Report Printable Container */}
      <div id="case-report-printable-container" className="space-y-6">
        {/* Incident Summary Card */}
        <div className="cyber-card p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
            <span className="text-xs text-slate-400">CATEGORY: <span className="text-slate-200 font-bold">{c.category}</span></span>
            <span className="text-xs text-slate-400">ASSIGNED TO: <span className="text-cyan-400 font-bold">{c.assigned_to}</span></span>
            <span className="text-xs text-slate-400">CREATED: <span className="text-slate-300">{c.created_at}</span></span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-mono">
            {c.description}
          </p>
        </div>

        {/* AI Correlation Engine Core Panel */}
        <div className="cyber-card-glow p-6 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 font-mono">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-neon-purple">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">AI THREAT CORRELATION ENGINE</h2>
                <p className="text-xs text-purple-400">Cross-Module Evidence Reconstruction & Timeline Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase">OVERALL RISK SCORE</p>
                <p className="text-2xl font-bold text-rose-400">{ai_report.overall_threat_score}/100</p>
              </div>
              <ThreatBadge level={ai_report.threat_level || 'HIGH'} />
            </div>
          </div>

          {/* Executive Threat Summary */}
          <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
            <h4 className="text-cyan-400 font-bold uppercase flex items-center gap-2">
              <FileText className="w-4 h-4" />
              EXECUTIVE THREAT SUMMARY & ATTACK VECTOR
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {ai_report.executive_summary}
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              <span className="text-slate-500">ATTACK VECTOR PATH:</span> <span className="text-slate-200 font-semibold">{ai_report.attack_vector}</span>
            </div>
          </div>

          {/* Attack Timeline Reconstruction */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-slate-200 font-bold uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              RECONSTRUCTED ATTACK TIMELINE
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/30">
              {ai_report.timeline && ai_report.timeline.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-[#0a0d14] shadow-cyber-glow"></div>
                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-cyan-400 font-bold">{evt.stage}</span>
                      <span className="text-slate-400">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-200">{evt.description}</p>
                    {evt.ioc && (
                      <p className="text-[10px] text-purple-400 font-semibold pt-1">
                        FLAGGED IOC: <span className="bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">{evt.ioc}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlated IOCs Table */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-slate-200 font-bold uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              CORRELATED INDICATORS OF COMPROMISE (IOCs)
            </h4>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">IOC TYPE</th>
                    <th className="py-2.5 px-4">VALUE / ARTIFACT</th>
                    <th className="py-2.5 px-4">SOURCE MODULE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {ai_report.correlated_iocs && ai_report.correlated_iocs.map((ioc, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 text-cyan-400 font-bold">{ioc.type}</td>
                      <td className="py-2.5 px-4 text-rose-300 font-semibold">{ioc.value}</td>
                      <td className="py-2.5 px-4 text-slate-400">{ioc.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mitigation Recommendations & Gemini AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ACTIONABLE MITIGATION STEPS
              </h4>
              <ul className="space-y-2 text-slate-300">
                {ai_report.mitigation_recommendations && ai_report.mitigation_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-purple-400 font-bold uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  GEMINI AI INVESTIGATION ASSISTANT
                </h4>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-900/50 border border-purple-700/50 rounded-lg text-[10px] text-purple-300 hover:bg-purple-800/60 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Ask Gemini AI
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[11px]">
                {ai_report.gemini_ai_insights || ai_report.claude_ai_insights}
              </p>
            </div>
          </div>
        </div>

        {/* Attached Forensic Evidence Artifacts Section */}
        <div className="cyber-card p-6 rounded-xl border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              ATTACHED FORENSIC EVIDENCE ARTIFACTS ({evidence.length})
            </h3>
            <button
              onClick={() => setIsEvidenceModalOpen(true)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              + Attach Artifact
            </button>
          </div>

          {evidence.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              NO FORENSIC EVIDENCE ARTIFACTS ATTACHED YET. UPLOAD AN .EML FILE, .PCAP CAPTURE, OR PHISHING URL.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      {ev.type === 'EMAIL' && <Mail className="w-4 h-4" />}
                      {ev.type === 'URL' && <Globe className="w-4 h-4" />}
                      {ev.type === 'PCAP' && <Network className="w-4 h-4 text-purple-400" />}
                      {ev.type === 'MALWARE' && <Bug className="w-4 h-4 text-red-400" />}
                      {ev.type} ARTIFACT
                    </span>
                    <span className="text-[10px] text-slate-500">{ev.uploaded_at}</span>
                  </div>
                  <p className="text-slate-200 font-bold truncate" title={ev.filename}>
                    {ev.filename}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {ev.analysis_result?.summary || 'Analyzed'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EvidenceUploadModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        caseId={id}
        onEvidenceUploaded={() => fetchCaseDetail()}
      />

      <GeminiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        caseId={id}
        caseTitle={c?.title}
      />
    </div>
  );
};

export default CaseDetails;
