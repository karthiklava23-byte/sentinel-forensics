import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brand';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid authentication credentials. Check email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-sm tracking-tight">{BRAND_CONFIG.shortName}</span>
            <span className="text-xs text-blue-400 font-semibold ml-1.5">{BRAND_CONFIG.accentText}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Platform Online
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="soc-card p-8 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Security Gateway Authentication</h1>
            <p className="text-xs text-slate-400">Sign in to access your role-based security workspace</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg flex items-start gap-2">
              <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Operator Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full bg-[#0a0d13] border border-[#1e2638] rounded-lg pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0d13] border border-[#1e2638] rounded-lg pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Operator...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#1e2638] flex items-center justify-between text-xs text-slate-400">
            <span>New operator?</span>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Register Account &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-500 font-mono">
        SENTINEL AI Digital Forensics & Security Operations Platform &bull; Restricted SOC Access
      </div>
    </div>
  );
};

export default Login;
