import { useState } from 'react';
import { useStore } from '@/store';
import { FileText, Code, Check, Copy, Download, X, Edit2, Sparkles, CheckCircle2, FileSpreadsheet, Scale, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArtifactStudio() {
  const { activeArtifact, isArtifactStudioOpen, closeArtifactStudio, updateActiveArtifactContent } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isArtifactStudioOpen || !activeArtifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportFile = (extension: 'md' | 'txt' | 'json' | 'html') => {
    const blob = new Blob([activeArtifact.content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeArtifact.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(`Exported as .${extension}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const getIcon = () => {
    switch (activeArtifact.type) {
      case 'code': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'contract': return <Scale className="w-5 h-5 text-amber-400" />;
      case 'table': return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] md:w-[680px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/15 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header Bar */}
      <div className="p-4 md:p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                NEXUS Live Artifact
              </span>
              <span className="text-[10px] font-mono text-text-muted/60 uppercase">{activeArtifact.type}</span>
            </div>
            <h2 className="text-base font-bold text-text truncate font-mono mt-0.5">{activeArtifact.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              isEditing ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Preview' : 'Edit'}</span>
          </button>

          <button
            onClick={closeArtifactStudio}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 transition-colors"
            title="Close Canvas Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Toolbar */}
      <div className="px-5 py-2.5 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code/Text'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-muted/60">Export:</span>
          <button
            onClick={() => handleExportFile('md')}
            className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-colors"
          >
            .MD
          </button>
          <button
            onClick={() => handleExportFile('txt')}
            className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-colors"
          >
            .TXT
          </button>
          <button
            onClick={() => handleExportFile('json')}
            className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-colors"
          >
            .JSON
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 text-xs font-mono text-center animate-fadeIn">
          ✓ {downloadNotice}
        </div>
      )}

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/60">
        {isEditing ? (
          <textarea
            value={activeArtifact.content}
            onChange={(e) => updateActiveArtifactContent(e.target.value)}
            className="w-full h-full min-h-[450px] bg-slate-900/90 border border-white/15 rounded-2xl p-4 font-mono text-xs text-text focus:outline-none focus:border-cyan-400 leading-relaxed shadow-inner"
            placeholder="Edit artifact content..."
          />
        ) : (
          <div className="prose prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/15 prose-pre:rounded-2xl prose-headings:text-cyan-300 font-sans leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {activeArtifact.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
