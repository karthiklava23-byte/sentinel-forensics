import React, { useState } from 'react';
import { Shield, LogOut, Monitor, Smartphone, FileText, Search, User, ChevronDown, Activity, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';

const Navbar = ({ viewMode, setViewMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'SOC Control Room';
    if (path.startsWith('/cases')) return 'Incident Workbench';
    if (path === '/analyst') return 'Rule & Log Analytics';
    if (path === '/email-forensics') return 'Email Header Inspector';
    if (path === '/url-forensics') return 'Domain & Web Sandbox';
    if (path === '/network-forensics') return 'PCAP Packet Triage';
    if (path === '/malware-forensics') return 'PE Malware Sandbox';
    if (path === '/threat-intelligence') return 'IOC Intelligence Hub';
    if (path.startsWith('/admin')) return 'System Audit & Access';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-[#23314D] bg-[#0F172A] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between font-sans shadow-md">
      {/* Brand logo & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:border-blue-400 transition-all">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight font-sans">
                {BRAND_CONFIG.shortName} <span className="text-cyan-400 font-mono text-xs font-semibold uppercase">{BRAND_CONFIG.accentText}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold hidden sm:inline-block">
                {BRAND_CONFIG.version}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block font-mono">Enterprise DFIR & SOC Platform</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-700/60 text-xs font-mono">
          <span className="text-slate-500">Scope /</span>
          <span className="text-slate-200 font-semibold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-md w-full mx-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search incident ID, IOC hash, IP, domain..."
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#0B101D] border border-[#23314D] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 pointer-events-none font-semibold flex items-center gap-1">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </form>

      {/* Right Telemetry & User Controls */}
      <div className="flex items-center gap-3">
        {/* Live Operational Status */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>SOC Active</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 bg-[#0B101D] border border-[#23314D] rounded-lg text-xs">
          <button
            onClick={() => setViewMode && setViewMode('pc')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all text-xs font-medium ${
              viewMode === 'pc'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode && setViewMode('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all text-xs font-medium ${
              viewMode === 'mobile'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* System Manual PDF Download */}
        <a
          href="/api/system/download-manual-pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          title="Download Technical Forensic Manual"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Manual</span>
        </a>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 pl-2 rounded-lg bg-[#0B101D] border border-[#23314D] hover:border-slate-500 transition-all text-left"
            >
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-200 leading-none">{user.full_name || user.username}</p>
                <p className="text-[9px] text-cyan-400 font-mono capitalize mt-0.5">{user.role || 'Investigator'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-[#23314D] rounded-lg shadow-2xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-800 sm:hidden">
                  <p className="font-semibold text-xs text-slate-200">{user.full_name || user.username}</p>
                  <p className="text-[10px] text-cyan-400 font-mono capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/cases'); }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  My Incidents
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
