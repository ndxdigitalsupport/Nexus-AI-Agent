import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { FileText, Code, Check, Copy, Download, X, Edit2, Sparkles, CheckCircle2, FileSpreadsheet, Scale, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SimpleMdeEditor from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export default function ArtifactStudio() {
  const { activeArtifact, isArtifactStudioOpen, closeArtifactStudio, updateActiveArtifactContent } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const mdeOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
      toolbar: [
        "bold", "italic", "heading", "|",
        "quote", "unordered-list", "ordered-list", "|",
        "link", "image", "|",
        "preview", "side-by-side", "fullscreen", "|",
        "guide"
      ] as any,
    };
  }, []);

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
      <div className="p-4 md:p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0 shadow-glow-cyan">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-text truncate">{activeArtifact.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md ${
              isEditing 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-glow-violet' 
                : 'bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border-white/10'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Edit2 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
          </button>

          <button
            onClick={closeArtifactStudio}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 transition-colors"
            title="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User-Friendly Action Toolbar */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Document Text'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted font-medium">Download As:</span>
          <button
            onClick={() => handleExportFile('txt')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold transition-all shadow-glow-cyan"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word / Text (.txt)</span>
          </button>
          <button
            onClick={() => handleExportFile('html')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Web Page (.html)</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center animate-fadeIn">
          ✓ {downloadNotice}
        </div>
      )}

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950/60">
        {isEditing ? (
          <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-inner">
            <SimpleMdeEditor
              options={mdeOptions}
              value={activeArtifact.content}
              onChange={updateActiveArtifactContent}
              className="w-full h-full font-mono text-xs text-text"
            />
          </div>
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
