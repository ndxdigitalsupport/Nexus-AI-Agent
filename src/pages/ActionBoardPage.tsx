import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Task } from '@/store';
import { Zap, CheckCircle2, Circle, Trash2, Plus, CalendarDays, ArrowLeft, Folder, Sparkles, Filter, ChevronDown, ChevronRight, Target, Edit2 } from 'lucide-react';
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
    deleteProjectPlan,
    isProcessing,
  } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [searchQuery] = useState('');
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
                  <Target className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold font-mono neon-text">Project Plans</h1>
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

          {/* Pill-Style Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text-muted flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                {(['all', 'pending', 'completed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterStatus === st
                        ? 'bg-primary/20 text-cyan-300 border border-primary/40 shadow-glow-cyan font-bold'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                {(['all', 'high', 'medium', 'low'] as const).map(prio => (
                  <button
                    key={prio}
                    onClick={() => setFilterPriority(prio)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterPriority === prio
                        ? prio === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                          : prio === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                          : prio === 'low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                          : 'bg-primary/20 text-cyan-300 border border-primary/40 font-bold shadow-glow-cyan'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
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
                editTask={editTask}
                handleExecuteTask={handleExecuteTask}
                onDeleteProject={(pName) => {
                  setConfirmModal({
                    isOpen: true,
                    title: `Delete ${pName}`,
                    message: `⚠️ Are you sure you want to delete the entire project plan "${pName}" and all its tasks?`,
                    onConfirm: () => {
                      deleteProjectPlan(pName);
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                }}
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
  editTask,
  handleExecuteTask,
  onDeleteProject
}: {
  projectName: string;
  phases: Record<string, Task[]>;
  executingTaskId: string | null;
  isProcessing: boolean;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newTitle?: string) => void;
  handleExecuteTask: (id: string) => void;
  onDeleteProject: (projectName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState(projectName);

  const allTasksInProject = Object.values(phases).flat();
  const completedInProject = allTasksInProject.filter(t => t.completed).length;
  const isGeneral = projectName === 'General Tasks & Action Items';

  const handleSaveProjectTitle = () => {
    const trimmed = editProjectTitle.trim();
    if (trimmed && trimmed !== projectName) {
      allTasksInProject.forEach(t => {
        const parts = t.title.split(' ➔ ');
        if (parts.length >= 2) {
          parts[0] = trimmed;
          editTask(t.id, parts.join(' ➔ '));
        }
      });
    } else {
      setEditProjectTitle(projectName);
    }
    setIsEditingProject(false);
  };

  const handleSaveTaskTitle = (taskId: string, originalTitle: string) => {
    if (editTaskTitle.trim() && editTaskTitle.trim() !== originalTitle) {
      editTask(taskId, editTaskTitle.trim());
    }
    setEditingTaskId(null);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      {/* Project Folder Title Header (Clickable Collapsible Accordion) */}
      <div
        onClick={() => {
          if (!isEditingProject) setIsOpen(!isOpen);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditingProject(true);
          setEditProjectTitle(projectName);
        }}
        onKeyDown={(e) => {
          if (e.key === 'F2') {
            e.preventDefault();
            e.stopPropagation();
            setIsEditingProject(true);
            setEditProjectTitle(projectName);
          }
        }}
        tabIndex={0}
        className="w-full p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 hover:bg-slate-800/80 transition-all border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-left group cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 shrink-0 ${isGeneral ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-primary/10 text-primary border border-primary/30'}`}>
            <Folder className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            {isEditingProject ? (
              <input
                type="text"
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                onBlur={handleSaveProjectTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveProjectTitle();
                  if (e.key === 'Escape') setIsEditingProject(false);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="bg-slate-950 border border-cyan-400 rounded px-2.5 py-1 text-lg font-bold font-mono text-text focus:outline-none w-full max-w-md"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-text tracking-wide group-hover:text-primary transition-colors truncate" title="Double-click or press F2 to rename">
                  {projectName}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingProject(true);
                    setEditProjectTitle(projectName);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-cyan-300 transition-opacity"
                  title="Rename Project Folder (F2)"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs font-mono text-text-muted mt-0.5">{Object.keys(phases).length} Phases • {allTasksInProject.length} Tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono hidden sm:block">
            <div className="text-xs text-text-muted">{completedInProject} / {allTasksInProject.length} Completed</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProject(projectName);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-text-muted hover:text-rose-400 transition-colors"
            title="Delete entire project plan & all its tasks"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted group-hover:text-text">
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Project Phases Content (Phase 1 at Top -> Descending Order) */}
      {isOpen && (
        <div className="p-6 space-y-8 bg-slate-950/40">
          {Object.entries(phases)
            .sort(([aPhase], [bPhase]) => {
              const aNum = parseInt(aPhase.match(/Phase\s*(\d+)/i)?.[1] || '999', 10);
              const bNum = parseInt(bPhase.match(/Phase\s*(\d+)/i)?.[1] || '999', 10);
              return aNum - bNum;
            })
            .map(([phaseName, phaseTasks]) => {
              const phaseCompleted = phaseTasks.filter(t => t.completed).length;
              const phasePercent = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0;

              return (
              <div key={phaseName} className="space-y-4">
                {/* Phase Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold font-mono text-text uppercase tracking-wider">{phaseName}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                      {phaseTasks.length} tasks
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300 rounded-full" style={{ width: `${phasePercent}%` }} />
                    </div>
                    <span className="text-emerald-400 font-bold">{phasePercent}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phaseTasks.map(task => {
                    const isEditing = editingTaskId === task.id;
                    const cleanTitle = (task.title.includes(' ➔ ') ? task.title.split(' ➔ ').slice(-1)[0] : task.title).replace(/\*\*/g, '');

                    return (
                      <div
                        key={task.id}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTaskId(task.id);
                          setEditTaskTitle(cleanTitle);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'F2') {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingTaskId(task.id);
                            setEditTaskTitle(cleanTitle);
                          }
                        }}
                        tabIndex={0}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-cyan-400/50 ${
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
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border shadow-sm ${
                                  task.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]' :
                                  task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTaskId(task.id);
                                  setEditTaskTitle(cleanTitle);
                                }}
                                className="p-1 text-text-muted hover:text-cyan-300 transition-colors"
                                title="Rename Task (F2)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="p-1 text-text-muted hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <input
                              type="text"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              onBlur={() => handleSaveTaskTitle(task.id, cleanTitle)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTaskTitle(task.id, cleanTitle);
                                if (e.key === 'Escape') setEditingTaskId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="w-full bg-slate-950 border border-cyan-400 rounded px-2 py-1 text-sm font-medium text-text focus:outline-none"
                            />
                          ) : (
                            <p className={`text-sm font-medium leading-relaxed ${task.completed ? 'line-through text-text-muted' : 'text-text'}`} title="Double-click or press F2 to rename">
                              {cleanTitle}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          {task.dueDate ? (
                            <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted/60">No due date</span>
                          )}

                          {!task.completed && (
                            <button
                              onClick={() => handleExecuteTask(task.id)}
                              disabled={executingTaskId === task.id}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 font-sans font-extrabold text-xs hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.7)] group border border-cyan-300/40 relative overflow-hidden"
                            >
                              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:scale-125 transition-transform duration-300 shrink-0" />
                              <span className="tracking-tight">Execute with AI</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
