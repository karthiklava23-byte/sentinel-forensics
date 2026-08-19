import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, Mail, Globe, Bug, Network, FolderGit2, Activity, ArrowLeft } from 'lucide-react';
import { adminAPI, analyticsAPI } from '../services/api';

const SCAN_TYPE_ICON = {
  URL:     <Globe className="w-3.5 h-3.5 text-cyan-400" />,
  EMAIL:   <Mail className="w-3.5 h-3.5 text-blue-400" />,
  MALWARE: <Bug className="w-3.5 h-3.5 text-rose-400" />,
  PCAP:    <Network className="w-3.5 h-3.5 text-purple-400" />,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userSummary, setUserSummary] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const openUser = async (u) => {
    setSelected(u);
    setUserSummary(null);
    setLoadingDetail(true);
    try {
      const r = await analyticsAPI.getUserSummary(u.email);
      setUserSummary(r.data);
    } catch (_) {}
    finally { setLoadingDetail(false); }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="border-b border-[#23314D] pb-5">
        <div className="flex items-center gap-3.5">
          {selected && (
            <button
              onClick={() => { setSelected(null); setUserSummary(null); }}
              className="p-2 rounded-lg bg-[#0B101D] border border-[#23314D] hover:bg-slate-800 text-slate-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {selected ? `Operator Dashboard — ${selected.email}` : 'User Access Directory & Operator Audit'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {selected ? 'Viewing user\'s personal activity, cases, and scan history' : 'Admin directory: inspect individual operator activity and assigned cases'}
            </p>
          </div>
        </div>
      </div>

      {/* User List */}
      {!selected && (
        <div className="space-y-2.5 font-mono text-xs">
          {loadingUsers ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-blue-400" /> Loading user directory...
            </div>
          ) : users.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-10">No registered users found.</p>
          ) : users.map((u) => (
            <button
              key={u.id || u.email}
              onClick={() => openUser(u)}
              className="w-full flex items-center gap-4 p-4 soc-card-interactive text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-sm shrink-0">
                {(u.full_name || u.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-100 font-sans">{u.full_name || u.username}</p>
                  <span className={`px-2 py-0.2 rounded text-[10px] uppercase font-bold border ${
                    u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {u.role || 'Investigator'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* User Detail Summary */}
      {selected && (
        <div className="space-y-6 font-mono text-xs">
          <div className="soc-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-[#23314D] pb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              Operator Incident History Summary
            </h3>

            {loadingDetail ? (
              <div className="text-center py-8 text-slate-400 flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-blue-400" /> Fetching operator audit logs...
              </div>
            ) : userSummary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Scans</p>
                  <p className="text-xl font-bold text-slate-100">{userSummary.total_scans || 0}</p>
                </div>
                <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Cases Created</p>
                  <p className="text-xl font-bold text-blue-400">{userSummary.cases_created || 0}</p>
                </div>
                <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Critical Threats</p>
                  <p className="text-xl font-bold text-rose-400">{userSummary.critical_threats || 0}</p>
                </div>
                <div className="p-3 bg-[#0B101D] border border-[#23314D] rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Account Status</p>
                  <p className="text-xl font-bold text-emerald-400">ACTIVE</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No activity data recorded for this user.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
