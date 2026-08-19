import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  Globe,
  Network,
  Settings,
  Cpu,
  Bug,
  ShieldCheck,
  Crosshair,
  Users,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brand';
import CaseModal from './CaseModal';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'investigator';
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const navigate = useNavigate();

  const groups = [
    {
      title: 'Overview',
      items: [
        { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Incident Management',
      items: [
        ...(role === 'analyst' || role === 'admin'
          ? [{ name: 'Analyst Workspace', path: '/analyst', icon: Crosshair }]
          : []),
        ...(role === 'investigator' || role === 'admin'
          ? [{ name: 'Cases & Incidents', path: '/cases', icon: FolderGit2 }]
          : [])
      ]
    },
    {
      title: 'DFIR Forensic Engines',
      items: [
        { name: 'Email Forensics',        path: '/email-forensics',    icon: Mail },
        { name: 'URL Threat Analysis',    path: '/url-forensics',      icon: Globe },
        { name: 'Network PCAP Forensics', path: '/network-forensics',  icon: Network },
        { name: 'Malware Forensics',      path: '/malware-forensics',  icon: Bug },
        { name: 'Threat Intelligence',    path: '/threat-intelligence', icon: ShieldCheck }
      ]
    }
  ];

  if (role === 'admin') {
    groups.push({
      title: 'Administration',
      items: [
        { name: 'Admin Control Panel', path: '/admin',       icon: Settings },
        { name: 'User Management',     path: '/admin/users', icon: Users }
      ]
    });
  }

  return (
    <>
      <aside className="w-64 bg-[#0c1019] border-r border-slate-800/80 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between font-sans">
        <div className="space-y-6">
          {/* Quick Action CTA */}
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Case / Incident</span>
          </button>

          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 font-semibold pl-2.5 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b29]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-400" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Engine Health Card */}
          <div className="p-3.5 rounded-xl bg-[#121724] border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-blue-400 mb-1.5 font-semibold">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Forensic Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              AI correlation and SQLite database active.
            </p>
            <div className="w-full bg-[#1b2334] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-full"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
              <span>Database: WAL Mode</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-medium text-slate-400">{BRAND_CONFIG.shortName} SOC</span>
          <span className="px-2 py-0.5 rounded-full bg-[#141b29] border border-slate-800 text-slate-300 text-[10px] capitalize font-medium">
            {role}
          </span>
        </div>
      </aside>

      {/* Case Creation Modal */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onCaseCreated={() => navigate('/cases')}
      />
    </>
  );
};

export default Sidebar;
