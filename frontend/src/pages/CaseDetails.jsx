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
  Lock,
  Activity
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
      <div className="p-12 text-slate-400 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Activity className="w-6 h-6 animate-spin text-blue-400" />
        <span className="text-xs font-medium">Running AI Evidence Correlation & Synthesizing Report...</span>
      </div>
    );
  }

  const c = data?.case || {};
  const evidence = data?.evidence || [];
  const ai_report = data?.ai_report || {};

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 rounded-xl bg-[#121724] border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-[#182033] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono font-semibold text-xs">{c.case_number}</span>
              <ThreatBadge level={c.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-0.5 tracking-tight">{c.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <select
            value={c.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-[#0c1019] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-medium capitalize"
          >
            <option value="OPEN">Status: Open</option>
            <option value="IN_PROGRESS">Status: In Progress</option>
            <option value="RESOLVED">Status: Resolved</option>
            <option value="CLOSED">Status: Closed</option>
          </select>

          <button
            onClick={() => setIsEvidenceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#121724] hover:bg-[#182033] text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Attach Evidence</span>
          </button>

          <button
            onClick={handleExportHTML}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={downloadingPDF}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div id="case-report-printable-container" className="space-y-6 text-xs font-sans">
        {/* Incident Summary Card */}
        <div className="soc-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 text-xs">
            <span className="text-slate-600">Category: <strong className="text-slate-900 font-semibold">{c.category}</strong></span>
            <span className="text-slate-600">Assigned To: <strong className="text-blue-700 font-semibold">{c.assigned_to}</strong></span>
            <span className="text-slate-500 font-mono text-[11px]">Created: {c.created_at}</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {c.description}
          </p>
        </div>

        {/* AI Correlation Engine Core Panel */}
        <div className="soc-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-serif-heading">SOC Threat Correlation Engine</h2>
                <p className="text-[11px] text-slate-500">Cross-Module Evidence Reconstruction & Attack Timeline Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Overall Risk Score</p>
                <p className="text-2xl font-bold text-rose-700 font-mono">{ai_report.overall_threat_score}/100</p>
              </div>
              <ThreatBadge level={ai_report.threat_level || 'HIGH'} />
            </div>
          </div>

          {/* Executive Threat Summary */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-slate-900 font-semibold uppercase text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Executive Threat Summary & Attack Vector
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs">
              {ai_report.executive_summary}
            </p>
            <div className="pt-2 text-[11px] text-slate-600">
              <span>Attack Vector Path:</span> <span className="text-slate-900 font-medium">{ai_report.attack_vector}</span>
            </div>
          </div>

          {/* Attack Timeline Reconstruction */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Reconstructed Attack Timeline
            </h4>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
              {ai_report.timeline && ai_report.timeline.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#0F172A] border-4 border-white shadow-sm"></div>
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-700 font-semibold">{evt.stage}</span>
                      <span className="text-slate-500 font-mono">{evt.timestamp}</span>
                    </div>
                    <p className="text-slate-800 text-xs">{evt.description}</p>
                    {evt.ioc && (
                      <p className="text-[11px] text-slate-700 font-semibold pt-1">
                        Flagged IOC: <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md border border-slate-300 font-mono text-[10px]">{evt.ioc}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Recommendations & Automated Triage Panel */}
        <div className="soc-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-slate-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mitigation Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {ai_report.mitigation_recommendations && ai_report.mitigation_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-100 font-semibold flex items-center gap-2 text-xs">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  Sentinel Telemetry Intelligence
                </h4>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Query Analyst</span>
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs">
                {ai_report.gemini_ai_insights || ai_report.claude_ai_insights}
              </p>
            </div>
          </div>
        </div>

        {/* Attached Forensic Evidence Artifacts Section */}
        <div className="soc-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Attached Forensic Evidence Artifacts ({evidence.length})
            </h3>
            <button
              onClick={() => setIsEvidenceModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              + Attach Artifact
            </button>
          </div>

          {evidence.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No evidence artifacts attached yet. Upload an .EML file, .PCAP capture, malware binary, or phishing URL.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl bg-[#0c1019] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      {ev.type === 'EMAIL' && <Mail className="w-4 h-4" />}
                      {ev.type === 'URL' && <Globe className="w-4 h-4" />}
                      {ev.type === 'PCAP' && <Network className="w-4 h-4 text-purple-400" />}
                      {ev.type === 'MALWARE' && <Bug className="w-4 h-4 text-rose-400" />}
                      {ev.type} Artifact
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{ev.uploaded_at}</span>
                  </div>
                  <p className="text-slate-200 font-semibold font-mono text-xs truncate" title={ev.filename}>
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
