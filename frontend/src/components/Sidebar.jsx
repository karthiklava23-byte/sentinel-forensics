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
  Plus,
  Terminal,
  Activity
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
        { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard, badge: 'Live' }
      ]
    },
    {
      title: 'Incident Operations',
      items: [
        ...(role === 'analyst' || role === 'admin'
          ? [{ name: 'Rule & Log Analytics', path: '/analyst', icon: Crosshair, badge: 'DFIR' }]
          : []),
        ...(role === 'investigator' || role === 'admin'
          ? [{ name: 'Cases & Incidents', path: '/cases', icon: FolderGit2, count: '12' }]
          : [])
      ]
    },
    {
      title: 'Forensic Triage Suite',
      items: [
        { name: 'Email Header Inspector', path: '/email-forensics', icon: Mail },
        { name: 'Domain & Web Sandbox', path: '/url-forensics', icon: Globe },
        { name: 'PCAP Packet Triage', path: '/network-forensics', icon: Network, badge: 'PCAP' },
        { name: 'PE Malware Sandbox', path: '/malware-forensics', icon: Bug, badge: 'YARA' },
        { name: 'IOC Threat Intelligence', path: '/threat-intelligence', icon: ShieldCheck }
      ]
    }
  ];

  if (role === 'admin') {
    groups.push({
      title: 'System Admin',
      items: [
        { name: 'System Administration', path: '/admin', icon: Settings },
        { name: 'User Access Directory', path: '/admin/users', icon: Users }
      ]
    });
  }

  return (
    <>
      <aside className="w-64 bg-[#0F172A] border-r border-[#23314D] shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between font-sans text-xs">
        <div className="space-y-6">
          {/* Action CTA Button */}
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Incident Case</span>
          </button>

          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-cyan-400">
                          {item.badge}
                        </span>
                      )}
                      {item.count && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-[9px] font-mono text-blue-300 border border-blue-500/30">
                          {item.count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Forensic Engine Status Telemetry Card */}
          <div className="p-3 rounded-lg bg-[#0B101D] border border-[#23314D] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Forensic Engine</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">WAL Mode</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Telemetry Feed</span>
              <span className="text-emerald-400 font-semibold">100% Online</span>
            </div>
          </div>
        </div>

        {/* Footer Role Badge */}
        <div className="pt-3 border-t border-[#23314D] text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="font-semibold text-slate-300">{BRAND_CONFIG.shortName} SOC</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 capitalize font-bold">
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
