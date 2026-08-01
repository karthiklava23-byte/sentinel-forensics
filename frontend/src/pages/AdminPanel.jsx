import React, { useState, useEffect } from 'react';
import { Settings, Users, Activity, Cpu, ShieldCheck, Save } from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [geminiKey, setGeminiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getLogs()
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateSettings(geminiKey);
      setSaveSuccess('Gemini AI API Settings saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
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
                      <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-slate-900 text-cyan-400 border border-slate-700'
                      }`}>
                        {u.role}
                      </span>
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
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                When provided, the platform streams live Google Gemini Flash model responses for forensic correlation, natural language reports, and interactive assistant chat.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center justify-center gap-2 shadow-neon-purple"
            >
              <Save className="w-4 h-4" />
              SAVE GEMINI AI CONFIG
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
