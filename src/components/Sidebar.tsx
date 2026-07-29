import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Settings, History, Cpu, Hexagon, Book, MessageSquarePlus, Trash2, MessageSquare, Search, Star, FolderPlus, Plus, Folder, Check, X, ChevronDown, ChevronRight, GripVertical, Zap, Target, LogOut, LogIn } from 'lucide-react';
import { useStore } from '../store';
import ConfirmModal from './ConfirmModal';

export default function Sidebar({ onOpenLoginModal }: { onOpenLoginModal?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    folders = [],
    startNewConversation,
    loadConversation,
    deleteConversation,
    togglePinConversation,
    setConversationCategory,
    addFolder,
    deleteFolder,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    isAdminAuthenticated,
    currentUser,
    logoutUser
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [draggedChatId, setDraggedChatId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  // Custom Modal Confirmation State
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

  const handleNewChat = () => {
    startNewConversation();
    toggleMobileSidebar(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    toggleMobileSidebar(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const folderName = newFolderName.trim();
      addFolder(folderName);
      setOpenFolders(prev => ({ ...prev, [folderName]: true }));
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleDeleteFolder = (folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project Folder',
      message: `Are you sure you want to delete folder "${folderName}"? Chats inside this folder will be unassigned safely.`,
      onConfirm: () => {
        deleteFolder(folderName);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteConversation = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Conversation',
      message: `Are you sure you want to delete "${title}"? This conversation log will be permanently deleted.`,
      onConfirm: () => {
        deleteConversation(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleFolderExpand = (folderName: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderName]: prev[folderName] === undefined ? false : !prev[folderName]
    }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (chatId: string) => {
    setDraggedChatId(chatId);
  };

  const handleDragOverFolder = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolder !== folderName) {
      setDragOverFolder(folderName);
    }
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolder: string | undefined) => {
    e.preventDefault();
    setDragOverFolder(null);
    if (draggedChatId) {
      setConversationCategory(draggedChatId, targetFolder || '');
      setDraggedChatId(null);
      if (targetFolder && openFolders[targetFolder] === false) {
        setOpenFolders(prev => ({ ...prev, [targetFolder]: true }));
      }
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations
    .filter(conv => conv.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const unpinnedConversations = filteredConversations
    .filter(conv => !conv.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const allFolderNames = Array.from(new Set(folders || []));

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity"
          onClick={() => toggleMobileSidebar(false)}
        />
      )}

      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-72 md:w-64 glass-panel border-r border-white/10 h-full flex flex-col justify-between py-6 
        transition-transform duration-300 ease-in-out shrink-0 select-none bg-[#0a0d1a] md:bg-transparent
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-3 md:px-4 flex-grow flex flex-col min-h-0">
          {/* Brand Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 mb-6 px-1">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/'); toggleMobileSidebar(false); }}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/80 border border-cyan-500/40 shadow-glow-cyan group hover:border-cyan-400 transition-all duration-300">
                <img src="/favicon.svg" alt="Nexus Logo" className="w-7 h-7 transform group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-extrabold text-xl tracking-wider gradient-text">NEXUS</span>
                <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase font-semibold">AI Agent OS</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button 
              onClick={() => toggleMobileSidebar(false)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-start gap-3 p-3 rounded-xl bg-gradient-to-r from-primary via-cyan-400 to-cyan-500 text-slate-950 font-bold mb-4 hover:brightness-110 transition-all duration-300 shadow-glow-cyan active:scale-95 group"
        >
          <MessageSquarePlus className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="text-sm tracking-wide">New Chat</span>
        </button>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1.5 mb-5">
          <NavItem icon={<Terminal className="w-5 h-5" />} label="Terminal" to="/" active={location.pathname === '/'} onClick={() => toggleMobileSidebar(false)} />
          <NavItem icon={<Target className="w-5 h-5 text-amber-400" />} label="Project Plans" to="/action-board" active={location.pathname === '/action-board'} onClick={() => toggleMobileSidebar(false)} />
          <NavItem icon={<History className="w-5 h-5" />} label="History" to="/history" active={location.pathname === '/history'} onClick={() => toggleMobileSidebar(false)} />
          {isAdminAuthenticated && (
            <>
              <NavItem icon={<Cpu className="w-5 h-5" />} label="Personas" to="/agents" active={location.pathname === '/agents'} onClick={() => toggleMobileSidebar(false)} />
              <NavItem icon={<Book className="w-5 h-5" />} label="Knowledge Base" to="/knowledge-base" active={location.pathname === '/knowledge-base'} onClick={() => toggleMobileSidebar(false)} />
            </>
          )}
        </nav>

        {/* Search Bar */}
        <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-text-muted">
          <Search className="w-3.5 h-3.5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-text placeholder:text-text-muted/60 text-xs font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text text-[10px]">✕</button>
          )}
        </div>

        {/* Main Scrollable Tree Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* Pinned Chats Section */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" /> Pinned Chats
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {pinnedConversations.length}
                </span>
              </div>

              <div className="space-y-1">
                {pinnedConversations.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    folders={allFolderNames}
                    isActive={conv.id === activeConversationId && location.pathname === '/'}
                    onSelect={() => handleSelectConversation(conv.id)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => handleDeleteConversation(conv.id, conv.title)}
                    onAssignFolder={(cat) => setConversationCategory(conv.id, cat)}
                    onDragStart={() => handleDragStart(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vertical Folders Accordion Tree */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3 h-3 text-cyan-400" /> Project Folders
              </span>

              <button
                onClick={() => setIsAddingFolder(!isAddingFolder)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-primary transition-colors text-xs flex items-center gap-1 font-mono"
                title="Create New Folder"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[10px]">Folder</span>
              </button>
            </div>

            {/* New Folder Form */}
            {isAddingFolder && (
              <form onSubmit={handleCreateFolder} className="flex items-center gap-1.5 mb-3 px-1">
                <input
                  type="text"
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  className="flex-1 bg-slate-950 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-text placeholder:text-text-muted/50 focus:outline-none"
                />
                <button type="submit" className="p-1.5 bg-primary text-slate-950 rounded-lg hover:brightness-110">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setIsAddingFolder(false)} className="p-1.5 bg-white/10 text-text-muted rounded-lg hover:text-text">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Vertical Folders List */}
            <div className="space-y-2">
              {allFolderNames.length === 0 ? (
                <div className="p-3 text-[11px] text-text-muted/60 font-mono text-center border border-dashed border-white/10 rounded-xl">
                  No folders created yet.<br />
                  Click <span className="text-primary font-bold">+ Folder</span> to create one!
                </div>
              ) : (
                allFolderNames.map(folderName => {
                  const isExpanded = openFolders[folderName] !== false;
                  const folderChats = unpinnedConversations.filter(c => c.category === folderName);
                  const isTarget = dragOverFolder === folderName;

                  return (
                    <div
                      key={folderName}
                      onDragOver={(e) => handleDragOverFolder(e, folderName)}
                      onDragLeave={() => setDragOverFolder(null)}
                      onDrop={(e) => handleDropOnFolder(e, folderName)}
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        isTarget
                          ? 'bg-primary/20 border-primary shadow-glow-cyan scale-[1.01]'
                          : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Folder Accordion Header */}
                      <div
                        onClick={() => toggleFolderExpand(folderName)}
                        className="group flex items-center justify-between p-2 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-text">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                          )}
                          <Folder className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="truncate">{folderName}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-text-muted border border-white/10">
                            {folderChats.length}
                          </span>

                          <button
                            onClick={(e) => handleDeleteFolder(folderName, e)}
                            className="hidden group-hover:flex p-1 text-text-muted hover:text-rose-400"
                            title={`Delete folder "${folderName}"`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    {/* Folder Nested Chats */}
                    {isExpanded && (
                      <div className="pl-3 pr-1 pb-1 space-y-1 border-t border-white/5 pt-1">
                        {folderChats.length === 0 ? (
                          <div
                            onDragOver={(e) => handleDragOverFolder(e, folderName)}
                            onDrop={(e) => handleDropOnFolder(e, folderName)}
                            className="p-2 text-[11px] text-text-muted/50 font-mono italic text-center border border-dashed border-white/10 rounded-lg"
                          >
                            Drag & Drop chats here
                          </div>
                        ) : (
                          folderChats.map(conv => (
                            <ConversationItem
                              key={conv.id}
                              conv={conv}
                              folders={allFolderNames}
                              isActive={conv.id === activeConversationId && location.pathname === '/'}
                              onSelect={() => handleSelectConversation(conv.id)}
                              onTogglePin={() => togglePinConversation(conv.id)}
                              onDelete={() => handleDeleteConversation(conv.id, conv.title)}
                              onAssignFolder={(cat) => setConversationCategory(conv.id, cat)}
                              onDragStart={() => handleDragStart(conv.id)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
              )}
            </div>
          </div>

          {/* Uncategorized / Recent Chats Section */}
          <div>
            <div
              onDragOver={(e) => handleDragOverFolder(e, 'Uncategorized')}
              onDragLeave={() => setDragOverFolder(null)}
              onDrop={(e) => handleDropOnFolder(e, undefined)}
              className={`flex items-center justify-between px-2 mb-1.5 rounded-lg transition-all ${
                dragOverFolder === 'Uncategorized' ? 'bg-primary/20 border border-primary p-1.5' : ''
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                Unassigned Chats
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 border border-white/10 text-primary">
                {unpinnedConversations.filter(c => !c.category).length}
              </span>
            </div>

            <div className="space-y-1">
              {unpinnedConversations.filter(c => !c.category).map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  folders={allFolderNames}
                  isActive={conv.id === activeConversationId && location.pathname === '/'}
                  onSelect={() => handleSelectConversation(conv.id)}
                  onTogglePin={() => togglePinConversation(conv.id)}
                  onDelete={() => handleDeleteConversation(conv.id, conv.title)}
                  onAssignFolder={(cat) => setConversationCategory(conv.id, cat)}
                  onDragStart={() => handleDragStart(conv.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation & Profile Badge */}
      <div className="px-3 md:px-4 pt-3 border-t border-white/10 space-y-2">
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" to="/settings" active={location.pathname === '/settings'} onClick={() => toggleMobileSidebar(false)} />

        {/* Logged in User Profile Card */}
        {currentUser ? (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">{currentUser.avatar || '👤'}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text truncate leading-none">{currentUser.name}</p>
                <span className="text-[10px] font-mono text-cyan-400 capitalize">{currentUser.role} mode</span>
              </div>
            </div>
            <button
              onClick={() => {
                logoutUser();
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full mt-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/20 transition-all shadow-glow-cyan"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Sleek Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </aside>
    </>
  );
}

function ConversationItem({
  conv,
  folders,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
  onAssignFolder,
  onDragStart
}: {
  conv: { id: string; title: string; pinned?: boolean; category?: string };
  folders: string[];
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onAssignFolder: (cat: string) => void;
  onDragStart: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      className={`group relative flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all duration-200 active:cursor-grabbing ${
        isActive
          ? 'bg-primary/10 border border-primary/40 text-primary shadow-glow-cyan'
          : 'text-text-muted hover:text-text hover:bg-white/5 border border-transparent'
      }`}
    >
      <GripVertical className="w-3.5 h-3.5 text-text-muted/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab" />
      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs font-medium truncate">{conv.title}</span>
      </div>

      <div className="hidden md:group-hover:flex items-center gap-0.5 shrink-0 relative">
        {/* Assign Folder Dropdown */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-1 rounded-lg text-text-muted hover:text-cyan-300 hover:bg-white/10 transition-colors"
          title="Move to Project Folder"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-6 w-36 rounded-xl bg-slate-900 border border-white/15 shadow-2xl p-1.5 z-30 font-mono text-[11px] space-y-1 backdrop-blur-xl"
          >
            <div className="px-2 py-1 text-[9px] text-text-muted uppercase font-bold border-b border-white/10">Move to Folder</div>
            {folders.map(f => (
              <button
                key={f}
                onClick={() => {
                  onAssignFolder(f);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-1 rounded-lg transition-colors flex items-center justify-between ${
                  conv.category === f ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/10 text-text'
                }`}
              >
                <span className="truncate">📁 {f}</span>
                {conv.category === f && <Check className="w-3 h-3 text-primary shrink-0" />}
              </button>
            ))}
            {conv.category && (
              <button
                onClick={() => {
                  onAssignFolder('');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded-lg hover:bg-white/10 text-rose-400 transition-colors"
              >
                Unassign Folder
              </button>
            )}
          </div>
        )}

        {/* Pin Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${conv.pinned ? 'text-amber-400' : 'text-text-muted hover:text-amber-400'}`}
          title={conv.pinned ? "Unpin Chat" : "Pin Chat to Top"}
        >
          <Star className={`w-3.5 h-3.5 ${conv.pinned ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-white/10 transition-colors"
          title="Delete Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, to, onClick }: { icon: React.ReactNode; label: string; active?: boolean; to: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 p-2.5 md:p-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-primary/20 to-violet-500/10 border border-primary/40 text-primary shadow-glow-cyan'
          : 'text-text-muted hover:text-text hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className={`${active ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`}>
        {icon}
      </span>
      <span className="font-medium text-sm truncate">{label}</span>
    </Link>
  );
}
