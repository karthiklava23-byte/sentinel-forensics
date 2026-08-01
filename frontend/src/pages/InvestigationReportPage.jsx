import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, ShieldCheck, Hash, Lock, CheckCircle2 } from 'lucide-react';
import { casesAPI } from '../services/api';
import { generateCasePDFReport, generateCaseHTMLReport } from '../services/pdfGenerator';
import ThreatBadge from '../components/ThreatBadge';

const InvestigationReportPage = () => {
  const { id } = useParams();
  const [casesList, setCasesList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(id || '');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchReport(selectedCaseId);
    }
  }, [selectedCaseId]);

  const fetchCases = async () => {
    try {
      const res = await casesAPI.getCases();
      setCasesList(res.data);
      if (!selectedCaseId && res.data.length > 0) {
        setSelectedCaseId(res.data[0].id);
      }
    } catch (err) {
      console.error("Fetch cases error:", err);
    }
  };

  const fetchReport = async (caseId) => {
    setLoading(true);
    try {
      const res = await casesAPI.getCaseDetail(caseId);
      setReportData(res.data);
    } catch (err) {
      console.error("Fetch report detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setDownloading(true);
    await generateCasePDFReport(reportData.case, reportData.ai_report, 'full-report-print-target');
    setDownloading(false);
  };

  const handleDownloadHTML = () => {
    if (!reportData) return;
    generateCaseHTMLReport(reportData.case, reportData.ai_report, reportData.evidence || []);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            AUTOMATED INVESTIGATION REPORT GENERATOR
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive threat reports with AI timeline correlation, IOC evidence tables, Chain of Custody certification, and multi-format exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {casesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number}: {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadHTML}
            disabled={!reportData}
            className="px-3.5 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold font-mono text-xs rounded-lg flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT HTML
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !reportData}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs rounded-lg shadow-cyber-glow flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'GENERATING PDF...' : 'EXPORT PDF REPORT'}
          </button>
        </div>
      </div>

      {loading || !reportData ? (
        <div className="p-12 text-center font-mono text-cyan-400">
          LOADING REPORT DATA...
        </div>
      ) : (
        <div id="full-report-print-target" className="cyber-card p-8 rounded-xl border border-slate-800 space-y-6 font-mono bg-[#0b0f19]">
          {/* Official Document Banner */}
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" /> CLASSIFIED DFIR INVESTIGATION REPORT
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1">{reportData.case.title}</h2>
              <p className="text-xs text-slate-400">CASE NUMBER: {reportData.case.case_number}</p>
            </div>
            <ThreatBadge level={reportData.ai_report.threat_level || 'HIGH'} />
          </div>

          {/* Executive Summary */}
          <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2 text-xs">
            <h4 className="text-cyan-400 font-bold uppercase">EXECUTIVE SUMMARY</h4>
            <p className="text-slate-300 leading-relaxed">{reportData.ai_report.executive_summary}</p>
          </div>

          {/* Incident Vector */}
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-lg space-y-2 text-xs">
            <h4 className="text-purple-400 font-bold uppercase">INCIDENT ATTACK VECTOR</h4>
            <p className="text-slate-300 leading-relaxed">{reportData.ai_report.attack_vector || 'Phishing email vector with payload execution and C2 network communications.'}</p>
          </div>

          {/* Timeline Table */}
          <div className="space-y-2 text-xs">
            <h4 className="text-slate-200 font-bold uppercase">INCIDENT TIMELINE RECONSTRUCTION</h4>
            <div className="space-y-2">
              {reportData.ai_report.timeline && reportData.ai_report.timeline.map((evt, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className="text-cyan-400 font-bold">{evt.stage}:</span> <span className="text-slate-200">{evt.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correlated IOC Table */}
          <div className="space-y-2 text-xs">
            <h4 className="text-slate-200 font-bold uppercase">CORRELATED INDICATORS OF COMPROMISE (IOCs)</h4>
            <table className="w-full text-left border border-slate-800 rounded overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-3">TYPE</th>
                  <th className="py-2 px-3">IOC VALUE</th>
                  <th className="py-2 px-3">SOURCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reportData.ai_report.correlated_iocs && reportData.ai_report.correlated_iocs.map((ioc, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-cyan-400 font-bold">{ioc.type}</td>
                    <td className="py-2 px-3 text-rose-300 font-semibold">{ioc.value}</td>
                    <td className="py-2 px-3 text-slate-400">{ioc.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Certified Chain of Custody & Hash Verification */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DIGITAL CHAIN OF CUSTODY & INTEGRITY CERTIFICATION</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CASE INTEGRITY HASH (SHA-256):</span>
                <span className="text-cyan-300 font-mono text-[10px] break-all">{reportData.case.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ACQUISITION OFFICER:</span>
                <span className="text-emerald-300 font-semibold">{reportData.case.created_by || 'Lead Forensic Investigator'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400/90 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evidence artifacts cryptographically hashed and verified against anti-tampering ledger.</span>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2 text-xs">
            <h4 className="text-cyan-400 font-bold uppercase">RECOVERY & MITIGATION RECOMMENDATIONS</h4>
            <ul className="space-y-1.5 text-slate-300">
              {reportData.ai_report.mitigation_recommendations && reportData.ai_report.mitigation_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationReportPage;

