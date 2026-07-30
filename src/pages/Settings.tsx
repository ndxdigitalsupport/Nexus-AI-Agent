import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Key, Cpu, Sliders, Check, Eye, EyeOff, RotateCcw, Sparkles, Server, Download, Upload, Database, AlertTriangle, ArrowLeft, ShieldCheck, Lock, Unlock } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export interface ModelPreset {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow?: string;
  hasVision?: boolean;
}

export const MODEL_PRESETS: ModelPreset[] = [
  // Anthropic / Claude
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', description: 'High-concurrency aggregated model with 1M context. Ideal for agents, workflows, vision, and high throughput.', contextWindow: '1M', hasVision: true },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'Anthropic', description: 'Next-gen flagship model for complex reasoning, full-stack coding, and multi-turn agent workflows.', contextWindow: '1M', hasVision: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', description: 'Top-tier frontier reasoning model for deep research, complex system engineering, and multi-day agent tasks.', contextWindow: '1M', hasVision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Lightweight & ultra-fast Claude model optimized for quick Q&A, text classification, and low-latency API calls.', contextWindow: '256K', hasVision: true },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', description: 'Multimodal model with 1M context, suited for complex architectural design, deep reasoning, and code refactoring.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', provider: 'Anthropic', description: 'Advanced model for deep code reviews, technical planning, and multi-stage logic validation.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'Anthropic', description: 'High-value enterprise model for long-horizon agent execution and rigorous technical reporting.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'Anthropic', description: 'Premier Opus 5 engine built for enterprise agent programming, deep reasoning, and software delivery.', contextWindow: '1M', hasVision: true },

  // OpenAI
  { id: 'gpt-5.6-sol', name: 'GPT 5.6 Sol', provider: 'OpenAI', description: 'High-capacity flagship model for complex Q&A, advanced code generation, long document context, and vision.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-terra', name: 'GPT 5.6 Terra', provider: 'OpenAI', description: 'Balanced performance model for daily engineering tasks, document processing, and multimodal interaction.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-luna', name: 'GPT 5.6 Luna', provider: 'OpenAI', description: 'High-speed entry model tailored for frequent API calls, general Q&A, and document parsing.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.4', name: 'GPT 5.4', provider: 'OpenAI', description: 'General workhorse model for daily Q&A, software engineering, long-form writing, and agent automation.', contextWindow: '1M', hasVision: true },
  { id: 'gpt-5.5', name: 'GPT 5.5', provider: 'OpenAI', description: 'High-capability model tailored for complex reasoning, code architecture planning, and critical production tasks.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.3-codex-spark', name: 'GPT 5.3 Codex Spark', provider: 'OpenAI', description: 'Real-time Codex coding engine for rapid code completion, live debugging, and UI tweaking.', contextWindow: '128K', hasVision: false },

  // Qwen
  { id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus', provider: 'Qwen', description: 'High-value 1M context model for large codebases, technical documentation, and tool-use agent workflows.', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-plus', name: 'Qwen 3.7 Plus', provider: 'Qwen', description: 'Next-gen agent model tuned for OpenClaw, Claude Code, Hermes, and codebase navigation.', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-max', name: 'Qwen 3.7 Max', provider: 'Qwen', description: 'Flagship reasoning engine for complex logic, system architecture design, and long-cycle agent tasks.', contextWindow: '1M', hasVision: false },
  { id: 'qwen3.8-max', name: 'Qwen 3.8 Max', provider: 'Qwen', description: 'Multimodal 1M context model supporting high-value analysis, complex reasoning, and multimodal inputs.', contextWindow: '1M', hasVision: true },

  // DeepSeek
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', description: 'High-performance reasoning model tailored for math, complex algorithmic planning, and deep code analysis.', contextWindow: '1M', hasVision: false },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', description: 'Fast, cost-effective DeepSeek variant for rapid Q&A, summarization, and lightweight reasoning.', contextWindow: '1M', hasVision: false },

  // ByteDance / Doubao
  { id: 'doubao-seed-2.0-code', name: 'Doubao Seed 2.0 Code', provider: 'ByteDance', description: 'Specialized coding model for code synthesis, refactoring, debugging, and engineering assistance.', contextWindow: '200K', hasVision: true },
  { id: 'doubao-seed-2.0-pro', name: 'Doubao Seed 2.0 Pro', provider: 'ByteDance', description: 'Enhanced general model for complex Q&A, creative writing, multimodal vision, and analytical tasks.', contextWindow: '128K', hasVision: true },

  // Zhipu GLM
  { id: 'glm-5.1', name: 'GLM 5.1', provider: 'Zhipu GLM', description: 'Flagship general model for writing, data analysis, coding, and agent engineering workflows.', contextWindow: '256K', hasVision: true },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu GLM', description: 'Next-gen multimodal model for complex technical writing, multimodal vision, and code generation.', contextWindow: '1M', hasVision: true },

  // Kimi / xAI / Xiaomi / MiniMax / Meituan / Tencent / Stepfun
  { id: 'kimi-k3', name: 'Kimi K3', provider: 'Moonshot Kimi', description: 'Next-gen 1M context multimodal model for massive document analysis, codebase Q&A, and vision.', contextWindow: '1M', hasVision: true },
  { id: 'grok-4.5', name: 'Grok 4.5', provider: 'xAI Grok', description: 'Powerful general intelligence model for technical Q&A, programming, and long document reasoning.', contextWindow: '500K', hasVision: true },
  { id: 'mimo-v2.5-pro', name: 'MiMo v2.5 Pro', provider: 'Xiaomi MiMo', description: 'Professional enterprise model for long text analysis, strategic planning, and automated workflows.', contextWindow: '1M', hasVision: false },
  { id: 'mimo-v2.5', name: 'MiMo v2.5', provider: 'Xiaomi MiMo', description: 'Cost-effective model for daily conversational tasks, rewriting, summarization, and batch processing.', contextWindow: '1M', hasVision: true },
  { id: 'MiniMax-M3', name: 'MiniMax M3', provider: 'MiniMax', description: '1M context multimodal model built for long documents, agent tasks, multi-turn reasoning, and vision.', contextWindow: '1M', hasVision: true },
  { id: 'LongCat-2.0', name: 'LongCat 2.0', provider: 'Meituan', description: 'Long-context agentic coding model for codebase understanding, complex planning, and long-form reasoning.', contextWindow: '1M', hasVision: false },
  { id: 'hy3', name: 'Hunyuan 3 (hy3)', provider: 'Tencent', description: 'Hunyuan 3 reasoning & agent model for code execution, document analysis, and task automation.', contextWindow: '256K', hasVision: false },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', provider: 'Stepfun', description: 'High-speed model for code assistant workflows, conversational Q&A, vision, and lightweight agents.', contextWindow: '256K', hasVision: true },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, exportState, importState, resetAllData, isAdminAuthenticated, verifyAdminPin, lockAdminMode } = useStore();

  const isPresetModel = MODEL_PRESETS.some(p => p.id === (settings?.selectedModel || 'openrouter/free'));
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(isPresetModel ? (settings?.selectedModel || 'openrouter/free') : 'custom');
  const [customModelInput, setCustomModelInput] = useState(!isPresetModel ? (settings?.selectedModel || '') : '');
  const [customEndpoint, setCustomEndpoint] = useState(settings?.customEndpoint || 'https://openrouter.ai/api/v1/chat/completions');
  const [temperature, setTemperature] = useState(settings?.temperature ?? 0.7);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setPinError(false);
      setPinSuccess(true);
      setPinInput('');
      setTimeout(() => setPinSuccess(false), 3000);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 3000);
    }
  };

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveSettingsToStore = (
    newApiKey: string,
    newModel: string,
    newCustomInput: string,
    newEndpoint: string,
    newTemp: number
  ) => {
    const finalModel = newCustomInput.trim() || newModel;
    updateSettings({
      apiKey: newApiKey.trim(),
      selectedModel: finalModel,
      customEndpoint: newEndpoint.trim(),
      temperature: newTemp,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    const defaultKey = 'sk-7QqlOxkiFQ0WV917iwvBdAeMVQqzgYViZ8oU0chwKYUXYFt8';
    const defaultModel = 'claude-fable-5';
    const defaultEndpoint = 'https://gpt-agent.cc/v1/chat/completions';
    const defaultTemp = 0.7;

    setApiKey(defaultKey);
    setSelectedModel(defaultModel);
    setCustomModelInput('');
    setCustomEndpoint(defaultEndpoint);
    setTemperature(defaultTemp);

    updateSettings({
      apiKey: defaultKey,
      selectedModel: defaultModel,
      customEndpoint: defaultEndpoint,
      temperature: defaultTemp,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportState();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `nexus-agent-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setImportMessage({ type: 'success', text: 'Backup file exported successfully!' });
    setTimeout(() => setImportMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importState(content);
      if (result.success) {
        setImportMessage({ type: 'success', text: 'Workspace imported successfully!' });
        const freshState = useStore.getState();
        setApiKey(freshState.settings.apiKey);
        setSelectedModel(freshState.settings.selectedModel);
        setCustomEndpoint(freshState.settings.customEndpoint);
        setTemperature(freshState.settings.temperature);
      } else {
        setImportMessage({ type: 'error', text: `Import error: ${result.error}` });
      }
      setTimeout(() => setImportMessage(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFactoryResetClick = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Workspace Data',
      message: '⚠️ Are you sure you want to reset all workspace data?\n\nThis will wipe all conversations, tasks, personas, and knowledge articles back to initial defaults.',
      onConfirm: () => {
        resetAllData();
        const freshState = useStore.getState();
        setApiKey(freshState.settings.apiKey);
        setSelectedModel(freshState.settings.selectedModel);
        setCustomEndpoint(freshState.settings.customEndpoint);
        setTemperature(freshState.settings.temperature);
        setImportMessage({ type: 'success', text: 'Workspace data reset to initial defaults.' });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setTimeout(() => setImportMessage(null), 4000);
      }
    });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full pb-12">
        {/* Navigation Back Button & Header */}
        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text text-xs font-mono transition-all group"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono neon-text">Application Settings</h1>
              <p className="text-text-muted mt-1">Configure your AI providers, API keys, models, and workspace backup data.</p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl text-sm font-semibold shadow-glow-cyan animate-in fade-in zoom-in-95 duration-200 font-mono">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Settings Updated & Saved Successfully!</span>
              </div>
            )}
          </div>
        </div>

        {importMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in ${
            importMessage.type === 'success' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {importMessage.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{importMessage.text}</span>
          </div>
        )}



        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* API Key Section (ADMIN ONLY - HIDDEN BY DEFAULT) */}
          {isAdminAuthenticated && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text">API Authorization</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    OpenRouter / Provider API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setApiKey(val);
                        saveSettingsToStore(val, selectedModel, customModelInput, customEndpoint, temperature);
                      }}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary pr-12 transition-colors font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Your key is stored locally in your browser. Leaving this empty will check for <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary">.env.local</code> keys.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Model Selector Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-text">AI Model Selection</h2>
              </div>

              {/* Provider Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {['All', 'Anthropic', 'OpenAI', 'DeepSeek', 'Qwen'].map((provider) => {
                  const isActive = providerFilter === provider;
                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setProviderFilter(provider)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10'
                      }`}
                    >
                      {provider}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-2 p-1">
                {MODEL_PRESETS.filter(p => providerFilter === 'All' || p.provider === providerFilter).map((preset) => {
                  const isSelected = selectedModel === preset.id && !customModelInput;
                  const currentPaidIds = settings?.paidModelIds || [];
                  const isPaid = currentPaidIds.includes(preset.id);

                  const toggleTier = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!isAdminAuthenticated) return;
                    const updatedPaid = isPaid
                      ? currentPaidIds.filter(id => id !== preset.id)
                      : [...currentPaidIds, preset.id];
                    updateSettings({ paidModelIds: updatedPaid });
                  };

                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedModel(preset.id);
                        setCustomModelInput('');
                        saveSettingsToStore(apiKey, preset.id, '', customEndpoint, temperature);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary/20 via-cyan-500/10 to-violet-500/10 border-primary shadow-glow-cyan scale-[1.01]'
                          : 'bg-slate-950/60 border-white/10 hover:border-primary/50 hover:bg-slate-900/80 hover:shadow-lg'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-semibold text-xs text-text truncate">{preset.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAdminAuthenticated ? (
                              <button
                                type="button"
                                onClick={toggleTier}
                                title="Click to toggle Free vs Paid Pro Tier (Admin Control)"
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all shadow-sm ${
                                  isPaid
                                    ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/60 text-amber-300 hover:brightness-125'
                                    : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:brightness-125'
                                }`}
                              >
                                {isPaid ? '🔒 PRO' : '⚡ FREE'}
                              </button>
                            ) : (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                isPaid
                                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/50 text-amber-300'
                                  : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                              }`}>
                                {isPaid ? '🔒 PRO' : '⚡ FREE'}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-text-muted font-mono">
                              {preset.provider}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-text-muted/80 mb-3 leading-relaxed">{preset.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px] font-mono">
                        <span className="text-cyan-400/90 font-mono truncate max-w-[130px]" title={preset.id}>{preset.id}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {preset.contextWindow && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                              {preset.contextWindow}
                            </span>
                          )}
                          {preset.hasVision && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold" title="Supports Multimodal Image Input">
                              👁️ Vision
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Model ID Card (ADMIN ONLY - HIDDEN BY DEFAULT) */}
            {isAdminAuthenticated && (
              <div className={`p-4 rounded-2xl border transition-all duration-300 mt-6 ${
                customModelInput.trim()
                  ? 'bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-primary/10 border-primary shadow-glow-cyan'
                  : 'bg-slate-950/50 border-white/10 hover:border-white/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Custom Model ID Override</span>
                  </label>
                  {customModelInput.trim() ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3 text-cyan-400" /> Active Override
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-muted">
                      Admin Optional
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomModelInput(val);
                      saveSettingsToStore(apiKey, selectedModel, val, customEndpoint, temperature);
                    }}
                    placeholder="e.g. meta-llama/llama-3.3-70b-instruct or deepseek/deepseek-r1"
                    className="w-full bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-cyan-300 placeholder:text-text-muted/40 focus:outline-none transition-all font-mono text-sm shadow-inner"
                  />
                  {customModelInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomModelInput('');
                        saveSettingsToStore(apiKey, selectedModel, '', customEndpoint, temperature);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted hover:text-rose-400 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Endpoint & Parameters (ADMIN ONLY - HIDDEN BY DEFAULT) */}
          {isAdminAuthenticated && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <Server className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-text">Endpoint & Parameters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomEndpoint(val);
                      saveSettingsToStore(apiKey, selectedModel, customModelInput, val, temperature);
                    }}
                    placeholder="https://openrouter.ai/api/v1/chat/completions"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const ep = 'https://openrouter.ai/api/v1/chat/completions';
                        setCustomEndpoint(ep);
                        saveSettingsToStore(apiKey, selectedModel, customModelInput, ep, temperature);
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted border border-white/10 transition-colors"
                    >
                      Use OpenRouter API
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ep = 'https://api.deepseek.com/chat/completions';
                        setCustomEndpoint(ep);
                        saveSettingsToStore(apiKey, selectedModel, customModelInput, ep, temperature);
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted border border-white/10 transition-colors"
                    >
                      Use DeepSeek Official API
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ep = 'https://gpt-agent.cc/v1/chat/completions';
                        setCustomEndpoint(ep);
                        saveSettingsToStore(apiKey, selectedModel, customModelInput, ep, temperature);
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-colors"
                    >
                      Use GPT Agent Relay
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-accent" />
                      Temperature (Creativity)
                    </label>
                    <span className="font-mono text-sm text-primary font-bold">{temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTemperature(val);
                      saveSettingsToStore(apiKey, selectedModel, customModelInput, customEndpoint, val);
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>0.0 (Precise / Analytical)</span>
                    <span>0.7 (Balanced)</span>
                    <span>1.0 (Creative)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Backup & Recovery Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold text-text">Workspace Backup & Restore</h2>
            </div>
            <p className="text-sm text-text-muted mb-6">
              Export your entire NEXUS workspace (conversations, tasks, personas, knowledge base, settings) to a JSON file or restore a previous backup.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-primary/50 text-text rounded-xl font-medium transition-all hover:bg-white/10 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4 text-primary shrink-0" />
                <span>Export Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-accent/50 text-text rounded-xl font-medium transition-all hover:bg-white/10 text-xs sm:text-sm"
              >
                <Upload className="w-4 h-4 text-accent shrink-0" />
                <span>Import Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={handleFactoryResetClick}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded-xl font-medium transition-all text-xs sm:text-sm sm:ml-auto"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Reset All Workspace Data</span>
              </button>
            </div>
          </div>
        </form>
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
