import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/15 shadow-2xl space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${
            type === 'danger'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-glow-red'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-glow-violet'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-text font-mono">{title}</h3>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-text hover:bg-white/10 font-semibold text-xs transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === 'danger'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110 shadow-glow-red'
                : 'bg-gradient-to-r from-primary to-cyan-400 text-slate-950 hover:brightness-110 shadow-glow-cyan'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
