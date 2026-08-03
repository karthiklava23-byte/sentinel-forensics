import React, { useState, useEffect } from 'react';
import { Settings, Users, Activity, Cpu, ShieldCheck, Save, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { adminAPI, setStoredGeminiKey, getStoredGeminiKey } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [keyStored, setKeyStored] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, settingsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getLogs(),
        adminAPI.getSettings().catch(() => ({ data: {} }))
      ]);
      setUsers(usersRes.data || []);
      setLogs(logsRes.data || []);
      
      const serverKey = settingsRes.data?.gemini_api_key || '';
      const localKey = getStoredGeminiKey();
      const activeKey = serverKey || localKey;

      if (activeKey) {
        setGeminiKey(activeKey);
        setKeyStored(true);
        if (serverKey && !localKey) {
          setStoredGeminiKey(serverKey);
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Role update error:", err);
      alert(err.response?.data?.detail || "Failed to update user role.");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    try {
      // Save to localStorage (persists across backend restarts)
      setStoredGeminiKey(geminiKey.trim());
      setKeyStored(true);
      // Also try to save to backend (best-effort, not critical)
      try { await adminAPI.updateSettings(geminiKey.trim()); } catch (_) {}
      setSaveSuccess('✅ Gemini AI API key saved! The assistant is now active for all users on this device.');
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-cyan-400">
        LOADING ADMIN CONTROL PANEL...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-5 font-mono">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Settings className="w-6 h-6 text-purple-400" />
          SYSTEM ADMINISTRATION & AUDIT PANEL
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system users, access privileges, audit trail logs, and Google Gemini AI correlation settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* User Management Panel (2 cols) */}
        <div className="lg:col-span-2 cyber-card p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            REGISTERED SYSTEM USERS & OPERATORS ({users.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">FULL NAME / USERNAME</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">REGISTERED</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 text-slate-200 font-bold">
                      {u.full_name} <span className="text-slate-500 font-normal">(@{u.username})</span>
                    </td>
                    <td className="py-3 px-3 text-cyan-400">{u.email}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-900 text-cyan-400 border border-slate-700 rounded px-2 py-1 uppercase font-bold text-[10px] focus:outline-none focus:border-cyan-500"
                      >
                        <option value="analyst">Analyst</option>
                        <option value="investigator">Investigator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[10px]">{u.created_at}</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gemini AI API Key Settings (1 col) */}
        <div className="cyber-card-glow p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            GOOGLE GEMINI AI INTEGRATION
          </h3>

          {/* Status badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono ${
            keyStored
              ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-700/40 text-amber-300'
          }`}>
            {keyStored
              ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> API KEY ACTIVE — AI assistant is live</>  
              : <><AlertCircle className="w-3.5 h-3.5 shrink-0" /> NO API KEY — Enter your key below</>}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            {saveSuccess && (
              <div className="p-2.5 bg-emerald-950 text-emerald-400 border border-emerald-500 rounded text-[11px]">
                {saveSuccess}
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">GOOGLE GEMINI API KEY</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => { setGeminiKey(e.target.value); setKeyStored(false); }}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Key is saved in your browser — works permanently without needing a server restart.
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> Get a free key at aistudio.google.com
              </a>
            </div>

            <button
              type="submit"
              disabled={!geminiKey.trim()}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded flex items-center justify-center gap-2 shadow-neon-purple"
            >
              <Save className="w-4 h-4" />
              SAVE &amp; ACTIVATE GEMINI AI
            </button>
          </form>
        </div>
      </div>

      {/* System Audit Log Stream */}
      <div className="cyber-card p-6 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          SYSTEM SECURITY AUDIT TRAIL LOGS ({logs.length})
        </h3>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-cyan-400 font-bold mr-2">[{log.action}]</span>
                <span className="text-slate-200">{log.details}</span>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <span>{log.user_email}</span> | <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
