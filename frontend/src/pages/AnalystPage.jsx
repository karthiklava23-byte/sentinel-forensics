import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, Cpu, Terminal, Globe, FileText, CheckCircle2,
  AlertTriangle, Play, Copy, RefreshCw, Layers, Crosshair, ArrowUpRight, Zap
} from 'lucide-react';
import { analystAPI } from '../services/api';

export default function AnalystPage() {
  const [activeTab, setActiveTab] = useState('triage');

  // Tab 1: Alert Triage Queue State
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [triageStatus, setTriageStatus] = useState('');

  // Tab 2: Threat Hunting State
  const [ruleType, setRuleType] = useState('YARA');
  const [ruleContent, setRuleContent] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [huntingResult, setHuntingResult] = useState(null);
  const [loadingHunt, setLoadingHunt] = useState(false);

  // Tab 3: SIEM Log Parser State
  const [logContent, setLogContent] = useState('');
  const [parsedLogResult, setParsedLogResult] = useState(null);
  const [loadingParse, setLoadingParse] = useState(false);

  // Tab 4: Attack Surface Scanner State
  const [targetAsset, setTargetAsset] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);

  // Tab 5: SOAR Playbook State
  const [playbookType, setPlaybookType] = useState('BLOCK_IP');
  const [playbookTarget, setPlaybookTarget] = useState('');
  const [playbookResult, setPlaybookResult] = useState(null);
  const [loadingPlaybook, setLoadingPlaybook] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await analystAPI.getAlerts();
      setAlerts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleTriageAction = async (alertId, action) => {
    try {
      const res = await analystAPI.triageAlert(alertId, action, `Action ${action} taken from Analyst Workspace.`);
      setTriageStatus(`Alert ${alertId}: ${res.data?.new_status}`);
      setTimeout(() => setTriageStatus(''), 4000);
      fetchAlerts();
    } catch (e) {
      alert("Failed to triage alert.");
    }
  };

  const handleTestRule = async () => {
    setLoadingHunt(true);
    try {
      const res = await analystAPI.testRule({
        rule_type: ruleType,
        rule_content: ruleContent,
        sample_text: sampleText
      });
      setHuntingResult(res.data);
    } catch (e) {
      alert("Failed to test rule.");
    } finally {
      setLoadingHunt(false);
    }
  };

  const handleParseLogs = async () => {
    setLoadingParse(true);
    try {
      const res = await analystAPI.parseLogs({ log_content: logContent });
      setParsedLogResult(res.data);
    } catch (e) {
      alert("Failed to parse logs.");
    } finally {
      setLoadingParse(false);
    }
  };

  const handleScanAttackSurface = async () => {
    setLoadingScan(true);
    try {
      const res = await analystAPI.scanAttackSurface({ target: targetAsset });
      setScanResult(res.data);
    } catch (e) {
      alert("Failed to scan attack surface.");
    } finally {
      setLoadingScan(false);
    }
  };

  const handleGeneratePlaybook = async () => {
    setLoadingPlaybook(true);
    try {
      const res = await analystAPI.generatePlaybook({
        playbook_type: playbookType,
        target_value: playbookTarget
      });
      setPlaybookResult(res.data);
    } catch (e) {
      alert("Failed to generate containment playbook.");
    } finally {
      setLoadingPlaybook(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Workspace Header Banner */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Analyst SOC Workspace</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  Real-time Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Alert Triage Queue • YARA/Sigma Detection Rules • SIEM Logs • Attack Surface Audit • SOAR Playbooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlerts}
              className="px-3.5 py-2 rounded-xl bg-[#121724] border border-slate-800 hover:bg-[#182033] text-slate-300 text-xs font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loadingAlerts ? 'animate-spin' : ''}`} />
              <span>Refresh Triage</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { id: 'triage', label: 'Alert Triage Queue', icon: Activity },
            { id: 'hunting', label: 'Threat Hunting Workbench', icon: Terminal },
            { id: 'logs', label: 'SIEM Log Parser', icon: FileText },
            { id: 'attack', label: 'Attack Surface Scanner', icon: Globe },
            { id: 'soar', label: 'SOAR Playbook Engine', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-semibold'
                    : 'bg-[#111726] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Alert Banner */}
      {triageStatus && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" /> <span>{triageStatus}</span>
        </div>
      )}

      {/* TAB 1: ALERT TRIAGE QUEUE */}
      {activeTab === 'triage' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Active Triage Queue ({alerts.length})
            </h3>
            <p className="text-[11px] text-slate-400">Dismiss False Positives or Escalate to Investigation Case</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loadingAlerts ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">Loading triage alert queue...</div>
            ) : alerts.map((alt) => {
              const isDone = alt.status !== 'OPEN';
              return (
                <div key={alt.id} className="soc-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100 font-mono text-xs">{alt.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        alt.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#182133] border border-slate-700 text-slate-300 text-[10px] font-medium">
                        {alt.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{alt.timestamp}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200">{alt.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{alt.details}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>Source IP: <strong className="text-blue-400">{alt.source_ip}</strong></span>
                      <span>Target Asset: <strong className="text-slate-200">{alt.target_asset}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDone ? (
                      <span className="px-3 py-1.5 rounded-xl bg-[#182133] border border-slate-700 text-slate-300 text-xs font-medium capitalize">
                        {alt.status}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'FALSE_POSITIVE')}
                          className="px-3.5 py-2 rounded-xl bg-[#141b29] hover:bg-[#1a2336] text-slate-300 border border-slate-800 text-xs font-medium transition-all"
                        >
                          False Positive
                        </button>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'CONTAIN')}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-medium transition-all"
                        >
                          Contain Host
                        </button>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'ESCALATE')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all flex items-center gap-1 shadow-lg shadow-blue-500/20"
                        >
                          <span>Escalate</span> <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: THREAT HUNTING WORKBENCH */}
      {activeTab === 'hunting' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Rule Editor */}
          <div className="soc-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Detection Rule Builder ({ruleType})
              </h3>
              <div className="flex gap-1.5">
                {['YARA', 'SIGMA'].map(t => (
                  <button
                    key={t}
                    onClick={() => setRuleType(t)}
                    className={`px-3 py-1 text-xs font-medium rounded-xl transition-all ${
                      ruleType === t ? 'bg-blue-600 text-white font-semibold' : 'bg-[#0c1019] text-slate-400 border border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Rule Code</label>
              <textarea
                rows={10}
                value={ruleContent}
                onChange={(e) => setRuleContent(e.target.value)}
                placeholder="Paste or write your YARA / Sigma detection rule here..."
                className="w-full bg-[#0c1019] border border-slate-800 rounded-xl p-3 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Test Sample Text</label>
              <textarea
                rows={4}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Paste raw log sample or payload text to test rule matching..."
                className="w-full bg-[#0c1019] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleTestRule}
              disabled={loadingHunt}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4" /> {loadingHunt ? 'Testing Rule...' : `Validate & Test ${ruleType} Rule`}
            </button>
          </div>

          {/* Test Evaluation Results */}
          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Rule Evaluation Results
            </h3>

            {!huntingResult ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Click "Validate & Test" to evaluate your {ruleType} detection rule against the test payload.
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  huntingResult.status === 'MATCH_FOUND' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-[#0c1019] border-slate-800 text-slate-400'
                }`}>
                  <div>
                    <p className="text-xs font-bold">{huntingResult.status === 'MATCH_FOUND' ? '✅ Signature Match Detected' : '❌ No Match Found'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{huntingResult.match_count} signature patterns matched in sample</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 bg-[#0c1019] rounded-full border border-slate-800 text-slate-400">{huntingResult.evaluated_at?.slice(11)}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Match Details</p>
                  {huntingResult.matches.map((m, idx) => (
                    <div key={idx} className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl text-xs font-mono text-slate-200">
                      • {m}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SIEM LOG PARSER */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              SIEM Log Parser (.EVTX / Syslog / JSON)
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Raw Log Input Stream</label>
              <textarea
                rows={12}
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                className="w-full bg-[#0c1019] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                placeholder="Paste raw log lines here..."
              />
            </div>

            <button
              onClick={handleParseLogs}
              disabled={loadingParse}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40"
            >
              <Layers className="w-4 h-4" /> {loadingParse ? 'Parsing Logs...' : 'Parse Log Anomalies'}
            </button>
          </div>

          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Log Anomaly Parser Output
            </h3>

            {!parsedLogResult ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Paste log text and click "Parse Log Anomalies" to extract failed logins, shell execution, and top IP talkers.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl text-center">
                    <p className="text-lg font-bold text-slate-100 font-mono">{parsedLogResult.total_log_lines_parsed}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Lines Parsed</p>
                  </div>
                  <div className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl text-center">
                    <p className="text-lg font-bold text-rose-400 font-mono">{parsedLogResult.failed_login_events}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Failed Logins</p>
                  </div>
                  <div className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl text-center">
                    <p className="text-lg font-bold text-purple-400 font-mono">{parsedLogResult.suspicious_executions}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Shell Exec</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Detected Anomalies</p>
                  {parsedLogResult.detected_anomalies.map((anom, idx) => (
                    <div key={idx} className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-blue-400">{anom.type}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{anom.description}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-medium border border-rose-500/20">
                        {anom.severity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Top IP Talkers</p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {parsedLogResult.top_ip_talkers.map((talker, idx) => (
                      <div key={idx} className="flex justify-between p-2.5 bg-[#0c1019] rounded-xl border border-slate-800">
                        <span className="text-blue-400 font-semibold">{talker.ip}</span>
                        <span className="text-slate-400 font-sans">{talker.count} requests</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ATTACK SURFACE SCANNER */}
      {activeTab === 'attack' && (
        <div className="space-y-6 text-xs">
          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              External Attack Surface & CVE Vulnerability Auditor
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetAsset}
                onChange={(e) => setTargetAsset(e.target.value)}
                placeholder="Enter target IP or Domain (e.g. 192.168.1.1 or company.com)..."
                className="flex-1 bg-[#0c1019] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                onClick={handleScanAttackSurface}
                disabled={loadingScan}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40"
              >
                <Globe className="w-4 h-4" /> {loadingScan ? 'Auditing...' : 'Audit Attack Surface'}
              </button>
            </div>
          </div>

          {scanResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="soc-card p-5 text-center flex flex-col justify-center items-center">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Security Health Grade</p>
                <h2 className={`text-6xl font-bold font-mono my-2 ${
                  scanResult.health_grade === 'A' ? 'text-emerald-400' : scanResult.health_grade === 'B' ? 'text-blue-400' : scanResult.health_grade === 'C' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {scanResult.health_grade}
                </h2>
                <p className="text-xs text-slate-400">Risk Score: {scanResult.overall_risk_score}/100</p>
                <p className="text-xs font-mono text-blue-400 mt-2">IP: {scanResult.resolved_ip}</p>
              </div>

              <div className="soc-card p-5 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200">Open Ports & Services</h4>
                <div className="space-y-2">
                  {scanResult.open_ports.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0c1019] rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-blue-400 font-mono font-semibold">Port {p.port}</span>
                        <span className="text-slate-300 ml-2 font-medium">{p.service}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                        p.risk === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {p.risk} Risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="soc-card p-5 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200">CVE Vulnerability Matches</h4>
                <div className="space-y-2">
                  {scanResult.matching_cves.length === 0 ? (
                    <p className="text-slate-500 text-xs">No critical CVEs matched for open services.</p>
                  ) : scanResult.matching_cves.map((cve, idx) => (
                    <div key={idx} className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-rose-400 font-mono">{cve.cve_id}</span>
                        <span className="text-rose-400 font-mono">CVSS {cve.cvss_score}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{cve.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SOAR PLAYBOOK ENGINE */}
      {activeTab === 'soar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              SOAR Containment Playbook Generator
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Playbook Action Type</label>
                <select
                  value={playbookType}
                  onChange={(e) => setPlaybookType(e.target.value)}
                  className="w-full bg-[#0c1019] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all font-medium"
                >
                  <option value="BLOCK_IP">Block Malicious IP (iptables / Windows Firewall)</option>
                  <option value="BLOCK_DOMAIN">DNS Sinkhole Domain (BIND / Hosts File)</option>
                  <option value="ISOLATE_ENDPOINT">Network Isolate Endpoint Host</option>
                  <option value="REVOKE_USER">Revoke Compromised User Sessions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target IP / Domain / Username</label>
                <input
                  type="text"
                  value={playbookTarget}
                  onChange={(e) => setPlaybookTarget(e.target.value)}
                  placeholder="Enter IP, domain, username, or endpoint hostname..."
                  className="w-full bg-[#0c1019] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={handleGeneratePlaybook}
                disabled={loadingPlaybook}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4" /> {loadingPlaybook ? 'Generating Payload...' : 'Generate Containment Payload'}
              </button>
            </div>
          </div>

          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              Containment Script Payload
            </h3>

            {!playbookResult ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select a playbook action and click "Generate Containment Payload" to get Linux & Windows block scripts.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-blue-400">{playbookResult.title}</h4>
                  <button
                    onClick={() => copyToClipboard(playbookResult.bash_payload + "\n\n" + playbookResult.powershell_payload)}
                    className="px-3 py-1.5 bg-[#121724] hover:bg-[#182033] text-slate-300 border border-slate-800 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-400" /> {copiedPayload ? 'Copied Payload!' : 'Copy Payload'}
                  </button>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-1">Linux / Bash Payload</p>
                  <pre className="bg-[#0c1019] p-3 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto">
                    {playbookResult.bash_payload}
                  </pre>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-1">Windows PowerShell Payload</p>
                  <pre className="bg-[#0c1019] p-3 rounded-xl border border-slate-800 text-xs text-blue-400 font-mono overflow-x-auto">
                    {playbookResult.powershell_payload}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
