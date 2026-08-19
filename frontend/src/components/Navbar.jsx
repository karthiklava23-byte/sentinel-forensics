import React, { useState } from 'react';
import { Shield, LogOut, Monitor, Smartphone, FileText, Search, User, ChevronDown, Activity, Command, Crosshair, Settings, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/brand';

const WORKSTATION_MODES = [
  {
    id: 'investigator',
    label: 'Incident Investigator',
    short: 'Investigator',
    icon: Shield,
    color: 'text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/30',
    activeBg: 'bg-[#2563EB] text-white',
    defaultRoute: '/cases'
  },
  {
    id: 'analyst',
    label: 'Technical Analyst',
    short: 'Analyst',
    icon: Crosshair,
    color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
    activeBg: 'bg-[#06B6D4] text-white',
    defaultRoute: '/network-forensics'
  },
  {
    id: 'admin',
    label: 'System Admin',
    short: 'System Admin',
    icon: Settings,
    color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
    activeBg: 'bg-[#EF4444] text-white',
    defaultRoute: '/admin'
  }
];

const Navbar = ({ viewMode, setViewMode, workstationMode, setWorkstationMode }) => {
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

  const handleSwitchWorkstation = (modeObj) => {
    if (setWorkstationMode) {
      setWorkstationMode(modeObj.id);
    }
    navigate(modeObj.defaultRoute);
  };

  const activeWorkstation = WORKSTATION_MODES.find(m => m.id === workstationMode) || WORKSTATION_MODES[0];
  const ActiveIcon = activeWorkstation.icon;

  return (
    <header className="h-16 border-b border-[#23314D] bg-[#0F172A] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between font-sans shadow-md">
      {/* Left Brand logo & Workstation Mode Selector */}
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
            <p className="text-[10px] text-slate-400 hidden md:block font-mono">Enterprise DFIR Platform</p>
          </div>
        </div>

        {/* Top Main Menu Workstation Switcher Buttons */}
        <div className="hidden lg:flex items-center p-1 bg-[#0B101D] border border-[#23314D] rounded-lg gap-1 font-mono text-xs">
          {WORKSTATION_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = workstationMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSwitchWorkstation(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all text-xs font-semibold ${
                  isActive
                    ? mode.activeBg + ' shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={`Switch to ${mode.label} Workstation View`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative max-w-sm w-full mx-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search incident ID, IOC hash, domain..."
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#0B101D] border border-[#23314D] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 pointer-events-none font-semibold flex items-center gap-1">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </form>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* Active Workstation Indicator Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono font-semibold ${activeWorkstation.color}`}>
          <ActiveIcon className="w-3.5 h-3.5" />
          <span>{activeWorkstation.short} Mode</span>
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

        {/* User Profile Pill */}
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
              <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-[#23314D] rounded-lg shadow-2xl py-1.5 z-50 font-mono text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-200">{user.full_name || user.username}</p>
                  <p className="text-[10px] text-cyan-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/cases'); }}
                  className="w-full px-3.5 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  My Incident Board
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold transition-colors"
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
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm font-mono"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
