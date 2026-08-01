import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, LogOut, Terminal, Activity, Monitor, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { BRAND_CONFIG } from '../config/brand';

const Navbar = ({ viewMode, setViewMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c1019]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-cyber-glow">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base sm:text-lg text-slate-100 tracking-wider">
              {BRAND_CONFIG.shortName}<span className="text-cyan-400"> {BRAND_CONFIG.accentText}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-semibold hidden sm:inline">
              {BRAND_CONFIG.version}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden md:block">{BRAND_CONFIG.tagline}</p>
        </div>
      </div>

      {/* View Mode Switcher Options (PC View vs Mobile View) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg font-mono text-[11px]">
        <button
          onClick={() => setViewMode && setViewMode('pc')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'pc'
              ? 'bg-cyan-500 text-black font-bold shadow-cyber-glow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Force Desktop/PC Layout"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PC VIEW</span>
        </button>
        <button
          onClick={() => setViewMode && setViewMode('mobile')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'mobile'
              ? 'bg-purple-500 text-black font-bold shadow-neon-purple'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Force Mobile Browser Layout"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">MOBILE VIEW</span>
        </button>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{user.full_name || user.username}</p>
              <p className="text-[10px] font-mono text-cyan-400 uppercase">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout System"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-mono text-cyan-400 border border-cyan-500/40 rounded hover:bg-cyan-500/10"
          >
            LOGIN
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
