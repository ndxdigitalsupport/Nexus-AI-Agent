import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Search, BookOpen, Tag, Pin, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useStore, KnowledgeArticle } from '../store';
import ConfirmModal from '../components/ConfirmModal';

export default function KnowledgeBase() {
  const { knowledgeArticles, addArticle, updateArticle, deleteArticle, togglePinArticle } = useStore();

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importedFileCount, setImportedFileCount] = useState<number | null>(null);

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTagsInput, setEditedTagsInput] = useState('');

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

  const handleAddArticle = () => {
    if (newTitle.trim() && newContent.trim()) {
      const tags = newTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      addArticle(newTitle, newContent, tags);
      setNewTitle('');
      setNewContent('');
      setNewTagsInput('');
    }
  };

  const handleFileProcess = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ext = file.name.split('.').pop() || 'file';
          const title = file.name;
          const tags = [ext.toLowerCase(), 'doc-memory', 'file-import'];
          addArticle(title, text, tags);
          count++;
          setImportedFileCount(count);
          setTimeout(() => setImportedFileCount(null), 3000);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files);
  };

  const startEditing = (article: KnowledgeArticle) => {
    setEditingArticleId(article.id);
    setEditedTitle(article.title);
    setEditedContent(article.content);
    setEditedTagsInput(article.tags.join(', '));
  };

  const cancelEditing = () => {
    setEditingArticleId(null);
    setEditedTitle('');
    setEditedContent('');
    setEditedTagsInput('');
  };

  const handleUpdateArticle = () => {
    if (editingArticleId && editedTitle.trim() && editedContent.trim()) {
      const tags = editedTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      updateArticle(editingArticleId, editedTitle, editedContent, tags);
      cancelEditing();
    }
  };

  const handleDeleteClick = (articleId: string, articleTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Memory Article',
      message: `Are you sure you want to delete "${articleTitle}"? It will be removed from your AI knowledge memory.`,
      onConfirm: () => {
        deleteArticle(articleId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const filteredArticles = knowledgeArticles
    .filter(article => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        article.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        article.content.toLowerCase().includes(lowerCaseSearchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
      );
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-8 pb-12">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono neon-text">Knowledge Base & Memory</h1>
            <p className="text-text-muted mt-1">Index document files and persistent context to power AI RAG retrieval.</p>
          </div>
        </div>

        {/* Option A: Drag & Drop Document Memory Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden ${
            isDragging
              ? 'border-primary bg-primary/10 shadow-glow-cyan scale-[1.01]'
              : 'border-white/15 bg-slate-900/40 hover:bg-slate-900/60 hover:border-primary/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileProcess(e.target.files)}
            className="hidden"
            multiple
            accept=".txt,.md,.json,.csv,.js,.ts,.py,.html,.css"
          />

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary mb-3 shadow-glow-cyan">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="font-bold text-lg text-text mb-1">
            Drag & Drop Files to Index Document Memory
          </h3>
          <p className="text-xs text-text-muted font-mono max-w-md">
            Supports <strong className="text-primary">.md, .txt, .json, .csv, .js, .py</strong> files. Files are automatically chunked and indexed into your AI RAG memory.
          </p>

          {importedFileCount !== null && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully imported {importedFileCount} file(s) into memory!</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center shadow-glass">
          <Search className="w-5 h-5 text-primary mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search memory articles by title, content, or tags..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-text placeholder:text-text-muted/60 focus:outline-none text-sm font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add Manual Article Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Create Manual Memory Article
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Article Title (e.g., Project Architecture Specs)"
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors text-sm font-sans"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Detailed content or technical specifications..."
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors text-sm font-sans h-32 resize-y"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tags (comma-separated, e.g. 'architecture, backend, v1')"
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors text-sm font-sans"
              value={newTagsInput}
              onChange={(e) => setNewTagsInput(e.target.value)}
            />
            <button
              onClick={handleAddArticle}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" /> Add Article
            </button>
          </div>
        </div>

        {/* Articles List */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold text-text mb-4">Memory Articles ({filteredArticles.length})</h2>

          {filteredArticles.length === 0 ? (
            <p className="text-text-muted text-sm italic py-8 text-center">No memory articles found. Add one above or drop files to import!</p>
          ) : (
            filteredArticles.map(article => (
              <div
                key={article.id}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  article.pinned
                    ? 'bg-primary/10 border-primary/50 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                {editingArticleId === article.id ? (
                  // Edit Form
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full p-2.5 bg-slate-950 border border-primary/50 rounded-xl text-text text-sm font-semibold focus:outline-none"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full p-2.5 bg-slate-950 border border-primary/50 rounded-xl text-text text-sm focus:outline-none h-32"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full p-2.5 bg-slate-950 border border-primary/50 rounded-xl text-text text-xs focus:outline-none"
                      value={editedTagsInput}
                      onChange={(e) => setEditedTagsInput(e.target.value)}
                      placeholder="Tags (comma-separated)"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleUpdateArticle}
                        className="px-4 py-2 bg-primary text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 transition-all shadow-glow-cyan"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-text-muted text-xs rounded-lg hover:text-text transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-5 h-5 ${article.pinned ? 'text-primary' : 'text-accent'}`} />
                        <h3 className="text-base font-bold text-text">{article.title}</h3>
                      </div>

                      {article.pinned && (
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-glow-cyan">
                          <Pin className="w-3.5 h-3.5 fill-primary" /> Pinned Context
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-white/5 font-sans mb-3">
                      {article.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-lg text-text-muted text-[11px] font-mono flex items-center gap-1">
                            <Tag className="w-3 h-3 text-primary" /> {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePinArticle(article.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                            article.pinned
                              ? 'bg-primary/20 text-primary border border-primary/40 shadow-glow-cyan'
                              : 'bg-white/5 text-text-muted hover:text-text border border-white/10 hover:border-primary/40'
                          }`}
                          title={article.pinned ? "Unpin from AI context" : "Pin to always include in AI context"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${article.pinned ? 'fill-primary' : ''}`} />
                          <span>{article.pinned ? 'Pinned' : 'Pin Context'}</span>
                        </button>

                        <button
                          onClick={() => startEditing(article)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-white/10 transition-colors"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(article.id, article.title)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-white/10 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
