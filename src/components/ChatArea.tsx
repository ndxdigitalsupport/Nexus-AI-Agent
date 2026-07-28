import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Cpu, Settings as SettingsIcon, Copy, Check, PlusCircle, Sparkles, Zap, Download, Brain, CheckCircle2, Target, Menu } from 'lucide-react';
import { useStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export default function ChatArea() {
  const { conversations, activeConversationId, isProcessing, processAgentResponse, settings, personas, activePersonaId, setActivePersona, addTask, tasks, isActionBoardOpen, toggleActionBoard, summarizeAndSaveChatToMemory, toggleMobileSidebar } = useStore();
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [addedTaskMessageId, setAddedTaskMessageId] = useState<string | null>(null);
  const [isMemorySaved, setIsMemorySaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const activeMessages = activeConversation ? activeConversation.messages : [];
  const activePersona = personas.find(p => p.id === activePersonaId);
  const currentModel = settings?.selectedModel || 'openrouter/free';

  const handleCopyMessage = (content: string, msgId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const handleConvertToTask = (content: string, msgId: string) => {
    const cleanTitle = content.replace(/[#*`_~]/g, '').trim().split('\n')[0].substring(0, 100);
    if (cleanTitle) {
      addTask(cleanTitle);
      setAddedTaskMessageId(msgId);
      setTimeout(() => setAddedTaskMessageId(null), 2500);
    }
  };

  const handleSaveSummaryToMemory = async () => {
    if (activeConversationId && activeMessages.length > 1) {
      await summarizeAndSaveChatToMemory(activeConversationId);
      setIsMemorySaved(true);
      setTimeout(() => setIsMemorySaved(false), 3500);
    }
  };

  const handleExportMarkdown = () => {
    if (!activeConversation) return;
    const content = `# Conversation Log: ${activeConversation.title}\nDate: ${new Date(activeConversation.createdAt).toLocaleString()}\n\n` +
      activeMessages.map(m => `### ${m.role === 'user' ? '👤 User' : '🤖 NEXUS Agent'} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n`).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_log.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportText = () => {
    if (!activeConversation) return;
    const content = activeMessages.map(m => `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleTimeString()}:\n${m.content}\n`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_log.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messagesEndRef.current?.parentElement) {
      messagesEndRef.current.parentElement.style.paddingBottom = '';
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, isProcessing, activeConversationId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(prev => prev + (prev ? '\n\n' : '') + `[Document: ${file.name}]\n${text}\n`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const userMessage = input.trim();
    setInput('');
    processAgentResponse(userMessage);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 relative overflow-hidden">
      {/* Top Header Status Bar */}
      <header className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between z-10 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => toggleMobileSidebar(true)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 active:scale-95 transition-all"
            title="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono shadow-glow-cyan">
            <Cpu className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-[280px] font-semibold">{currentModel}</span>
          </div>

          {/* Interactive Persona Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text px-3 py-1 rounded-full text-xs font-medium transition-all"
              title="Switch AI Role Persona"
            >
              <User className="w-3.5 h-3.5 text-accent" />
              <span>Persona: <strong className="text-text">{activePersona ? activePersona.name : 'Default Agent'}</strong></span>
            </button>

            {showPersonaMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-30 font-sans text-xs space-y-1 backdrop-blur-xl">
                <div className="px-2.5 py-1 text-[10px] font-mono text-text-muted uppercase font-bold border-b border-white/10 flex justify-between items-center">
                  <span>Select Agent Persona</span>
                  <Link to="/agents" className="text-primary hover:underline font-normal text-[10px]">Manage</Link>
                </div>

                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col gap-0.5 ${
                      p.id === activePersonaId ? 'bg-primary/20 text-primary border border-primary/40' : 'hover:bg-white/10 text-text'
                    }`}
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[10px] text-text-muted/80 line-clamp-1">{p.instructions}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Summary to Memory Button */}
          <button
            onClick={handleSaveSummaryToMemory}
            disabled={isProcessing || activeMessages.length <= 1}
            className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 text-text-muted hover:text-cyan-300 disabled:opacity-40 transition-all"
            title="Summarize conversation & save directly into Knowledge Base memory"
          >
            {isMemorySaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold font-mono">Saved to Memory!</span>
              </>
            ) : (
              <>
                <Brain className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-mono">Save to Memory</span>
              </>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={activeMessages.length <= 1}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 text-text-muted hover:text-text disabled:opacity-40 transition-all"
              title="Export chat log as Markdown or Text"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="font-mono">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-30 font-mono text-xs space-y-1 backdrop-blur-xl">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-text hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span>Markdown (.md)</span>
                  <span className="text-[10px] text-text-muted">Formatted</span>
                </button>
                <button
                  onClick={handleExportText}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-text hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span>Plain Text (.txt)</span>
                  <span className="text-[10px] text-text-muted">Raw Log</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleActionBoard}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 ${
              isActionBoardOpen
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-glow-violet'
                : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
            }`}
            title="Toggle Agentic Action Board"
          >
            <Zap className={`w-3.5 h-3.5 ${isActionBoardOpen ? 'text-amber-400' : 'text-text-muted'}`} />
            <span className="font-mono font-semibold">Action Board</span>
            {pendingTasksCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {pendingTasksCount}
              </span>
            )}
          </button>

          <Link
            to="/settings"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-lg"
            title="Configure AI Settings & Keys"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Settings</span>
          </Link>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {activeMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border shadow-md ${
              msg.role === 'agent' 
                ? 'bg-gradient-to-tr from-cyan-500/20 to-violet-600/30 border-primary/40 text-primary shadow-glow-cyan' 
                : 'bg-slate-800 border-white/10 text-slate-300'
            }`}>
              {msg.role === 'agent' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-slate-300" />}
            </div>
            
            {/* Message Body & Actions */}
            <div className={`flex-1 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[88%] text-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-medium shadow-md shadow-cyan-500/10 rounded-tr-xs' 
                  : 'glass-panel text-slate-100 rounded-tl-xs border border-white/10 shadow-glass prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-950/90 prose-pre:border prose-pre:border-white/10 prose-headings:text-primary'
              }`}>
                {msg.role === 'agent' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap m-0 leading-relaxed font-sans">{msg.content}</p>
                )}
              </div>

              {/* Quick Action Toolbar */}
              {msg.id !== 'welcome-msg' && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-primary transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg"
                    title="Copy message text"
                  >
                    {copiedMessageId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleConvertToTask(msg.content, msg.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-amber-400 transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-lg"
                    title="Add message as an Action Board task"
                  >
                    {addedTaskMessageId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-semibold">Added</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3" />
                        <span>+ Add Task</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-tr from-cyan-500/20 to-violet-600/30 border-primary/40 text-primary shadow-glow-cyan">
              <Sparkles className="w-4 h-4 animate-spin text-primary" style={{ animationDuration: '3s' }} />
            </div>
            <div className="flex-1 flex justify-start">
              <div className="p-3.5 rounded-2xl glass-panel text-text flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                <span className="text-xs font-mono text-primary font-semibold tracking-wider uppercase">NEXUS Generating...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pinned Bottom Input Area */}
      <div className="shrink-0 p-2.5 sm:p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl">
        {/* Quick Action Plan Pill */}
        <div className="flex items-center gap-2 mb-2 max-w-4xl mx-auto font-mono text-[11px] overflow-x-auto custom-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setInput('Create a detailed, step-by-step project execution plan for my goal and send all action items directly to my Action Board: ')}
            className="group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-cyan-500/10 to-violet-500/15 hover:from-amber-500/25 hover:to-cyan-500/20 text-amber-300 border border-amber-500/40 rounded-xl transition-all duration-300 shadow-glow-violet active:scale-95 shrink-0"
            title="Prompt AI to generate a full plan and automatically inject all tasks onto your Action Board"
          >
            <Target className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="font-semibold tracking-wide text-xs">Plan Project & Auto-Populate Board</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-cyan-400 to-violet-600 opacity-20 group-hover:opacity-40 blur-md transition-all duration-300 rounded-2xl" />
          <div className="relative flex items-end gap-2 bg-slate-950/90 border border-white/15 rounded-2xl p-2 focus-within:border-primary/60 transition-colors shadow-xl">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".txt,.md,.csv,.json,.js,.ts,.html,.css"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-text-muted hover:text-primary hover:bg-white/5 rounded-xl transition-all shrink-0"
              title="Attach a text document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask NEXUS anything or outline a project goal..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-36 min-h-[40px] p-2 text-text placeholder:text-text-muted/50 focus:outline-none text-sm font-sans"
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isProcessing}
              className="p-2.5 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-glow-cyan active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
