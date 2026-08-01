import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Mail,
  Globe,
  Network,
  FileText,
  Settings,
  Cpu,
  Bug,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brand';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard',              path: '/',                   icon: LayoutDashboard },
    { name: 'Cases & Incidents',      path: '/cases',              icon: FolderGit2 },
    { name: 'Email Forensics',        path: '/email-forensics',    icon: Mail },
    { name: 'URL Threat Analysis',    path: '/url-forensics',      icon: Globe },
    { name: 'Network PCAP Forensics', path: '/network-forensics',  icon: Network },
    { name: 'Malware Forensics',      path: '/malware-forensics',  icon: Bug },
    { name: 'Threat Intelligence',    path: '/threat-intelligence', icon: ShieldCheck },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Control Panel', path: '/admin', icon: Settings });
  }

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-mono text-slate-500 font-semibold tracking-wider uppercase mb-2">
            FORENSIC MODULES
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shadow-cyber-glow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Gemini AI Engine Status Card */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-purple-900/40 font-mono text-xs">
          <div className="flex items-center gap-2 text-purple-400 mb-1 font-semibold">
            <Cpu className="w-4 h-4" />
            <span>Gemini AI Correlation</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            5-module IOC correlation engine active. AI-powered forensic analysis ready.
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 h-full w-full animate-pulse"></div>
          </div>
          <p className="text-[9px] text-purple-500 mt-1.5">GEMINI AI INVESTIGATION ASSISTANT</p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-center">
        <p>{BRAND_CONFIG.shortName} DFIR SYSTEM</p>
        <p className="text-[9px] text-slate-600">CLASSIFIED INVESTIGATION TOOL</p>
      </div>
    </aside>
  );
};

export default Sidebar;
