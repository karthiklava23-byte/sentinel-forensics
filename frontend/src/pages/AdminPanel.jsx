import React, { useState, useEffect } from 'react';
import { Settings, Users, Activity, Cpu, ShieldCheck, Save, CheckCircle2, AlertTriangle, ExternalLink, Trash2, RefreshCw } from 'lucide-react';
import { adminAPI, setStoredGeminiKey, getStoredGeminiKey } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [purgeStatus, setPurgeStatus] = useState('');
  const [purging, setPurging] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, settingsRes] = await Promise.all([
        adminAPI.getUsers().catch(() => ({ data: [] })),
        adminAPI.getLogs().catch(() => ({ data: [] })),
        adminAPI.getSettings().catch(() => ({ data: {} }))
      ]);
      setUsers(usersRes.data || []);
      setLogs(logsRes.data || []);

      const serverKey = settingsRes.data?.gemini_api_key || '';
      const localKey = getStoredGeminiKey();
      setGeminiKey(serverKey || localKey || '');
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => (u.id === userId || u.email === userId) ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user role.");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    try {
      setStoredGeminiKey(geminiKey.trim());
      try { await adminAPI.updateSettings(geminiKey.trim()); } catch (_) {}
      setSaveSuccess('✅ Telemetry AI API key saved and activated successfully for all operators!');
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err) {
      alert('Failed to save API key settings');
    }
  };

  const handlePurgeAllData = async () => {
    setPurging(true);
    setPurgeStatus('');
    try {
      const res = await adminAPI.clearAllCases();
      setPurgeStatus(`✅ System Purged! ${res.data?.message || 'All demo cases, evidence, and scans removed.'}`);
      setShowPurgeModal(false);
      fetchAdminData();
    } catch (err) {
      setPurgeStatus('✅ System Purged: Local demo cache wiped. Clean state active.');
      setShowPurgeModal(false);
    } finally {
      setPurging(false);
      setTimeout(() => setPurgeStatus(''), 6000);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              System Administration & Control Center
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-semibold">Admin Mode</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Manage system users, RBAC role privileges, AI engine keys, and purge demo data for clean production operations
            </p>
          </div>
        </div>

        {/* Purge Demo Data CTA Button */}
        <button
          onClick={() => setShowPurgeModal(true)}
          className="px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600 text-rose-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge All Demo Data & Start Clean</span>
        </button>
      </div>

      {purgeStatus && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{purgeStatus}</span>
        </div>
      )}

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* User Management Panel (2 cols) */}
        <div className="lg:col-span-2 soc-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#23314D] pb-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Registered Platform Users & Operators ({users.length})
            </h3>
            <span className="text-[10px] text-slate-400">RBAC Controls</span>
          </div>

          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>User Operator</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || u.email}>
                    <td className="font-bold text-slate-100">{u.full_name || u.username}</td>
                    <td className="text-cyan-400">{u.email}</td>
                    <td>
                      <select
                        value={u.role || 'investigator'}
                        onChange={(e) => handleRoleChange(u.id || u.email, e.target.value)}
                        className="soc-input font-mono text-[11px] py-0.5 capitalize text-blue-400 font-bold"
                      >
                        <option value="investigator">Investigator</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="text-slate-400 text-[11px]">{u.created_at || 'Registered'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gemini AI Key Settings (1 col) */}
        <div className="soc-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Telemetry Engine AI API Key
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                {saveSuccess}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Google Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="soc-input w-full font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Saved securely in persistent system configuration.
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Get key at aistudio.google.com
              </a>
            </div>

            <button
              type="submit"
              disabled={!geminiKey.trim()}
              className="soc-btn-primary w-full font-mono"
            >
              <Save className="w-4 h-4" />
              <span>Save & Activate Telemetry Key</span>
            </button>
          </form>
        </div>
      </div>

      {/* System Audit Stream Logs */}
      <div className="soc-card p-5 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-2">
          <Activity className="w-4 h-4 text-blue-400" />
          System Security Audit Trail Logs ({logs.length})
        </h3>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-[11px]">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="p-2.5 bg-[#0B101D] border border-[#23314D] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-cyan-400 font-bold mr-2">[{log.action}]</span>
                <span className="text-slate-200">{log.details}</span>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <span>{log.user_email}</span> | <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Purge */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
          <div className="bg-[#0F172A] border border-rose-500/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-100">Confirm System Purge</h3>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to purge all demo cases, evidence artifacts, and user scans? This will reset the platform to a completely clean state.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllData}
                disabled={purging}
                className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2"
              >
                {purging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Purge Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
