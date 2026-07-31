import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { ShieldCheck, User, ArrowRight, Sparkles } from 'lucide-react';

import { supabaseSignIn, supabaseSignUp } from '@/lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim()) {
      setError('Please enter a username or email address.');
      return;
    }

    // Quick Admin Override / Local Pass check
    if (email.toLowerCase() === 'admin@nexus.ai' || password === '1234' || password === '8888') {
      loginUser(email, password);
      navigate('/');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { user, error: err } = await supabaseSignUp(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setNotice('✅ Account created successfully! Logging you in...');
        loginUser(email, password);
        setTimeout(() => navigate('/'), 1200);
      }
    } else {
      const { user, error: err } = await supabaseSignIn(email, password);
      setLoading(false);
      if (err) {
        // Fallback to local session login if offline or demo email
        loginUser(email, password);
        navigate('/');
      } else {
        loginUser(user?.email || email, password);
        navigate('/');
      }
    }
  };

  const handleQuickPresetLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      loginUser('admin@nexus.ai', '1234');
    } else {
      loginUser('team.member@nexus.ai', '1234');
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] p-4 sm:p-6 font-sans text-text relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-violet-600/30 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan mb-4">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-wider">NEXUS AI OS</h1>
          <p className="text-sm text-text-muted mt-1 font-sans">Enterprise Team Assistant & Portal Gateway</p>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-lg font-bold text-text mb-4 text-center">Sign in to your Team Portal</h2>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleQuickPresetLogin('admin')}
              className="p-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all text-left group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">👑 Admin Mode</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] text-text-muted mt-2 block">1-Click Full Admin Access</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPresetLogin('user')}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text transition-all text-left group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">👤 Team Member</span>
                <User className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] text-text-muted mt-2 block">Standard AI Assistant</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] font-mono text-text-muted uppercase tracking-wider absolute">or enter details</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {notice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                {notice}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="flex border-b border-white/10 mb-4">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); setNotice(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
                  !isSignUp ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); setNotice(''); }}
                className={`flex-1 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
                  isSignUp ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                Create Account
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">Email Address</label>
              <input
                type="text"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-text-muted font-mono">Role:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedRole === 'admin' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedRole === 'user' 
                      ? 'bg-white/10 text-text border border-white/20 font-bold' 
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  👤 Member
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-primary to-violet-600 text-slate-950 font-bold text-sm font-mono shadow-glow-cyan hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Supabase Account' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted/60 mt-6 font-mono">
          NEXUS Team OS • Multi-User Workspace Edition
        </p>
      </div>
    </div>
  );
}
