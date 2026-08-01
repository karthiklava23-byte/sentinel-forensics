import React from 'react';
import { Shield, Bell, User, LogOut, Terminal, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { BRAND_CONFIG } from '../config/brand';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c1019]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-cyber-glow">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-slate-100 tracking-wider">
              {BRAND_CONFIG.shortName}<span className="text-cyan-400"> {BRAND_CONFIG.accentText}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-semibold">
              {BRAND_CONFIG.version}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">{BRAND_CONFIG.tagline}</p>
        </div>
      </div>

      {/* Live System Telemetry Status */}
      <div className="hidden md:flex items-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>AI ENGINE: <span className="text-emerald-400 font-semibold">ONLINE</span></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>CORRELATION DB: <span className="text-cyan-400 font-semibold">ACTIVE</span></span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user.full_name || user.username}</p>
              <p className="text-[10px] font-mono text-cyan-400 uppercase">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout System"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-xs font-mono text-cyan-400 border border-cyan-500/40 rounded hover:bg-cyan-500/10"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
