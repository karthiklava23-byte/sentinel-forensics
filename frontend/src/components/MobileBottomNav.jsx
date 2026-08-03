import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, Mail, Globe, Network, Bug, Crosshair } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const role = user?.role || 'investigator';

  let tabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  ];

  if (role === 'analyst') {
    tabs.push(
      { name: 'Analyst', path: '/analyst', icon: Crosshair },
      { name: 'Email', path: '/email-forensics', icon: Mail },
      { name: 'URL', path: '/url-forensics', icon: Globe },
      { name: 'PCAP', path: '/network-forensics', icon: Network },
      { name: 'Malware', path: '/malware-forensics', icon: Bug }
    );
  } else if (role === 'investigator') {
    tabs.push(
      { name: 'Cases', path: '/cases', icon: FolderGit2 },
      { name: 'Email', path: '/email-forensics', icon: Mail },
      { name: 'URL', path: '/url-forensics', icon: Globe },
      { name: 'PCAP', path: '/network-forensics', icon: Network },
      { name: 'Malware', path: '/malware-forensics', icon: Bug }
    );
  } else {
    tabs.push(
      { name: 'Analyst', path: '/analyst', icon: Crosshair },
      { name: 'Cases', path: '/cases', icon: FolderGit2 },
      { name: 'Email', path: '/email-forensics', icon: Mail },
      { name: 'URL', path: '/url-forensics', icon: Globe },
      { name: 'PCAP', path: '/network-forensics', icon: Network },
      { name: 'Malware', path: '/malware-forensics', icon: Bug }
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1019]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around font-mono">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px]">{t.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
