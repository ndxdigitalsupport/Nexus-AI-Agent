import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Key, Cpu, Sliders, Check, Eye, EyeOff, RotateCcw, Sparkles, Server, Download, Upload, Database, AlertTriangle, ArrowLeft } from 'lucide-react';
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
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', description: '国产聚合模型 1M 上下文，适合 Agent、工作流、图片理解和高并发', contextWindow: '1M', hasVision: true },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'Anthropic', description: 'Claude 新一代高能力主力模型，适合复杂推理、代码、多轮 Agent', contextWindow: '1M', hasVision: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', description: 'Claude 顶级高成本模型，适合最高价值复杂推理、深度研究、长周期 Agent', contextWindow: '1M', hasVision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: '轻量快速 Claude 模型，适合摘要、分类、快速问答', contextWindow: '256K', hasVision: true },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', description: '1M 上下文多模态能力，适合复杂推理、长文档分析和代码方案', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', provider: 'Anthropic', description: '适合深度代码审查、复杂规划和多轮推敲', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'Anthropic', description: '适合高价值复杂任务、长期 Agent 和严谨报告', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'Anthropic', description: '适合复杂 Agent 编程、企业级任务、深度推理和高质量工程交付', contextWindow: '1M', hasVision: true },

  // OpenAI
  { id: 'gpt-5.6-sol', name: 'GPT 5.6 Sol', provider: 'OpenAI', description: 'GPT 5.6 系列高能力模型，适合复杂问答、代码、长文档理解和图片理解', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-terra', name: 'GPT 5.6 Terra', provider: 'OpenAI', description: 'GPT 5.6 系列平衡模型，适合日常问答、代码辅助、文档处理', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-luna', name: 'GPT 5.6 Luna', provider: 'OpenAI', description: '适合高频调用、基础问答、文档处理和图片理解任务', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.4', name: 'GPT 5.4', provider: 'OpenAI', description: 'OpenAI 通用主力模型，适合日常问答、代码、长文档和 Agent 任务', contextWindow: '1M', hasVision: true },
  { id: 'gpt-5.5', name: 'GPT 5.5', provider: 'OpenAI', description: 'OpenAI 高能力模型，适合复杂推理、代码规划、高质量写作', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.3-codex-spark', name: 'GPT 5.3 Codex Spark', provider: 'OpenAI', description: 'Codex 实时编码模型，适合边写边改、快速补丁、UI 微调', contextWindow: '128K', hasVision: false },

  // Qwen 通义千问
  { id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus', provider: '通义千问', description: '高性价比长上下文模型，适合长文档、代码仓库、Agent 工具调用', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-plus', name: 'Qwen 3.7 Plus', provider: '通义千问', description: '新一代平衡型 Agent 模型，适合 OpenClaw、Claude Code、Hermes', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-max', name: 'Qwen 3.7 Max', provider: '通义千问', description: '旗舰推理模型，适合复杂推理、代码规划、深度分析和长周期 Agent', contextWindow: '1M', hasVision: false },
  { id: 'qwen3.8-max', name: 'Qwen 3.8 Max', provider: '通义千问', description: 'Qwen 路由支持 1M 上下文、图片理解与多模态输入', contextWindow: '1M', hasVision: true },

  // DeepSeek 深度求索
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', description: '高能力推理模型，适合代码、数学、复杂规划、深度分析', contextWindow: '1M', hasVision: false },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', description: '轻快版 DeepSeek，适合高频问答、摘要和快速推理', contextWindow: '1M', hasVision: false },

  // ByteDance 字节跳动 / Doubao
  { id: 'doubao-seed-2.0-code', name: 'Doubao Seed 2.0 Code', provider: '字节跳动', description: '字节代码模型，适合代码生成、改写、调试和工程辅助', contextWindow: '200K', hasVision: true },
  { id: 'doubao-seed-2.0-pro', name: 'Doubao Seed 2.0 Pro', provider: '字节跳动', description: '字节通用增强模型，适合复杂问答、写作、分析和多模态任务', contextWindow: '128K', hasVision: true },

  // Zhipu 智谱
  { id: 'glm-5.1', name: 'GLM 5.1', provider: '智谱 GLM', description: '智谱旗舰通用模型，适合写作、分析、代码、Agent 工程', contextWindow: '256K', hasVision: true },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: '智谱 GLM', description: '智谱新一代多模态强模型，适合复杂写作、分析、代码和图片理解', contextWindow: '1M', hasVision: true },

  // Kimi / xAI / Xiaomi / MiniMax / Meituan / Tencent / Stepfun
  { id: 'kimi-k3', name: 'Kimi K3', provider: 'Moonshot Kimi', description: '新一代长上下文多模态模型，适合超长文档分析与图片理解', contextWindow: '1M', hasVision: true },
  { id: 'grok-4.5', name: 'Grok 4.5', provider: 'xAI Grok', description: 'xAI Grok 通用强模型，适合复杂问答、代码、长文档和图片理解', contextWindow: '500K', hasVision: true },
  { id: 'mimo-v2.5-pro', name: 'MiMo v2.5 Pro', provider: '小米 MiMo', description: '小米专业模型，适合长文本、复杂分析、代码规划', contextWindow: '1M', hasVision: false },
  { id: 'mimo-v2.5', name: 'MiMo v2.5', provider: '小米 MiMo', description: '低成本通用模型，适合日常对话、改写、摘要', contextWindow: '1M', hasVision: true },
  { id: 'MiniMax-M3', name: 'MiniMax M3', provider: 'MiniMax', description: '1M 上下文多模态模型，适合长文档、Agent、多轮任务和图片理解', contextWindow: '1M', hasVision: true },
  { id: 'LongCat-2.0', name: 'LongCat 2.0', provider: '美团 LongCat', description: '美团长上下文 Agentic Coding 模型，适合代码仓理解、长文档推理', contextWindow: '1M', hasVision: false },
  { id: 'hy3', name: 'Hunyuan 3 (hy3)', provider: '腾讯混元', description: '腾讯混元 3 推理 / Agent 模型，适合中文推理、代码、长文档理解', contextWindow: '256K', hasVision: false },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', provider: '阶跃星辰', description: '快速通用模型，适合代码、对话、图片理解和轻量 Agent', contextWindow: '256K', hasVision: true },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, exportState, importState, resetAllData } = useStore();

  const isPresetModel = MODEL_PRESETS.some(p => p.id === (settings?.selectedModel || 'openrouter/free'));
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(isPresetModel ? (settings?.selectedModel || 'openrouter/free') : 'custom');
  const [customModelInput, setCustomModelInput] = useState(!isPresetModel ? (settings?.selectedModel || '') : '');
  const [customEndpoint, setCustomEndpoint] = useState(settings?.customEndpoint || 'https://openrouter.ai/api/v1/chat/completions');
  const [temperature, setTemperature] = useState(settings?.temperature ?? 0.7);

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalModel = customModelInput.trim() || selectedModel;
    updateSettings({
      apiKey: apiKey.trim(),
      selectedModel: finalModel,
      customEndpoint: customEndpoint.trim(),
      temperature,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* API Key Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
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
                    onChange={(e) => setApiKey(e.target.value)}
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

          {/* Model Selector Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold text-text">AI Model Selection</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {MODEL_PRESETS.map((preset) => {
                const isSelected = selectedModel === preset.id && !customModelInput;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedModel(preset.id);
                      setCustomModelInput('');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/15 border-primary shadow-glow-cyan scale-[1.01]'
                        : 'bg-slate-950/40 border-white/10 hover:border-primary/40 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs text-text truncate">{preset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted font-mono shrink-0">
                          {preset.provider}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted/80 mb-2 line-clamp-2 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                      <span className="text-primary/90 font-mono truncate">{preset.id}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {preset.contextWindow && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {preset.contextWindow}
                          </span>
                        )}
                        {preset.hasVision && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20" title="Supports Multimodal Image Input">
                            👁️ Vision
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Model ID Card */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              customModelInput.trim()
                ? 'bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-primary/10 border-primary shadow-glow-cyan'
                : 'bg-slate-950/50 border-white/10 hover:border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Custom Model ID</span>
                </label>
                {customModelInput.trim() ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-400" /> Active Override
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-muted">
                    Optional
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => {
                    setCustomModelInput(e.target.value);
                  }}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct or deepseek/deepseek-r1"
                  className="w-full bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-cyan-300 placeholder:text-text-muted/40 focus:outline-none transition-all font-mono text-sm shadow-inner"
                />
                {customModelInput && (
                  <button
                    type="button"
                    onClick={() => setCustomModelInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted hover:text-rose-400 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Custom Endpoint & Parameters */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
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
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://openrouter.ai/api/v1/chat/completions"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setCustomEndpoint('https://openrouter.ai/api/v1/chat/completions')}
                    className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-text-muted hover:text-text transition-colors"
                  >
                    OpenRouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomEndpoint('https://api.openai.com/v1/chat/completions')}
                    className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-text-muted hover:text-text transition-colors"
                  >
                    OpenAI Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomEndpoint('http://localhost:11434/v1/chat/completions')}
                    className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-text-muted hover:text-text transition-colors"
                  >
                    Ollama (Local)
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
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-text-muted hover:text-text hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Settings Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold hover:brightness-110 transition-all shadow-glow-cyan"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
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
