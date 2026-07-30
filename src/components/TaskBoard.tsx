import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Circle, Trash2, Zap, Plus, Edit, CalendarDays, Sparkles, X, Folder, ChevronDown, ChevronRight, Target } from 'lucide-react';
import { useStore, Task } from '@/store';

type FilterStatus = 'all' | 'pending' | 'completed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high';
type SortBy = 'createdAt' | 'dueDate' | 'priority';
type SortOrder = 'asc' | 'desc';

const PRIORITY_ORDER = { low: 1, medium: 2, high: 3 };

export default function TaskBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tasks,
    toggleTask,
    deleteTask,
    addTask,
    editTask,
    toggleActionBoard,
    executeTaskWithAI,
    extractTasksFromChat,
    clearCompletedTasks,
    isProcessing
  } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), undefined, newTaskPriority);
      setNewTaskTitle('');
    }
  };

  const handleExtractFromChat = () => {
    const addedCount = extractTasksFromChat();
    if (addedCount > 0) {
      setToastMessage(`✨ Extracted ${addedCount} task${addedCount > 1 ? 's' : ''} from chat!`);
    } else {
      setToastMessage(`ℹ️ No new tasks found in current chat.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteTask = async (taskId: string) => {
    setExecutingTaskId(taskId);
    if (location.pathname !== '/') {
      navigate('/');
    }
    await executeTaskWithAI(taskId);
    setExecutingTaskId(null);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (filterStatus === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    filtered.sort((a, b) => {
      let compare = 0;
      if (sortBy === 'createdAt') {
        compare = (a.createdAt || 0) - (b.createdAt || 0);
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate || Infinity;
        const dateB = b.dueDate || Infinity;
        compare = dateA - dateB;
      } else if (sortBy === 'priority') {
        const prioA = PRIORITY_ORDER[a.priority || 'low'];
        const prioB = PRIORITY_ORDER[b.priority || 'low'];
        compare = prioA - prioB;
      }
      return sortOrder === 'asc' ? compare : -compare;
    });

    return filtered;
  }, [tasks, filterStatus, filterPriority, sortBy, sortOrder]);

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <aside className="w-72 md:w-80 glass-panel border-l border-white/10 h-full flex flex-col transition-all duration-300 shrink-0 select-none z-10">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-glow-violet">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-base tracking-wide text-text">Project Plans</h2>
              <p className="text-[11px] font-mono text-text-muted">{completedTasksCount}/{totalTasks} Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              {progressPercent}%
            </span>
            <button
              onClick={toggleActionBoard}
              className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-white/10 transition-colors"
              title="Close Action Board Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-white/5 mb-3">
          <div
            className="bg-gradient-to-r from-primary to-cyan-400 h-full transition-all duration-500 rounded-full shadow-glow-cyan"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Sync Action Tools */}
        <div className="flex items-center justify-between gap-2 pt-1 font-mono text-[10px]">
          <button
            onClick={handleExtractFromChat}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg font-bold transition-all shadow-glow-cyan"
            title="Scan active chat and extract action items directly to board"
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Extract from Chat</span>
          </button>

          {completedTasksCount > 0 && (
            <button
              onClick={clearCompletedTasks}
              className="flex items-center gap-1 py-1.5 px-2 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-text-muted hover:text-rose-400 rounded-lg transition-all"
              title="Clear completed tasks"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Done</span>
            </button>
          )}
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mt-2.5 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono text-center animate-in fade-in">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Add Task Input & Priority Badges */}
      <div className="p-4 border-b border-white/10 bg-slate-900/20">
        <form onSubmit={handleAddTask} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add action item..."
              className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="p-2 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 rounded-xl font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>Priority:</span>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as const).map(prio => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setNewTaskPriority(prio)}
                  className={`px-2 py-0.5 rounded-lg border uppercase transition-all ${
                    newTaskPriority === prio
                      ? prio === 'high' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        : prio === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-text-muted hover:text-text'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono mt-3 pt-3 border-t border-white/5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-text focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-text focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1 text-text focus:outline-none focus:border-primary/50"
          >
            <option value="createdAt">Date</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 bg-slate-950/80 border border-white/10 rounded-lg text-text-muted hover:text-text transition-colors ml-auto"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* 2-Level Nested Plan & Phase Folders Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-10 px-4 text-text-muted">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-text-muted/40" />
            <p className="text-xs font-mono">No tasks found. Add tasks manually or click Extract from Chat!</p>
          </div>
        ) : (
          (() => {
            // Group tasks by Project -> Phase -> Tasks
            const projectTree: Record<string, Record<string, Task[]>> = {};

            filteredAndSortedTasks.forEach(task => {
              const parts = task.title.split(' ➔ ');
              let projectName = 'General Tasks';
              let phaseName = 'Action Items';

              if (parts.length >= 3) {
                projectName = parts[0];
                phaseName = parts[1];
              } else if (parts.length === 2) {
                phaseName = parts[0];
              }

              if (!projectTree[projectName]) projectTree[projectName] = {};
              if (!projectTree[projectName][phaseName]) projectTree[projectName][phaseName] = [];
              projectTree[projectName][phaseName].push(task);
            });

            return Object.entries(projectTree).map(([projectName, phases]) => (
              <ProjectPlanFolder
                key={projectName}
                projectName={projectName}
                phases={phases}
                executingTaskId={executingTaskId}
                isProcessing={isProcessing}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                editTask={editTask}
                handleExecuteTask={handleExecuteTask}
              />
            ));
          })()
        )}
      </div>
    </aside>
  );
}

