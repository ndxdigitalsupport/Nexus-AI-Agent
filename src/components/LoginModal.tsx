import React, { useState } from 'react';
import { useStore } from '@/store';
import { X, Lock, Sparkles, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    loginUser(username, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel border border-white/15 bg-slate-900/90 shadow-2xl p-6 md:p-7 backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-glow-cyan shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text">Sign In to Account</h3>
            <p className="text-xs text-text-muted">Enter your account credentials to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Username / Email</label>
            <input
              type="text"
              placeholder="e.g. admin or user@company.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 font-sans"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-primary text-slate-950 font-bold text-xs font-mono shadow-glow-cyan hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
}
