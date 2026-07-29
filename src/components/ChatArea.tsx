import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Cpu, Settings as SettingsIcon, Copy, Check, PlusCircle, Sparkles, Zap, Download, Brain, CheckCircle2, Target, Menu, X, FileText, Volume2, VolumeX, Lightbulb, Compass, FileCheck, HelpCircle } from 'lucide-react';
import { useStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const PROMPT_POOL = [
  {
    icon: Lightbulb,
    category: '💡 Small Business Advice',
    title: 'How to increase sales for my local retail shop?',
    prompt: 'Give me 5 practical, low-cost ideas to increase monthly sales for my local retail business.',
    gradient: 'from-amber-500/20 via-orange-500/10 to-amber-500/5 border-amber-500/30 text-amber-300'
  },
  {
    icon: FileCheck,
    category: '📝 Legal & Agreements',
    title: 'Draft a simple Employment Contract',
    prompt: 'Draft a standard, easy-to-read Employment Agreement contract for a full-time staff member.',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-300'
  },
  {
    icon: Compass,
    category: '🎯 Step-by-Step Plans',
    title: 'Create a plan to open a Coffee Shop',
    prompt: 'Create a complete step-by-step roadmap to open a coffee shop in Phnom Penh from budget to grand opening.',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-300'
  },
  {
    icon: HelpCircle,
    category: '❓ Everyday Advice',
    title: 'How to reduce monthly personal & business expenses?',
    prompt: 'What are the top 7 smartest ways to audit and cut unnecessary monthly expenses?',
    gradient: 'from-purple-500/20 via-violet-500/10 to-purple-500/5 border-purple-500/30 text-purple-300'
  },
  {
    icon: Sparkles,
    category: '📣 Marketing & Ads',
    title: 'Write 3 Facebook ad captions for my product',
    prompt: 'Write 3 high-converting, friendly Facebook social media captions for a new product launch.',
    gradient: 'from-rose-500/20 via-pink-500/10 to-rose-500/5 border-rose-500/30 text-rose-300'
  },
  {
    icon: Target,
    category: '📈 Finance & Growth',
    title: 'How to calculate profit margins & pricing?',
    prompt: 'Explain in simple non-technical terms how to calculate product profit margins and markup pricing.',
    gradient: 'from-cyan-500/20 via-teal-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-300'
  }
];

export default function ChatArea() {
  const { conversations, activeConversationId, isProcessing, processAgentResponse, settings, personas, activePersonaId, setActivePersona, addTask, tasks, isActionBoardOpen, toggleActionBoard, summarizeAndSaveChatToMemory, toggleMobileSidebar, openArtifact } = useStore();
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [addedTaskMessageId, setAddedTaskMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [promptOffset, setPromptOffset] = useState(0);

  // Auto-rotate starter cards every 8 seconds with smooth animation
  useEffect(() => {
    const timer = setInterval(() => {
      setPromptOffset(prev => (prev + 2) % PROMPT_POOL.length);
    }, 8000);
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

  const handleSpeakMessage = (content: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    // Toggle stop if already speaking this message
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // Stop previous speech & resume synth queue if paused by browser
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Clean markdown formatting symbols (#, *, `, _, ~, etc.)
    const cleanText = content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~|\-[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang.includes('en') || v.lang.includes('US')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
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
            className={`flex items-center gap-1 sm:gap-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all duration-200 shrink-0 ${
              isActionBoardOpen
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-glow-violet'
                : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
            }`}
            title="Toggle Project Plans & Execution Board"
          >
            <Target className={`w-3.5 h-3.5 shrink-0 ${isActionBoardOpen ? 'text-amber-400' : 'text-text-muted'}`} />
            <span className="font-mono font-semibold whitespace-nowrap">
              <span className="inline sm:hidden">Plans</span>
              <span className="hidden sm:inline">Project Plans</span>
            </span>
            {pendingTasksCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
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
        {/* Welcome Animated Prompt Cards (Shown when starting a chat) */}
        {activeMessages.length <= 1 && (
          <div className="max-w-4xl mx-auto my-6 p-6 rounded-3xl glass-panel border border-white/10 bg-slate-900/60 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-glow-cyan">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text font-sans">What would you like assistance with today?</h3>
                  <p className="text-xs text-text-muted">Click any recommendation below or type your own question.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 animate-pulse hidden sm:inline-block">
                ✨ Auto-suggesting...
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-700">
              {PROMPT_POOL.slice(promptOffset, promptOffset + 2).concat(
                PROMPT_POOL.slice(0, Math.max(0, (promptOffset + 2) - PROMPT_POOL.length))
              ).map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(item.prompt);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 bg-gradient-to-br ${item.gradient} hover:scale-[1.02] hover:shadow-lg active:scale-95 group flex flex-col justify-between`}
                  >
                    <div>
                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase opacity-80 block mb-1">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs text-text group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                      <span>Click to use prompt</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

                  <button
                    onClick={() => handleSpeakMessage(msg.content, msg.id)}
                    className={`flex items-center gap-1 text-[11px] font-mono transition-colors px-2 py-0.5 rounded-lg border ${
                      speakingMessageId === msg.id 
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 animate-pulse' 
                        : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
                    }`}
                    title="Listen to response out loud"
                  >
                    {speakingMessageId === msg.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-300 font-semibold">Stop Speaking</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>🔊 Listen</span>
                      </>
                    )}
                  </button>

                  {msg.role === 'agent' && msg.content.length > 80 && (
                    <button
                      onClick={() => {
                        const titleMatch = msg.content.match(/^#+\s*(.+)$/m);
                        const title = titleMatch ? titleMatch[1].replace(/[*_#`]/g, '').trim() : 'Generated Document';
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
          <div className="flex gap-3 max-w-7xl mx-auto">
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
    </div>
  );
}
