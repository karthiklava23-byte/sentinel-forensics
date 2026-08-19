import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, Mail, Globe, Bug, Network, FolderGit2, Activity, ArrowLeft } from 'lucide-react';
import { adminAPI, analyticsAPI } from '../services/api';

const SCAN_TYPE_ICON = {
  URL:     <Globe className="w-3.5 h-3.5" />,
  EMAIL:   <Mail className="w-3.5 h-3.5" />,
  MALWARE: <Bug className="w-3.5 h-3.5" />,
  PCAP:    <Network className="w-3.5 h-3.5" />,
};

const SCAN_TYPE_COLOR = {
  URL:     'text-blue-400 bg-blue-500/10 border-blue-500/20',
  EMAIL:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
  MALWARE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PCAP:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const RoleBadge = ({ role }) => {
  const cls = role === 'admin'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-[#182133] text-slate-300 border-slate-700';
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium capitalize ${cls}`}>
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
    <div className="p-6 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          {selected && (
            <button
              onClick={() => { setSelected(null); setUserSummary(null); }}
              className="p-2 rounded-xl bg-[#121724] border border-slate-800 hover:bg-[#182033] text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {selected ? `User Dashboard — ${selected.email}` : 'User Management & Operator Dashboards'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {selected ? 'Viewing user\'s personal activity, cases, and scan history' : 'Admin directory: inspect individual operator activity and assigned cases'}
            </p>
          </div>
        </div>
      </div>

      {/* User List */}
      {!selected && (
        <div className="space-y-2.5">
          {loadingUsers ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-amber-400" /> Loading user directory...
            </div>
          ) : users.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-10">No users found.</p>
          ) : users.map((u) => (
            <button
              key={u.id || u.email}
              onClick={() => openUser(u)}
              className="w-full flex items-center gap-4 p-4 soc-card-interactive text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                {(u.full_name || u.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-100 truncate">{u.full_name || '—'}</p>
                  <RoleBadge role={u.role} />
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{u.email}</p>
              </div>
              <p className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:block">
                Joined: {u.created_at?.slice(0, 10) || 'Unknown'}
              </p>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* User Detail Dashboard */}
      {selected && (
        <div className="space-y-6 text-xs">
          {/* Identity Card */}
          <div className="flex items-center gap-4 p-5 soc-card">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
              {(selected.full_name || selected.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-base font-bold text-slate-100">{selected.full_name || 'Unnamed User'}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selected.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <RoleBadge role={selected.role} />
                <span className="text-[11px] text-slate-500 font-mono">Joined: {selected.created_at?.slice(0, 10)}</span>
              </div>
            </div>
          </div>

          {loadingDetail ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-blue-400" /> Loading operator data...
            </div>
          ) : userSummary && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Assigned Cases',    value: userSummary.total_cases,    icon: FolderGit2, color: 'text-blue-400' },
                  { label: 'Evidence Files',    value: userSummary.total_evidence,  icon: Activity,   color: 'text-emerald-400' },
                  { label: 'Total Scans',       value: userSummary.total_scans,     icon: Globe,      color: 'text-purple-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="soc-card p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-[#0c1019] border border-slate-800 flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-slate-100">{value}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Cases */}
                <div className="soc-card p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-blue-400" /> Recent Cases
                  </h3>
                  <div className="space-y-2">
                    {userSummary.recent_cases?.length === 0 && (
                      <p className="text-slate-500 text-xs">No cases created yet.</p>
                    )}
                    {userSummary.recent_cases?.map((c, i) => (
                      <div key={c.id || i} className="flex items-center justify-between p-3 bg-[#0c1019] rounded-xl border border-slate-800 text-xs">
                        <div>
                          <p className="text-blue-400 font-mono font-semibold">{c.case_number}</p>
                          <p className="text-slate-200 truncate max-w-[200px] font-medium mt-0.5">{c.title}</p>
                        </div>
                        <span className="text-slate-400 text-[10px] capitalize px-2 py-0.5 bg-[#182133] rounded-full border border-slate-700">{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scan History */}
                <div className="soc-card p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" /> Recent Scan History
                  </h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {userSummary.recent_scans?.length === 0 && (
                      <p className="text-slate-500 text-xs">No scans recorded yet.</p>
                    )}
                    {userSummary.recent_scans?.map((s, i) => {
                      const riskColor = s.risk_score >= 75 ? 'text-rose-400' : s.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400';
                      return (
                        <div key={s.id || i} className="flex items-center gap-2.5 p-2.5 bg-[#0c1019] rounded-xl border border-slate-800 text-xs">
                          <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1.5 ${SCAN_TYPE_COLOR[s.scan_type] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                            {SCAN_TYPE_ICON[s.scan_type]} {s.scan_type}
                          </span>
                          <span className="text-slate-200 truncate flex-1 font-mono text-[11px]">{s.target}</span>
                          <span className={`shrink-0 font-bold font-mono ${riskColor}`}>{s.risk_score}%</span>
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
