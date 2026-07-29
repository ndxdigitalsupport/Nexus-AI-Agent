import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Task } from '@/store';
import { Zap, CheckCircle2, Circle, Trash2, Plus, CalendarDays, ArrowLeft, Folder, Sparkles, Filter, Check, ChevronDown, ChevronRight } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

type FilterStatus = 'all' | 'pending' | 'completed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high';

export default function ActionBoardPage() {
  const navigate = useNavigate();
  const {
    tasks,
    toggleTask,
    deleteTask,
    addTask,
    editTask,
    executeTaskWithAI,
    clearCompletedTasks,
    isProcessing,
  } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

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

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus === 'pending' && t.completed) return false;
      if (filterStatus === 'completed' && !t.completed) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, searchQuery]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), undefined, newTaskPriority);
    setNewTaskTitle('');
  };

  const handleExecuteTask = async (taskId: string) => {
    setExecutingTaskId(taskId);
    navigate('/');
    await executeTaskWithAI(taskId);
    setExecutingTaskId(null);
  };

  const handleClearCompleted = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Completed Tasks',
      message: 'Are you sure you want to remove all completed tasks from your Action Board?',
      onConfirm: () => {
        clearCompletedTasks();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Group tasks into 2-level Project Plan -> Phase hierarchy
  const projectTree = useMemo(() => {
    const tree: Record<string, Record<string, Task[]>> = {};

    filteredTasks.forEach(task => {
      const parts = task.title.split(' ➔ ');
      let projectName = 'General Tasks & Action Items';
      let phaseName = 'General Step Items';

      if (parts.length >= 3) {
        projectName = parts[0];
        phaseName = parts[1];
      } else if (parts.length === 2) {
        phaseName = parts[0];
      }

      if (!tree[projectName]) tree[projectName] = {};
      if (!tree[projectName][phaseName]) tree[projectName][phaseName] = [];
      tree[projectName][phaseName].push(task);
    });

    return tree;
  }, [filteredTasks]);

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-8 pb-12">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Navigation Back Button & Header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/')}
            className="self-start flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text text-xs font-mono transition-all group"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Terminal</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold font-mono neon-text">Action Board & Project Plans</h1>
              </div>
              <p className="text-text-muted">Manage your AI-generated project plans, execution phases, and step-by-step action items.</p>
            </div>

            {/* Overall Progress Widget */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4 min-w-[240px]">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-text-muted font-semibold">Overall Progress</span>
                  <span className="text-primary font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-primary to-cyan-400 h-full transition-all duration-500 rounded-full shadow-glow-cyan"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] font-mono text-text-muted mt-1.5">{completedTasksCount} of {totalTasks} Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Task & Quick Filters Toolbar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Create a new action item or task..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary transition-colors font-sans"
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/10">
                {(['low', 'medium', 'high'] as const).map(prio => (
                  <button
                    key={prio}
                    type="button"
                    onClick={() => setNewTaskPriority(prio)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono uppercase transition-all ${
                      newTaskPriority === prio
                        ? prio === 'high' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold'
                          : prio === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold'
                          : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold'
                        : 'bg-transparent border-transparent text-text-muted hover:text-text'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-5 py-3 bg-gradient-to-r from-primary to-cyan-400 text-slate-950 rounded-xl font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-cyan flex items-center gap-2 shrink-0 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text-muted flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending font-semibold">Pending Only</option>
                <option value="completed font-semibold">Completed Only</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-text focus:outline-none focus:border-primary"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {completedTasksCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-mono transition-all ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Completed Tasks</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Plan Tree Grid */}
        <div className="space-y-6">
          {Object.keys(projectTree).length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-white/10">
              <Sparkles className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
              <p className="text-text-muted font-mono text-base mb-1">No action items or project plans found.</p>
              <p className="text-text-muted/60 text-xs">Ask NEXUS to "create a plan for Techlaw App" in the Terminal to auto-populate project plans!</p>
            </div>
          ) : (
            Object.entries(projectTree).map(([projectName, phases]) => (
              <ProjectPlanBlock
                key={projectName}
                projectName={projectName}
                phases={phases}
                executingTaskId={executingTaskId}
                isProcessing={isProcessing}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                handleExecuteTask={handleExecuteTask}
              />
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

function ProjectPlanBlock({
  projectName,
  phases,
  executingTaskId,
  isProcessing,
  toggleTask,
  deleteTask,
  handleExecuteTask
}: {
  projectName: string;
  phases: Record<string, Task[]>;
  executingTaskId: string | null;
  isProcessing: boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  handleExecuteTask: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const allTasksInProject = Object.values(phases).flat();
  const completedInProject = allTasksInProject.filter(t => t.completed).length;
  const isGeneral = projectName === 'General Tasks & Action Items';

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Project Folder Title Header (Clickable Collapsible Accordion) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 hover:bg-slate-800/80 transition-all border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${isGeneral ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-primary/10 text-primary border border-primary/30'}`}>
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-text tracking-wide group-hover:text-primary transition-colors">{projectName}</h2>
            <p className="text-xs font-mono text-text-muted mt-0.5">{Object.keys(phases).length} Phases • {allTasksInProject.length} Tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs font-bold text-cyan-300 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            {completedInProject} / {allTasksInProject.length} Completed
          </span>
          <div className="p-1.5 rounded-xl bg-white/5 text-text-muted group-hover:text-text transition-colors">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Phases Container */}
      {isOpen && (
        <div className="p-6 space-y-6 bg-slate-950/40">
          {Object.entries(phases).map(([phaseName, phaseTasks]) => (
            <div key={phaseName} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <h3 className="font-mono font-bold text-sm text-text-muted uppercase tracking-wider">{phaseName}</h3>
                <span className="text-xs font-mono text-text-muted/60">({phaseTasks.filter(t => t.completed).length}/{phaseTasks.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {phaseTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      task.completed
                        ? 'bg-slate-950/40 border-white/5 opacity-60'
                        : executingTaskId === task.id || (isProcessing && executingTaskId === task.id)
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-glow-violet animate-pulse'
                        : 'bg-slate-900/80 border-white/10 hover:border-primary/40 shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                          ) : (
                            <Circle className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                              task.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                          <button onClick={() => deleteTask(task.id)} className="p-1 text-text-muted hover:text-rose-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm font-medium leading-relaxed ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}>
                        {(task.title.includes(' ➔ ') ? task.title.split(' ➔ ').slice(-1)[0] : task.title).replace(/\*\*/g, '')}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      {task.dueDate ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                          <CalendarDays className="w-3.5 h-3.5 text-primary" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-text-muted/60">No due date</span>
                      )}

                      {!task.completed && (
                        <button
                          onClick={() => handleExecuteTask(task.id)}
                          disabled={executingTaskId === task.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-primary text-white text-xs font-mono font-bold hover:brightness-110 transition-all shadow-glow-cyan"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Execute with AI</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
