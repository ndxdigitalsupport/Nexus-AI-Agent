import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import { supabaseUpdatePassword } from '@/lib/supabase';

// Handles the link from Supabase's "reset password" email. Supabase delivers
// a recovery session in the URL fragment (#access_token=...&type=recovery),
// so this page lets the user set a new password with that session.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isRecovery, setIsRecovery] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    setIsRecovery(/#type=recovery/i.test(hash) || /\btype=recovery\b/i.test(hash));
    setChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabaseUpdatePassword(password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] p-4 sm:p-6 font-sans text-text relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-violet-600/30 border border-cyan-500/40 text-cyan-400 shadow-glow-cyan mb-4">
            <KeyRound className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-wider">NEXUS AI OS</h1>
          <p className="text-sm text-text-muted mt-1 font-sans">Reset your password</p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
          {checking ? (
            <p className="text-center text-sm text-text-muted font-mono">Checking link...</p>
          ) : !isRecovery ? (
            <div>
              <p className="text-center text-sm text-text-muted mb-4">
                This link is invalid or expired. Request a new password reset link from the sign-in page.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-primary to-violet-600 text-slate-950 font-bold text-sm font-mono shadow-glow-cyan hover:brightness-110 transition-all"
              >
                Back to NEXUS
              </button>
            </div>
          ) : done ? (
            <p className="text-center text-sm text-emerald-300 font-mono">
              ✅ Password updated! Redirecting you to the app...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-muted uppercase mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted/40 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-primary to-violet-600 text-slate-950 font-bold text-sm font-mono shadow-glow-cyan hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
