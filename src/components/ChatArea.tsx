import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Cpu, Settings as SettingsIcon, Copy, Check, PlusCircle, Sparkles, Zap, Download, Brain, CheckCircle2, Target, Menu, X, FileText, Volume2, VolumeX, Lightbulb, Compass, FileCheck, HelpCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const PROMPT_POOL = [
  { category: '💡 Business', title: 'How to increase sales for my local retail shop?', prompt: 'Give me 5 practical, low-cost ideas to increase monthly sales for my local retail business.' },
  { category: '📝 Legal', title: 'Draft a simple Employment Contract', prompt: 'Draft a standard, easy-to-read Employment Agreement contract for a full-time staff member.' },
  { category: '🎯 Roadmap', title: 'Create a plan to open a Coffee Shop', prompt: 'Create a complete step-by-step roadmap to open a coffee shop in Phnom Penh from budget to grand opening.' },
  { category: '❓ Savings', title: 'How to reduce monthly personal & business expenses?', prompt: 'What are the top 7 smartest ways to audit and cut unnecessary monthly expenses?' },
  { category: '📣 Marketing', title: 'Write 3 Facebook ad captions for my product', prompt: 'Write 3 high-converting, friendly Facebook social media captions for a new product launch.' },
  { category: '📈 Finance', title: 'How to calculate profit margins & pricing?', prompt: 'Explain in simple non-technical terms how to calculate product profit margins and markup pricing.' },
  { category: '📄 Contract', title: 'Draft a Non-Disclosure Agreement (NDA)', prompt: 'Write a clean, standard Non-Disclosure Agreement (NDA) to protect business secrets.' },
  { category: '💼 Career', title: 'Write a professional Job Offer Letter', prompt: 'Draft a professional Job Offer Letter including salary, probation, and start date.' },
  { category: '🚀 Strategy', title: 'How to market a new service on TikTok & Instagram?', prompt: 'Give me a 30-day social media marketing calendar for launching a new local service.' },
  { category: '📊 Audit', title: 'Check my business plan for risks and flaws', prompt: 'Act as a business consultant and highlight the top 5 financial & operational risks for a new startup.' },
  { category: '📝 Letter', title: 'Write a polite Payment Reminder email to client', prompt: 'Draft a polite but firm payment overdue reminder email for an unpaid invoice.' },
  { category: '🛠️ Productivity', title: 'How to organize daily tasks & manage team work?', prompt: 'Give me a simple daily task management framework for leading a small 5-person team.' }
];

import { MODEL_PRESETS } from '@/pages/Settings';
import UpgradeModal from '@/components/UpgradeModal';

