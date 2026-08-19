import React, { useState, useEffect } from 'react';
import { Settings, Users, Activity, Cpu, ShieldCheck, Save, CheckCircle2, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
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
      setStoredGeminiKey(geminiKey.trim());
      setKeyStored(true);
      try { await adminAPI.updateSettings(geminiKey.trim()); } catch (_) {}
      setSaveSuccess('✅ Gemini AI API key saved! The assistant is now active for all users.');
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <Activity className="w-6 h-6 animate-spin text-purple-400" />
        <span className="text-xs font-medium">Loading Admin Control Panel...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              System Administration & Control
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">Admin Mode</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage system users, role privileges, forensic audit trails, and Google Gemini AI settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* User Management Panel (2 cols) */}
        <div className="lg:col-span-2 soc-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Registered Operators & Users ({users.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Full Name / Handle</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Registration Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151c2c] transition-colors">
                    <td className="py-3 px-3 text-slate-200 font-semibold">
                      {u.full_name} <span className="text-slate-400 font-normal font-mono text-[11px]">(@{u.username})</span>
                    </td>
                    <td className="py-3 px-3 text-blue-400 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#0c1019] text-blue-400 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] font-medium focus:outline-none focus:border-blue-500 capitalize"
                      >
                        <option value="analyst">Analyst</option>
                        <option value="investigator">Investigator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">{u.created_at}</td>
                    <td className="py-3 px-3">
                      <span className="status-pill-emerald text-[10px]">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gemini API Key Configuration Panel */}
        <div className="soc-card p-6 space-y-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Gemini Telemetry Key</h3>
              <p className="text-[11px] text-slate-500">Live AI Engine Key</p>
            </div>
          </div>

          <form onSubmit={handleSaveGeminiKey} className="space-y-3 flex-1 flex flex-col justify-between">
            {keyMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                keyMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {keyMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
                <span>{keyMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Google Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#0F172A] transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Saved in local device storage — remains active without needing a server restart.
              </p>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 mt-1 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Get a key at aistudio.google.com
              </a>
            </div>

            <button
              type="submit"
              disabled={!geminiKey.trim()}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>Save Telemetry API Key</span>
            </button>
          </form>
        </div>
      </div>

      {/* System Audit Log Stream */}
      <div className="soc-card p-6 space-y-4 text-xs">
        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-600" />
          System Security Audit Trail Logs ({logs.length})
        </h3>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 font-mono text-[11px]">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="p-3 bg-[#0c1019] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-blue-400 font-semibold mr-2 font-sans">[{log.action}]</span>
                <span className="text-slate-200 font-sans">{log.details}</span>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
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
