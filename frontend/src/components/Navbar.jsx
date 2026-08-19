import React, { useState } from 'react';
import { Shield, LogOut, Monitor, Smartphone, FileText, Search, Activity, User, Bell, ChevronDown } from 'lucide-react';
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

  // Humanized breadcrumb calculation
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'SOC Overview';
    if (path.startsWith('/cases')) return 'Incident Management';
    if (path === '/analyst') return 'Analyst Workspace';
    if (path === '/email-forensics') return 'Email Analysis';
    if (path === '/url-forensics') return 'URL Threat Analysis';
    if (path === '/network-forensics') return 'Network PCAP Inspection';
    if (path === '/malware-forensics') return 'Malware Static Analysis';
    if (path === '/threat-intelligence') return 'Threat Intelligence Hub';
    if (path.startsWith('/admin')) return 'Administration';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c1019]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Brand logo & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight">
                {BRAND_CONFIG.shortName} <span className="text-blue-400 font-bold">{BRAND_CONFIG.accentText}</span>
              </span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium hidden sm:inline-block">
                {BRAND_CONFIG.version}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">{BRAND_CONFIG.tagline}</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Platform /</span>
          <span className="text-slate-200 font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center Command Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-md w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search incidents, IOC hashes, domain names..."
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#121724] border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-sans text-slate-500 bg-[#1a2234] rounded border border-slate-700 pointer-events-none">
          Ctrl K
        </kbd>
      </form>

      {/* Operational Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* System Health */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121724] border border-slate-800 text-slate-300 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">System:</span>
          <span className="text-emerald-400 font-medium">Healthy</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-[#121724] border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setViewMode && setViewMode('pc')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs ${
              viewMode === 'pc'
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode && setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs ${
              viewMode === 'mobile'
                ? 'bg-purple-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* System Manual PDF */}
        <a
          href="/api/system/download-manual-pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121724] hover:bg-[#192133] text-blue-400 border border-blue-500/20 text-xs font-medium transition-all"
          title="Download System PDF Manual"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Manual</span>
        </a>

        {/* User Profile Pill */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-[#121724] border border-slate-800 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-200 leading-none">{user.full_name || user.username}</p>
                <p className="text-[10px] text-blue-400 font-medium capitalize mt-0.5">{user.role || 'Investigator'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#121724] border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-800 sm:hidden">
                  <p className="font-semibold text-xs text-slate-200">{user.full_name || user.username}</p>
                  <p className="text-[10px] text-blue-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/cases'); }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-[#1a2234] hover:text-white flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  My Incidents
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
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
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