export default function ChatArea() {
  const { conversations, activeConversationId, isProcessing, processAgentResponse, settings, updateSettings, personas, activePersonaId, setActivePersona, addTask, tasks, isActionBoardOpen, toggleActionBoard, summarizeAndSaveChatToMemory, toggleMobileSidebar, openArtifact, isAdminAuthenticated } = useStore();
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [addedTaskMessageId, setAddedTaskMessageId] = useState<string | null>(null);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean; modelName?: string }>({ isOpen: false });
  
  // Truly randomize 3 prompts on load and shuffle
  const getRandomPrompts = () => {
    const shuffled = [...PROMPT_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const [activePrompts, setActivePrompts] = useState(getRandomPrompts);
  const [animatingStage, setAnimatingStage] = useState<'idle' | 'fading' | 'popping'>('idle');
  const [fadingIndex, setFadingIndex] = useState<number>(-1);
  const [poppingIndex, setPoppingIndex] = useState<number>(-1);

  const triggerStaggeredShuffle = () => {
    setAnimatingStage('fading');
    // Staggered Fade Out: 0ms (card 0), 120ms (card 1), 240ms (card 2)
    setFadingIndex(0);
    setTimeout(() => setFadingIndex(1), 120);
    setTimeout(() => setFadingIndex(2), 240);

    // Switch prompts at 400ms when all are faded
    setTimeout(() => {
      setActivePrompts(getRandomPrompts());
      setAnimatingStage('popping');
      // Staggered Pop In: 0ms (card 0), 120ms (card 1), 240ms (card 2)
      setPoppingIndex(0);
      setTimeout(() => setPoppingIndex(1), 120);
      setTimeout(() => setPoppingIndex(2), 240);
    }, 450);

    // Finish animation cycle
    setTimeout(() => {
      setAnimatingStage('idle');
      setFadingIndex(-1);
      setPoppingIndex(-1);
    }, 850);
  };

  // Auto-randomize every 6 seconds with staggered sequential wave animation
  useEffect(() => {
    const timer = setInterval(() => {
      triggerStaggeredShuffle();
    }, 6000);
    return () => clearInterval(timer);
  }, []);
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInput(prev => prev + (prev ? '\n\n' : '') + `[Document: ${file.name}]\n${text}\n`);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setSelectedImage(base64);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInput(prev => prev + (prev ? '\n\n' : '') + `[Document: ${file.name}]\n${text}\n`);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isProcessing) return;
    
    const userMessage = input.trim();
    const imageToAttach = selectedImage || undefined;

    setInput('');
    setSelectedImage(null);
    processAgentResponse(userMessage || (imageToAttach ? 'Please analyze this uploaded image.' : ''), imageToAttach);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full bg-slate-950/40 relative overflow-hidden"
    >
      {/* Full-Screen Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl border-4 border-dashed border-cyan-400 flex flex-col items-center justify-center text-center p-6 animate-fadeIn pointer-events-none">
          <div className="p-5 rounded-3xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 mb-4 shadow-glow-cyan">
            <Paperclip className="w-12 h-12 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-cyan-300 mb-2">Drop File or Screenshot Here</h2>
          <p className="text-sm font-mono text-text-muted max-w-md">
            Images (.png, .jpg, .webp) and text documents (.md, .txt, .json, .js) will be automatically attached to your prompt.
          </p>
        </div>
      )}
      {/* Top Header Status Bar */}
      <header className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-10 shrink-0 select-none">
        {/* Left Side: Navigation Drawer Toggle & Core Control Dropdowns */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => toggleMobileSidebar(true)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 active:scale-95 transition-all"
            title="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Interactive AI Model Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowModelMenu(!showModelMenu);
                setShowPersonaMenu(false);
              }}
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-xl text-xs font-mono shadow-glow-cyan transition-all active:scale-95 cursor-pointer"
              title="Switch AI Engine Model"
            >
              <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span className="font-semibold text-text max-w-[75px] min-[380px]:max-w-[100px] sm:max-w-[180px] md:max-w-[260px] truncate">{currentModel}</span>
              <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0" />
            </button>

            {showModelMenu && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto custom-scrollbar rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl p-2 z-40 font-sans text-xs space-y-1 backdrop-blur-2xl animate-fadeIn">
                <div className="px-2.5 py-1.5 text-[10px] font-mono text-text-muted uppercase font-bold border-b border-white/10 mb-1 flex justify-between items-center">
                  <span>Switch AI Engine</span>
                  <Link to="/settings" className="text-cyan-400 hover:underline font-semibold text-[10px]">All Models</Link>
                </div>

                {MODEL_PRESETS.map(m => {
                  const isPaid = (settings?.paidModelIds || []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (isPaid && !isAdminAuthenticated) {
                          setShowModelMenu(false);
                          setUpgradeModal({ isOpen: true, modelName: m.name });
                          return;
                        }
                        updateSettings({ selectedModel: m.id });
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 ${
                        m.id === currentModel ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'hover:bg-white/10 text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-xs text-text truncate">{m.name}</span>
                          {isPaid ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/50 text-amber-300 font-mono font-bold shrink-0">
                              🔒 PRO
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold shrink-0">
                              FREE
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-text-muted font-mono shrink-0">{m.provider}</span>
                      </div>
                      <span className="text-[10px] text-text-muted/70 line-clamp-1">{m.description}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Persona Button (Visible on mobile & desktop) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPersonaMenu(!showPersonaMenu);
                setShowModelMenu(false);
              }}
              className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-text-muted hover:text-text px-2 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Switch AI Role Persona"
            >
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold text-text max-w-[65px] min-[380px]:max-w-[85px] sm:max-w-[160px] truncate">
                {activePersona ? activePersona.name : 'Persona'}
              </span>
              <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
            </button>

            {showPersonaMenu && (
              <div className="absolute left-0 min-[380px]:right-0 min-[380px]:left-auto sm:left-0 sm:right-auto mt-2 w-64 sm:w-72 max-w-[85vw] rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl p-2 z-40 font-sans text-xs space-y-1 backdrop-blur-2xl animate-fadeIn">
                <div className="px-2.5 py-1.5 text-[10px] font-mono text-text-muted uppercase font-bold border-b border-white/10 mb-1">
                  <span>Select Agent Persona</span>
                </div>

                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 ${
                      p.id === activePersonaId ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'hover:bg-white/10 text-text'
                    }`}
                  >
                    <span className="font-semibold text-xs">{p.name}</span>
                    <span className="text-[10px] text-text-muted/70 line-clamp-1">{p.instructions}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Project Plans & Settings Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Project Plans Button (Desktop Only) */}
          <button
            onClick={toggleActionBoard}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 shrink-0 ${
              isActionBoardOpen
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-glow-violet'
                : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
            }`}
            title="Toggle Project Plans & Execution Board"
          >
            <Target className={`w-3.5 h-3.5 shrink-0 ${isActionBoardOpen ? 'text-amber-400' : 'text-text-muted'}`} />
            <span className="font-mono font-semibold whitespace-nowrap">Project Plans</span>
            {pendingTasksCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* Settings Link (Desktop Only - Hidden on Mobile) */}
          <Link
            to="/settings"
            className="hidden md:flex items-center gap-1.5 text-xs text-text-muted hover:text-cyan-300 transition-all bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-lg active:scale-95"
            title="Configure AI Settings & Keys"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-semibold">Settings</span>
          </Link>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">


        {activeMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-7xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attached upload" className="max-w-full max-h-64 object-cover rounded-xl mb-2 border border-slate-900/30 shadow-md" />
                )}
                {msg.role === 'agent' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-lg">
                          <table className="w-full text-left border-collapse text-xs font-sans">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-900/90 text-cyan-300 font-mono border-b border-white/10 uppercase tracking-wider text-[11px]">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-3.5 py-2.5 font-bold border-r border-white/5 last:border-r-0">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3.5 py-2 border-t border-white/5 border-r border-white/5 last:border-r-0 text-text/90">
                          {children}
                        </td>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-white/5 transition-colors odd:bg-slate-950/30 even:bg-slate-900/30">
                          {children}
                        </tr>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
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

                  {msg.role === 'agent' && msg.content.length > 80 && (
                    <button
                      onClick={() => {
                        // Extract descriptive title from headings, first line, or key terms
                        const titleMatch = msg.content.match(/^#+\s*(.+)$/m) || msg.content.match(/\*\*(.+?)\*\*/);
                        let title = titleMatch ? titleMatch[1].replace(/[*_#`:]/g, '').trim() : '';
                        if (!title || title === 'Generated Document') {
                          const firstLine = msg.content.split('\n')[0].replace(/[*_#`:]/g, '').trim();
                          title = firstLine.length > 5 && firstLine.length < 50 ? firstLine : 'NEXUS Executive Summary';
                        }
                        const isCode = msg.content.includes('```');
                        const isContract = /contract|agreement|legal|policy/i.test(msg.content);
                        const isTable = msg.content.includes('|---|') || msg.content.includes('| --- |');
                        openArtifact({
                          id: msg.id,
                          title,
                          type: isCode ? 'code' : isContract ? 'contract' : isTable ? 'table' : 'document',
                          content: msg.content,
                          createdAt: msg.timestamp
                        });
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition-all bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg shadow-glow-cyan"
                      title="Open full document preview in Live Artifact Studio side canvas"
                    >
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span>Open in Studio</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-3 max-w-7xl mx-auto animate-fadeIn">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-tr from-cyan-500/20 via-violet-600/30 to-cyan-400/20 border-cyan-400/50 text-cyan-300 shadow-glow-cyan">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" style={{ animationDuration: '2.5s' }} />
            </div>
            <div className="flex-1 flex justify-start">
              <div className="p-3.5 rounded-2xl glass-panel text-text flex items-center gap-3 border border-cyan-500/30 shadow-glow-cyan bg-slate-950/80">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }}></span>
                  <span className="w-1.5 h-6 bg-primary rounded-full animate-pulse" style={{ animationDuration: '0.9s', animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-3 bg-violet-400 rounded-full animate-pulse" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }}></span>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold tracking-wider uppercase">NEXUS Generating Response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pinned Bottom Input Area */}
      <div className="shrink-0 p-2.5 sm:p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl">
        {/* Sleek Minimal Starter Prompt Chips (Auto-rotating every 9s) */}
        {activeMessages.length <= 1 && (
          <div className="max-w-7xl mx-auto mb-3 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {activePrompts.map((item, idx) => {
                const isFadingThis = animatingStage === 'fading' && idx <= fadingIndex;
                const isPoppingThis = animatingStage === 'popping' && idx <= poppingIndex;
                const isHiddenBeforePop = animatingStage === 'popping' && idx > poppingIndex;

                return (
                  <button
                    key={`${item.title}-${idx}`}
                    type="button"
                    onClick={() => setInput(item.prompt)}
                    className={`px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-400/60 text-xs text-text-muted hover:text-cyan-300 font-medium transition-all duration-300 active:scale-95 shadow-sm hover:shadow-glow-cyan flex items-center gap-2 shrink-0 group ${
                      idx > 0 ? 'hidden sm:flex' : 'flex'
                    } ${
                      isFadingThis
                        ? 'opacity-0 scale-90 -translate-y-2'
                        : isPoppingThis
                        ? 'opacity-100 scale-100 translate-y-0 shadow-glow-cyan'
                        : isHiddenBeforePop
                        ? 'opacity-0 scale-90 translate-y-2'
                        : 'opacity-100 scale-100 translate-y-0'
                    }`}
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">{item.category.split(' ')[0]}</span>
                    <span className="truncate max-w-[260px] sm:max-w-none">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Image Thumbnail Preview */}
        {selectedImage && (
          <div className="max-w-7xl mx-auto mb-2 relative inline-block group">
            <img src={selectedImage} alt="Selected preview" className="w-20 h-20 object-cover rounded-xl border border-primary/50 shadow-glow-cyan" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-cyan-400 to-violet-600 opacity-20 group-hover:opacity-40 blur-md transition-all duration-300 rounded-2xl" />
          <div className="relative flex items-end gap-2 bg-slate-950/90 border border-white/15 rounded-2xl p-2 focus-within:border-primary/60 transition-colors shadow-xl">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json,.js,.ts,.html,.css"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-text-muted hover:text-primary hover:bg-white/5 rounded-xl transition-all shrink-0"
              title="Attach an image or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask NEXUS anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-36 min-h-[40px] p-2 text-text placeholder:text-text-muted/50 focus:outline-none text-base sm:text-sm font-sans truncate"
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

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false })}
        selectedModelName={upgradeModal.modelName}
      />
    </div>
  );
}
