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
          ? [{ name: 'Analyst Operations', path: '/analyst', icon: Crosshair }]
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
        { name: 'User Directory',      path: '/admin/users', icon: Users }
      ]
    });
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between font-sans">
        <div className="space-y-6">
          {/* Quick Action CTA Button */}
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Incident Case</span>
          </button>

          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
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
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#0F172A] text-white font-bold shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Engine Health Card */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#064E3B] font-bold">
              <Cpu className="w-4 h-4 text-[#064E3B]" />
              <span>Forensic Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Legal chain of custody and correlation online.
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#064E3B] h-full w-full"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Database: WAL Mode</span>
              <span className="text-[#064E3B] font-bold">Ready</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="font-semibold text-slate-700">{BRAND_CONFIG.shortName} SOC</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] capitalize font-bold">
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
