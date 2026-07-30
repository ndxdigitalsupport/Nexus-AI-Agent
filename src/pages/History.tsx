import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { MessageSquare, Trash2, Clock, CalendarDays, ArrowRight, CheckCircle2, Edit2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function History() {
  const navigate = useNavigate();
  const { conversations, activeConversationId, loadConversation, deleteConversation, updateConversationTitle } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleLoadConversation = (id: string) => {
    loadConversation(id);
    navigate('/');
  };

  const handleSaveTitle = (id: string, originalTitle: string) => {
    if (editTitle.trim() && editTitle.trim() !== originalTitle) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDeleteConversation = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Conversation',
      message: `Are you sure you want to delete "${title}"? This conversation log will be permanently deleted.`,
      onConfirm: () => {
        deleteConversation(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-8 pb-12">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono neon-text">Conversation History</h1>
            <p className="text-text-muted mt-1">Review, load, or manage past AI chat sessions. Double-click or press F2 to rename.</p>
          </div>
        </div>

        {/* Timeline Cards */}
        <div className="space-y-4">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-white/10">
              <MessageSquare className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
              <p className="text-text-muted font-mono text-base">No conversation history found. Start a new chat from the sidebar!</p>
            </div>
          ) : (
            sortedConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(conv.id);
                    setEditTitle(conv.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'F2') {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingId(conv.id);
                      setEditTitle(conv.title);
                    }
                  }}
                  tabIndex={0}
                  className={`glass-panel p-6 rounded-2xl border transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/10 via-primary/10 to-violet-500/10 border-cyan-400/60 shadow-glow-cyan'
                      : 'bg-slate-950/70 border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-glow-cyan'
                  }`}
                >
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isEditing && handleLoadConversation(conv.id)}>
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-accent'}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(conv.id, conv.title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(conv.id, conv.title);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="bg-slate-950 border border-cyan-400 rounded px-2 py-1 text-base text-text font-bold focus:outline-none"
                        />
                      ) : (
                        <h2 className="text-lg font-bold text-text truncate group-hover:text-primary transition-colors" title="Double-click or press F2 to rename">
                          {conv.title}
                        </h2>
                      )}
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Active Chat
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-primary/70" />
                        <span>Created: {new Date(conv.createdAt).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>Updated: {new Date(conv.updatedAt).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        <span>{conv.messages.length} Messages</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(conv.id);
                        setEditTitle(conv.title);
                      }}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-cyan-300 hover:bg-white/10 transition-colors"
                      title="Rename Chat (F2)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleLoadConversation(conv.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition-all shadow-glow-cyan"
                    >
                      <span>Resume Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteConversation(conv.id, conv.title)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
