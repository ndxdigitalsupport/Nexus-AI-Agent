import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Key, Cpu, Sliders, Check, Eye, EyeOff, RotateCcw, Sparkles, Server, Download, Upload, Database, AlertTriangle, ArrowLeft } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const MODEL_PRESETS = [
  { id: 'openrouter/free', name: 'OpenRouter Free', provider: 'OpenRouter', description: 'Auto-selects best available free model' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Exceptional reasoning and coding capability' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Flagship multimodal model from OpenAI' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'High-performance open reasoning model' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Fast, lightweight next-gen model' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, exportState, importState, resetAllData } = useStore();

  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(settings?.selectedModel || 'openrouter/free');
  const [customModelInput, setCustomModelInput] = useState('');
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
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaultKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    const defaultModel = 'openrouter/free';
    const defaultEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
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
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-sm font-medium animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Settings Saved!</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {MODEL_PRESETS.map((preset) => {
                const isSelected = selectedModel === preset.id && !customModelInput;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedModel(preset.id);
                      setCustomModelInput('');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-glow-cyan scale-[1.01]'
                        : 'bg-slate-950/40 border-white/10 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-text">{preset.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted font-mono">
                        {preset.provider}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-2">{preset.description}</p>
                    <p className="text-[11px] font-mono text-primary/80 truncate">{preset.id}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Model String */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Custom Model ID (Optional)
              </label>
              <input
                type="text"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
              />
              <p className="text-xs text-text-muted mt-1">
                Enter any supported model string to override preset selection.
              </p>
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

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-primary/50 text-text rounded-xl font-medium transition-all hover:bg-white/10"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Export Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-accent/50 text-text rounded-xl font-medium transition-all hover:bg-white/10"
              >
                <Upload className="w-4 h-4 text-accent" />
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
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded-xl font-medium transition-all ml-auto"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Reset All Workspace Data</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-text-muted hover:text-text hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Settings Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold hover:brightness-110 transition-all shadow-glow-cyan"
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
