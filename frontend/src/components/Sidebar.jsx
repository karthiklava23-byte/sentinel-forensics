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
  Activity,
  Shield,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brand';
import CaseModal from './CaseModal';

const WORKSTATION_CONFIG = {
  investigator: {
    title: 'Incident Investigator Suite',
    badge: 'Investigator',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    groups: [
      {
        title: 'Core Workstation',
        items: [
          { name: 'SOC Control Room', path: '/', icon: LayoutDashboard },
          { name: 'Incident Board', path: '/cases', icon: FolderGit2, count: '12' }
        ]
      },
      {
        title: 'Investigative Tools',
        items: [
          { name: 'Email Header Inspector', path: '/email-forensics', icon: Mail },
          { name: 'Domain & Web Sandbox', path: '/url-forensics', icon: Globe },
          { name: 'IOC Threat Intelligence', path: '/threat-intelligence', icon: ShieldCheck }
        ]
      }
    ]
  },
  analyst: {
    title: 'Technical Analyst Suite',
    badge: 'Analyst',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    groups: [
      {
        title: 'Core Workstation',
        items: [
          { name: 'SOC Control Room', path: '/', icon: LayoutDashboard },
          { name: 'Rule & Log Analytics', path: '/analyst', icon: Crosshair, badge: 'YARA' }
        ]
      },
      {
        title: 'DFIR Deep Inspection Engines',
        items: [
          { name: 'PCAP Packet Triage', path: '/network-forensics', icon: Network, badge: 'PCAP' },
          { name: 'PE Malware Static Sandbox', path: '/malware-forensics', icon: Bug, badge: 'PE' },
          { name: 'IOC Threat Intelligence', path: '/threat-intelligence', icon: ShieldCheck }
        ]
      }
    ]
  },
  admin: {
    title: 'System Admin Workstation',
    badge: 'Admin Mode',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    groups: [
      {
        title: 'Control & Configuration',
        items: [
          { name: 'SOC Control Room', path: '/', icon: LayoutDashboard },
          { name: 'System Administration', path: '/admin', icon: Settings },
          { name: 'User Access Directory', path: '/admin/users', icon: Users }
        ]
      },
      {
        title: 'System Telemetry',
        items: [
          { name: 'IOC Threat Intelligence', path: '/threat-intelligence', icon: ShieldCheck }
        ]
      }
    ]
  }
};

const Sidebar = ({ workstationMode = 'investigator' }) => {
  const { user } = useAuth();
  const role = user?.role || 'investigator';
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const navigate = useNavigate();

  const activeConfig = WORKSTATION_CONFIG[workstationMode] || WORKSTATION_CONFIG.investigator;

  return (
    <>
      <aside className="w-64 bg-[#0F172A] border-r border-[#23314D] shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between font-sans text-xs">
        <div className="space-y-6">
          {/* Workstation Header Badge */}
          <div className="p-3 rounded-lg bg-[#0B101D] border border-[#23314D] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Workstation</span>
              <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold border ${activeConfig.badgeColor}`}>
                {activeConfig.badge}
              </span>
            </div>
            <p className="font-semibold text-slate-200 text-xs">{activeConfig.title}</p>
          </div>

          {/* Action CTA Button */}
          {workstationMode === 'investigator' && (
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Incident Case</span>
            </button>
          )}

          {activeConfig.groups.map((group, gIdx) => (
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
        </div>

        {/* Engine Status Card */}
        <div className="pt-3 border-t border-[#23314D] space-y-2">
          <div className="p-2.5 rounded bg-[#0B101D] border border-[#23314D] text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 animate-pulse" /> Telemetry Mode
              </span>
              <span className="text-[9px] text-slate-400">WAL DB</span>
            </div>
            <p className="text-[10px] text-slate-400">Real-time DB persistence online</p>
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
            <span>{BRAND_CONFIG.shortName} SOC</span>
            <span className="capitalize text-cyan-400 font-bold">{role}</span>
          </div>
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
