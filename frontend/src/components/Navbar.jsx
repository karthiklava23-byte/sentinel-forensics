import React, { useState } from 'react';
import { Shield, LogOut, Monitor, Smartphone, FileText, Search, User, ChevronDown } from 'lucide-react';
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
    if (path === '/') return 'SOC Overview';
    if (path.startsWith('/cases')) return 'Incident Management';
    if (path === '/analyst') return 'Analyst Operations';
    if (path === '/email-forensics') return 'Email Analysis';
    if (path === '/url-forensics') return 'URL Threat Analysis';
    if (path === '/network-forensics') return 'Network PCAP Inspection';
    if (path === '/malware-forensics') return 'Malware Static Analysis';
    if (path === '/threat-intelligence') return 'Threat Intelligence Hub';
    if (path.startsWith('/admin')) return 'System Administration';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Brand logo & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-heading font-bold text-lg text-[#0F172A] tracking-tight">
                {BRAND_CONFIG.shortName} <span className="text-[#7F1D1D] font-sans font-semibold text-xs tracking-wider uppercase">{BRAND_CONFIG.accentText}</span>
              </span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#0F172A]/10 text-[#0F172A] border border-[#0F172A]/20 font-semibold hidden sm:inline-block">
                {BRAND_CONFIG.version}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">{BRAND_CONFIG.tagline}</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
          <span className="text-slate-400 font-medium">Platform /</span>
          <span className="text-[#0F172A] font-semibold">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-md w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search incidents, IOC hashes, domain names..."
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]/20 transition-all"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-sans text-slate-500 bg-slate-100 rounded border border-slate-200 pointer-events-none font-semibold">
          Ctrl K
        </kbd>
      </form>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* System Health */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B] text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#064E3B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#064E3B]"></span>
          </span>
          <span>Operational</span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs">
          <button
            onClick={() => setViewMode && setViewMode('pc')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs ${
              viewMode === 'pc'
                ? 'bg-[#0F172A] text-white font-medium shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-[#7F1D1D] text-white font-medium shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-slate-200 text-xs font-semibold transition-all"
          title="Download Legal/Forensic System PDF Manual"
        >
          <FileText className="w-3.5 h-3.5 text-[#7F1D1D]" />
          <span className="hidden md:inline">Manual</span>
        </a>

        {/* User Profile Pill */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-400 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-900 leading-none">{user.full_name || user.username}</p>
                <p className="text-[10px] text-[#7F1D1D] font-bold capitalize mt-0.5">{user.role || 'Investigator'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100 sm:hidden">
                  <p className="font-semibold text-xs text-slate-900">{user.full_name || user.username}</p>
                  <p className="text-[10px] text-[#7F1D1D] capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/cases'); }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  My Incidents
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-left text-xs text-[#7F1D1D] hover:bg-[#7F1D1D]/10 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#7F1D1D]" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F172A] rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
