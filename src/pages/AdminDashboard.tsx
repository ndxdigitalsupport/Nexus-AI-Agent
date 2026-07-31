import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';
import { ShieldCheck, Users, Database, RefreshCw, Search, Activity, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminProfile {
  id: string;
  email: string | null;
  role: string | null;
  plan: string | null;
  created_at: number | string | null;
}

interface AdminTask {
  id: string;
  user_id: string;
  title: string;
  completed: boolean | null;
  created_at: number | string | null;
  due_date: number | null;
  priority: string | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useStore();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false })
      ]);

      if (pRes.data) setProfiles(pRes.data);
      if (tRes.data) setTasks(tRes.data);
    } catch (err) {
      console.warn("Supabase fetch notice in Admin panel:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handles both numeric epoch timestamps and ISO date strings from Supabase.
  const formatDate = (value: string | number | null): string => {
    if (!value) return 'Recent';
    const num = typeof value === 'number' ? value : Number(value);
    const date = isNaN(num) ? new Date(value) : new Date(num);
    return isNaN(date.getTime()) ? 'Recent' : date.toLocaleString();
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (!isAdminAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#070913]">
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-4 shadow-glow-cyan">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-mono text-text mb-2">Admin Portal Restricted</h2>
        <p className="text-sm text-text-muted max-w-md mb-6 font-mono">
          You must be logged in as an Admin to inspect live user activity, cloud databases, and session metrics.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm font-mono shadow-glow-cyan hover:brightness-110 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Workspace</span>
        </button>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070913] overflow-y-auto custom-scrollbar p-4 sm:p-8 text-text font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono neon-text tracking-wider">ADMIN CONTROL CENTER</h1>
              <p className="text-xs text-text-muted font-mono mt-0.5">Live Supabase Database Monitoring & User Activity Insights</p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 font-mono text-xs flex items-center gap-2 transition-all shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{loading ? 'Refreshing Cloud...' : 'Refresh Activity'}</span>
        </button>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Registered Accounts</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">{profiles.length}</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">● Real-time Supabase Auth</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Active Action Tasks</span>
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300">{tasks.length}</div>
          <span className="text-[11px] text-emerald-400/80 font-mono mt-1 block">● Synced Project Board</span>
        </div>
      </div>

      {/* User Accounts Section */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 bg-slate-900/40 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold font-mono text-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Registered Workspace Users</span>
          </h2>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-text placeholder:text-text-muted/50 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-4">User Email</th>
                <th className="pb-3 px-4">Role</th>
                <th className="pb-3 px-4">Plan Tier</th>
                <th className="pb-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-muted">
                    No users registered in database yet.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-300">{p.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        p.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/10 text-text-muted'
                      }`}>
                        {p.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        p.plan === 'pro' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {p.plan || 'free'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
