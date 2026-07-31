import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Key, Cpu, Sliders, Check, Eye, EyeOff, Sparkles, Server, Download, Upload, Database, AlertTriangle, ArrowLeft } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import UpgradeModal from '@/components/UpgradeModal';
import { MODEL_PRESETS } from '@/lib/modelPresets';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, exportState, importState, resetAllData, isAdminAuthenticated } = useStore();

  const isPresetModel = MODEL_PRESETS.some(p => p.id === (settings?.selectedModel || 'openrouter/free'));
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(isPresetModel ? (settings?.selectedModel || 'openrouter/free') : 'custom');
  const [customModelInput, setCustomModelInput] = useState(!isPresetModel ? (settings?.selectedModel || '') : '');
  const [customEndpoint, setCustomEndpoint] = useState(settings?.customEndpoint || 'https://openrouter.ai/api/v1/chat/completions');
  const [temperature, setTemperature] = useState(settings?.temperature ?? 0.7);

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean; modelName: string }>({
    isOpen: false,
    modelName: ''
  });

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
                        if (isPaid && !isAdminAuthenticated) {
                          setUpgradeModal({ isOpen: true, modelName: preset.name });
                          return;
                        }
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

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, modelName: '' })}
        selectedModelName={upgradeModal.modelName}
      />
    </div>
  );
}
