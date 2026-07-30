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

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    // Format content cleanly for PDF: strip markdown asterisks and convert bold/headers
    const cleanHtmlContent = activeArtifact.content
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em>$1</em>')
      .replace(/^###\s*(.+)$/gm, '<h3>$1</h3>')
      .replace(/^##\s*(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#\s*(.+)$/gm, '<h1>$1</h1>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeArtifact.title} - NEXUS AI</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.7; font-size: 14px; }
            h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 24px; margin-bottom: 20px; }
            h2 { color: #0369a1; font-size: 18px; margin-top: 20px; }
            h3 { color: #0284c7; font-size: 15px; margin-top: 15px; }
            strong { color: #0f172a; font-weight: 700; }
            p { margin-bottom: 12px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 25px; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; font-size: 11px; color: #64748b; font-family: monospace; text-transform: uppercase; }
            .doc-body { background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><strong>NEXUS AI AGENT</strong> - ${activeArtifact.type.toUpperCase()} EXPORT</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
          <h1>${activeArtifact.title}</h1>
          <div class="doc-body"><p>${cleanHtmlContent}</p></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    setDownloadNotice('Opened PDF Print Dialog');
    setTimeout(() => setDownloadNotice(null), 3000);
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
            onClick={() => {
              if (!isEditing && activeArtifact) {
                // Strip raw markdown bold/italic asterisks for clean text editing
                const cleanedText = activeArtifact.content.replace(/\*\*/g, '').replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '$1');
                updateActiveArtifactContent(cleanedText);
              }
              setIsEditing(!isEditing);
            }}
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
          <span className="text-[11px] text-text-muted font-medium">Export As:</span>
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition-all shadow-glow-violet"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>PDF Document (.pdf)</span>
          </button>
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
          <textarea
            value={activeArtifact.content}
            onChange={(e) => updateActiveArtifactContent(e.target.value)}
            className="w-full h-full min-h-[480px] bg-slate-900/90 border border-cyan-500/30 focus:border-cyan-400 rounded-2xl p-5 font-mono text-sm text-text focus:outline-none leading-relaxed shadow-inner"
            placeholder="Edit document content..."
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
