import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Persona } from '@/store';
import { Plus, Edit, Trash2, CheckCircle2, User, Sparkles, Bot, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';

export default function Agents() {
  const navigate = useNavigate();
  const { personas, activePersonaId, addPersona, updatePersona, deletePersona, setActivePersona } = useStore();
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaInstructions, setNewPersonaInstructions] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPersona = () => {
    if (newPersonaName.trim() && newPersonaInstructions.trim()) {
      addPersona(newPersonaName.trim(), newPersonaInstructions.trim());
      setNewPersonaName('');
      setNewPersonaInstructions('');
      setShowAddForm(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingPersona && editingPersona.name.trim() && editingPersona.instructions.trim()) {
      updatePersona(editingPersona.id, editingPersona.name.trim(), editingPersona.instructions.trim());
      setEditingPersona(null);
    }
  };

  const activePersonaObj = personas.find(p => p.id === activePersonaId);

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-8 pb-12">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Navigation Back Button & Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/')}
            className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text text-xs font-mono transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Terminal</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-mono neon-text">Persona & Role Manager</h1>
              <p className="text-text-muted mt-1">Configure AI behavioral instructions, system roles, and expert personas.</p>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary via-cyan-400 to-cyan-500 text-slate-950 font-bold rounded-xl hover:brightness-110 transition-all shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Persona</span>
            </button>
          </div>
        </div>

        {/* Active Persona Banner */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Active Behavioral System Instructions
          </h2>

          {activePersonaObj ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/40 shadow-glow-cyan">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary border border-primary/40 shadow-glow-cyan shrink-0">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-text flex items-center gap-2">
                    {activePersonaObj.name}
                  </h3>
                  <p className="text-xs text-text-muted line-clamp-2 mt-1 max-w-2xl font-sans">
                    {activePersonaObj.instructions}
                  </p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-primary text-slate-950 font-bold text-xs rounded-full flex items-center gap-1.5 shadow-glow-cyan shrink-0 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Active Role
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 text-text-muted text-sm flex items-center gap-3">
              <User className="w-5 h-5 text-text-muted/60 shrink-0" />
              <span>No persona is currently active. Select one from the cards below to instantly switch AI roles.</span>
            </div>
          )}
        </div>

        {/* Create Custom Persona Form */}
        {showAddForm && (
          <div className="glass-panel p-6 rounded-2xl border border-primary/40 shadow-glow-cyan animate-in fade-in">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Build New Custom Persona
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-text-muted uppercase mb-2">Persona Name & Icon</label>
                <input
                  type="text"
                  placeholder="e.g. 🛠️ Senior Full-Stack Architect"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-muted uppercase mb-2">Custom System Instructions</label>
                <textarea
                  placeholder="Describe how the AI should respond, its tone, focus areas, code style, or domain expertise..."
                  rows={4}
                  value={newPersonaInstructions}
                  onChange={(e) => setNewPersonaInstructions(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors text-sm font-sans"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddPersona}
                  disabled={!newPersonaName.trim() || !newPersonaInstructions.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-cyan"
                >
                  <Plus className="w-4 h-4" /> Save Persona
                </button>

                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 text-text-muted hover:text-text text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personas Cards Grid */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <h2 className="text-xl font-semibold text-text flex items-center justify-between">
            <span>Available Personas ({personas.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {personas.map(persona => {
              const isActive = persona.id === activePersonaId;
              const isEditingThis = editingPersona?.id === persona.id;

              return (
                <div
                  key={persona.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    isActive
                      ? 'bg-primary/10 border-primary/50 shadow-glow-cyan'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {isEditingThis ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingPersona.name}
                        onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-primary/50 rounded-xl text-text text-sm font-semibold focus:outline-none"
                      />
                      <textarea
                        rows={4}
                        value={editingPersona.instructions}
                        onChange={(e) => setEditingPersona({ ...editingPersona, instructions: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-primary/50 rounded-xl text-text text-xs focus:outline-none"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-primary text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 transition-all shadow-glow-cyan"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingPersona(null)}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-text-muted text-xs rounded-lg hover:text-text transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-text text-base flex items-center gap-2">
                            {persona.name}
                          </h3>

                          {isActive && (
                            <span className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/40 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-white/5 font-sans">
                          {persona.instructions}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        {isActive ? (
                          <span className="text-xs font-mono text-primary font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-primary" /> Active Role
                          </span>
                        ) : (
                          <button
                            onClick={() => setActivePersona(persona.id)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 border border-white/10 hover:border-primary/50 text-text-muted hover:text-primary rounded-xl text-xs font-mono font-semibold transition-all shadow-glass"
                          >
                            <Zap className="w-3.5 h-3.5" /> Activate Role
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPersona(persona)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-white/10 transition-colors"
                            title="Edit Persona"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {!['nexus-growth-advisor', 'tech-architect', 'product-strategist', 'seo-content-specialist'].includes(persona.id) && (
                            <button
                              onClick={() => deletePersona(persona.id)}
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-white/10 transition-colors"
                              title="Delete Persona"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
