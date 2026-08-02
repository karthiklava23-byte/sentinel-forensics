import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, Mail, Globe, Bug, Network, FolderGit2, Activity, ArrowLeft } from 'lucide-react';
import { adminAPI, analyticsAPI } from '../services/api';

const SCAN_TYPE_ICON = {
  URL:     <Globe className="w-3 h-3" />,
  EMAIL:   <Mail className="w-3 h-3" />,
  MALWARE: <Bug className="w-3 h-3" />,
  PCAP:    <Network className="w-3 h-3" />,
};

const SCAN_TYPE_COLOR = {
  URL:     'text-blue-400 bg-blue-950/60 border-blue-800/50',
  EMAIL:   'text-cyan-400 bg-cyan-950/60 border-cyan-800/50',
  MALWARE: 'text-red-400 bg-red-950/60 border-red-800/50',
  PCAP:    'text-purple-400 bg-purple-950/60 border-purple-800/50',
};

const RoleBadge = ({ role }) => {
  const cls = role === 'admin'
    ? 'bg-amber-950/60 text-amber-400 border-amber-700/50'
    : 'bg-slate-800 text-slate-300 border-slate-700';
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${cls}`}>
      {role || 'user'}
    </span>
  );
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
    <div className="p-6 space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          {selected && (
            <button
              onClick={() => { setSelected(null); setUserSummary(null); }}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Users className="w-6 h-6 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold font-mono text-slate-100">
              {selected ? `USER DASHBOARD — ${selected.email}` : 'USER MANAGEMENT & DASHBOARDS'}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {selected ? 'Viewing this user\'s personal activity and scan history' : 'Admin view: browse each user\'s individual dashboard and activity'}
            </p>
          </div>
        </div>
      </div>

      {/* User List */}
      {!selected && (
        <div className="space-y-2">
          {loadingUsers ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin" /> Loading users...
            </div>
          ) : users.length === 0 ? (
            <p className="text-slate-600 font-mono text-sm text-center py-10">No users found.</p>
          ) : users.map((u) => (
            <button
              key={u.id || u.email}
              onClick={() => openUser(u)}
              className="w-full flex items-center gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-cyan-800/60 hover:bg-slate-800/40 transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(u.full_name || u.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-slate-200 truncate">{u.full_name || '—'}</p>
                  <RoleBadge role={u.role} />
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
              </div>
              <p className="text-[10px] text-slate-600 font-mono shrink-0 hidden sm:block">
                Joined: {u.created_at?.slice(0, 10) || 'Unknown'}
              </p>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* User Detail Dashboard */}
      {selected && (
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="flex items-center gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {(selected.full_name || selected.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-mono font-bold text-slate-100">{selected.full_name || 'Unnamed User'}</p>
              <p className="text-sm text-slate-400 font-mono">{selected.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={selected.role} />
                <span className="text-[10px] text-slate-600 font-mono">Joined: {selected.created_at?.slice(0, 10)}</span>
              </div>
            </div>
          </div>

          {loadingDetail ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin" /> Loading user data...
            </div>
          ) : userSummary && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'TOTAL CASES',    value: userSummary.total_cases,    icon: FolderGit2, color: 'text-cyan-400' },
                  { label: 'EVIDENCE FILES', value: userSummary.total_evidence,  icon: Activity,   color: 'text-emerald-400' },
                  { label: 'TOTAL SCANS',    value: userSummary.total_scans,     icon: Globe,      color: 'text-blue-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-slate-100">{value}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Cases */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" /> RECENT CASES
                  </h3>
                  <div className="space-y-2">
                    {userSummary.recent_cases?.length === 0 && (
                      <p className="text-slate-600 text-[11px] font-mono">No cases yet.</p>
                    )}
                    {userSummary.recent_cases?.map((c, i) => (
                      <div key={c.id || i} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                        <div>
                          <p className="text-cyan-400 font-mono font-bold">{c.case_number}</p>
                          <p className="text-slate-300 truncate max-w-[180px]">{c.title}</p>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scan History */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-mono font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> SCAN HISTORY
                  </h3>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {userSummary.recent_scans?.length === 0 && (
                      <p className="text-slate-600 text-[11px] font-mono">No scans yet.</p>
                    )}
                    {userSummary.recent_scans?.map((s, i) => {
                      const riskColor = s.risk_score >= 75 ? 'text-red-400' : s.risk_score >= 50 ? 'text-orange-400' : s.risk_score >= 25 ? 'text-yellow-400' : 'text-emerald-400';
                      return (
                        <div key={s.id || i} className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                          <span className={`shrink-0 px-1.5 py-0.5 rounded border font-mono font-bold text-[9px] flex items-center gap-1 ${SCAN_TYPE_COLOR[s.scan_type] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                            {SCAN_TYPE_ICON[s.scan_type]} {s.scan_type}
                          </span>
                          <span className="text-slate-300 truncate flex-1 font-mono">{s.target}</span>
                          <span className={`shrink-0 font-bold font-mono ${riskColor}`}>{s.risk_score}%</span>
                          <span className="shrink-0 text-[9px] text-slate-500">{s.scanned_at?.slice(0, 16)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
