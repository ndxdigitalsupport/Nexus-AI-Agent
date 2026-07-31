import React, { useState } from 'react';
import { useStore } from '@/store';
import { X, Lock, Sparkles, LogIn, User, Eye, EyeOff } from 'lucide-react';
import { supabaseSignIn, supabaseSignUp, syncProfileToSupabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginUser } = useStore();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const validEmail = username.includes('@') ? username.trim() : `${username.trim()}@nexus.ai`;

    if (isSignUpMode) {
      const { user, error: err } = await supabaseSignUp(validEmail, password);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        await syncProfileToSupabase(validEmail, 'user');
        loginUser(validEmail, password);
        setLoading(false);
        onClose();
      }
    } else {
      const { user, error: err } = await supabaseSignIn(validEmail, password);
      await syncProfileToSupabase(user?.email || validEmail, 'user');
      setLoading(false);
      loginUser(user?.email || validEmail, password);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/20 bg-slate-950/90 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Centered Glowing Icon Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.25)]">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-text tracking-tight">
            {isSignUpMode ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {isSignUpMode ? 'Join your team workspace today.' : 'Welcome back! Please sign in to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Username / Email Field */}
          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
              USERNAME OR EMAIL
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-text-muted/60 absolute left-3.5" />
              <input
                type="text"
                placeholder="e.g. admin or user@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 font-sans transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-text-muted/60 absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 font-sans transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-text-muted/60 hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          {!isSignUpMode && (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-muted hover:text-text transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your email.')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary Glow Sign In / Sign Up Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-primary text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Signup / Signin Toggle Footer Link */}
        <div className="mt-6 text-center text-xs text-text-muted">
          <span>{isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsSignUpMode(!isSignUpMode);
            }}
            className="text-cyan-400 font-semibold hover:underline"
          >
            {isSignUpMode ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
