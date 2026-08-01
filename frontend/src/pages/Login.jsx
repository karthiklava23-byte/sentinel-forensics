import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Terminal } from 'lucide-react';
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
      setError(err.response?.data?.detail || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f1420] border border-cyan-500/30 rounded-2xl shadow-cyber-glow p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-cyber-glow">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-wider text-slate-100">
            {BRAND_CONFIG.shortName} <span className="text-cyan-400">{BRAND_CONFIG.accentText}</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 uppercase">{BRAND_CONFIG.tagline}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">OPERATOR EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">ACCESS TOKEN / PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono tracking-wider shadow-cyber-glow transition-all"
          >
            {loading ? 'AUTHENTICATING SYSTEM...' : 'AUTHENTICATE & ENTER'}
          </button>
        </form>

        <p className="text-center font-mono text-xs text-slate-500 pt-2">
          Need access? <Link to="/register" className="text-cyan-400 hover:underline">Register Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