function ProjectPlanFolder({
  projectName,
  phases,
  executingTaskId,
  isProcessing,
  toggleTask,
  deleteTask,
  editTask,
  handleExecuteTask
}: {
  projectName: string;
  phases: Record<string, Task[]>;
  executingTaskId: string | null;
  isProcessing: boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newTitle?: string, newDueDate?: number, newPriority?: 'low' | 'medium' | 'high') => void;
  handleExecuteTask: (id: string) => void;
}) {
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const allProjectTasks = Object.values(phases).flat();
  const completedInProject = allProjectTasks.filter(t => t.completed).length;
  const isGeneral = projectName === 'General Tasks';

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden transition-all shadow-lg">
      {/* Top Project Folder Header */}
      <button
        onClick={() => setIsProjectOpen(!isProjectOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 hover:bg-slate-800/80 flex items-center justify-between transition-all border-b border-white/10 group"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <Folder className={`w-4 h-4 shrink-0 transition-transform ${isGeneral ? 'text-amber-400' : 'text-primary group-hover:scale-110'}`} />
          <span className="font-mono text-xs font-bold text-text truncate tracking-wide">{projectName}</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            {completedInProject}/{allProjectTasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-text-muted group-hover:text-text">
          {isProjectOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Nested Phases Inside Project */}
      {isProjectOpen && (
        <div className="p-2 space-y-2 bg-slate-950/60">
          {Object.entries(phases)
            .sort(([aPhase], [bPhase]) => {
              const aNum = parseInt(aPhase.match(/Phase\s*(\d+)/i)?.[1] || '999', 10);
              const bNum = parseInt(bPhase.match(/Phase\s*(\d+)/i)?.[1] || '999', 10);
              return aNum - bNum;
            })
            .map(([phaseName, phaseTasks]) => (
            <CollapsiblePhaseFolder
              key={phaseName}
              phaseName={phaseName}
              tasks={phaseTasks}
              executingTaskId={executingTaskId}
              isProcessing={isProcessing}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              editTask={editTask}
              handleExecuteTask={handleExecuteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsiblePhaseFolder({
  phaseName,
  tasks,
  executingTaskId,
  isProcessing,
  toggleTask,
  deleteTask,
  editTask,
  handleExecuteTask
}: {
  phaseName: string;
  tasks: Task[];
  executingTaskId: string | null;
  isProcessing: boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newTitle?: string, newDueDate?: number, newPriority?: 'low' | 'medium' | 'high') => void;
  handleExecuteTask: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const completedInPhase = tasks.filter(t => t.completed).length;

  return (
    <div className="rounded-xl border border-white/5 bg-slate-900/50 overflow-hidden transition-all">
      {/* Sub-Phase Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between transition-colors border-b border-white/5 group"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
          <span className="font-mono text-[11px] font-semibold text-text-muted group-hover:text-text truncate">{phaseName}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-text-muted border border-white/10 shrink-0">
            {completedInPhase}/{tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-text-muted group-hover:text-text">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Step Tasks */}
      {isOpen && (
        <div className="p-2 space-y-2 bg-slate-950/40">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isExecuting={executingTaskId === task.id || (isProcessing && executingTaskId === task.id)}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              onEdit={editTask}
              onExecute={() => handleExecuteTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, isExecuting, onToggle, onDelete, onEdit, onExecute }: { 
  task: Task; 
  isExecuting: boolean;
  onToggle: () => void; 
  onDelete: () => void; 
  onEdit: (id: string, newTitle?: string, newDueDate?: number, newPriority?: 'low' | 'medium' | 'high') => void;
  onExecute: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().substr(0, 10) : '');
  const [editedPriority, setEditedPriority] = useState(task.priority || 'medium');

  const handleSaveEdit = () => {
    const newTitle = editedTitle.trim();
    const newDueDate = editedDueDate ? new Date(editedDueDate).getTime() : undefined;
    const newPriority = editedPriority;

    if (newTitle !== task.title || newDueDate !== task.dueDate || newPriority !== task.priority) {
      onEdit(task.id, newTitle, newDueDate, newPriority);
    }
    setIsEditing(false);
  };

  const getPriorityBadge = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono uppercase font-bold">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase font-bold">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`p-3.5 rounded-2xl border transition-all duration-300 group ${
      task.completed 
        ? 'bg-slate-950/40 border-white/5 opacity-60' 
        : isExecuting
        ? 'bg-amber-500/10 border-amber-500/50 shadow-glow-violet animate-pulse'
        : 'bg-slate-900/60 border-white/10 hover:border-primary/40 shadow-glass'
    }`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 shrink-0 transition-transform active:scale-90">
          {task.completed ? (
             <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          ) : (
             <Circle className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLElement).blur()}
                autoFocus
                className="w-full bg-slate-950 border border-primary/50 rounded-lg px-2 py-1 text-xs text-text focus:outline-none"
              />
              <div className="flex gap-2 text-xs">
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  onBlur={handleSaveEdit}
                  className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-text text-[11px]"
                />
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as 'low' | 'medium' | 'high')}
                  onBlur={handleSaveEdit}
                  className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-text text-[11px]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <p
                className={`text-xs font-medium leading-relaxed break-words ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}
                onDoubleClick={() => setIsEditing(true)}
              >
                {(task.title.includes(' ➔ ') ? task.title.split(' ➔ ').slice(-1)[0] : task.title).replace(/\*\*/g, '')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getPriorityBadge(task.priority)}
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    <CalendarDays className="w-3 h-3 text-primary" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {!task.completed && !isEditing && (
                <button
                  onClick={onExecute}
                  disabled={isExecuting}
                  className={`w-full flex items-center justify-center gap-1.5 text-xs font-sans font-extrabold px-3 py-1.5 rounded-xl transition-all duration-300 mt-2.5 shadow-md active:scale-95 group/btn border overflow-hidden relative ${
                    isExecuting
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 cursor-wait animate-pulse'
                      : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 border-cyan-300/40 hover:scale-[1.02] hover:shadow-[0_0_18px_rgba(0,240,255,0.6)]'
                  }`}
                  title="Ask AI Agent to execute and solve this task"
                >
                  <Zap className={`w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0 ${isExecuting ? 'animate-spin' : 'group-hover/btn:scale-110 transition-transform'}`} />
                  <span className="tracking-tight whitespace-nowrap">{isExecuting ? 'Executing Task...' : '⚡ Execute with AI'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-white/10 transition-colors"
              title="Edit Task"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-white/10 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}