import { Check, Zap, X, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelName?: string;
}

export default function UpgradeModal({ isOpen, onClose, selectedModelName }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950 border border-amber-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] font-sans">
        {/* Glowing Background Orbs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-400/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-5 mx-auto">
          <Crown className="w-7 h-7" />
        </div>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            PRO TIER REQUIRED
          </span>
          <h2 className="text-2xl font-extrabold text-text mt-3">
            Unlock {selectedModelName || 'Premium AI Models'}
          </h2>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            This model is part of the <span className="text-amber-300 font-semibold">NEXUS PRO Tier</span>. Upgrade your plan or log in as Admin to access frontier reasoning models.
          </p>
        </div>

        {/* Pro Benefits Grid */}
        <div className="space-y-3 mb-6 bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-xs font-medium">
          <div className="flex items-center gap-3 text-text">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Access to <b>DeepSeek V4 Pro</b>, <b>Claude Fable 5</b>, & <b>GPT-5.6 Sol</b></span>
          </div>

          <div className="flex items-center gap-3 text-text">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Unlimited <b>4K Ultra HD AI Image Generation</b></span>
          </div>

          <div className="flex items-center gap-3 text-text">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><b>1M Token Context Window</b> for huge codebases & documents</span>
          </div>

          <div className="flex items-center gap-3 text-text">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Priority fast-lane execution & dedicated API throughput</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="https://t.me/aiagentnexusbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)]"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Upgrade to PRO ($19/mo)</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text font-mono text-xs transition-colors"
          >
            Continue with Free Models
          </button>
        </div>
      </div>
    </div>
  );
}
