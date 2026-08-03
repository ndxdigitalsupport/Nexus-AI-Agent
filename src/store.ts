import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { syncConversationToSupabase, fetchUserConversationsFromSupabase, syncTaskToSupabase, deleteTaskFromSupabase, getProfileRole, getSessionAccessToken, supabase } from '@/lib/supabase';
import { SKILLOS_LIBRARY, SKILL_LIBRARY_VERSION } from '@/lib/skillLibrary';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  imageUrl?: string; // Base64 data URL or image URL for multimodal vision support
  timestamp: number;
}

// Chat payload sent to the AI engine: either plain text content or a
// multimodal content array (text + image_url parts) for vision models.
export type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export type ChatMessagePayload =
  | { role: string; content: string }
  | { role: string; content: ChatContentPart[] };

// Abort controller for the in-flight streaming request, used by the
// "Stop generating" button so the user can halt output mid-stream.
let activeAbortController: AbortController | null = null;
let activeImageGenTimer: ReturnType<typeof setTimeout> | null = null;

// Queries the serverless web-search proxy and formats results as context for
// the AI. Returns an empty string when search is unavailable or misconfigured.
async function performWebSearch(query: string): Promise<string> {
  try {
    const response = await fetch(import.meta.env.VITE_SEARCH_PROXY_URL || '/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.slice(0, 400) })
    });
    if (!response.ok) return '';
    const data = await response.json();
    const results: Array<{ title?: string; url?: string; content?: string }> = data?.results || [];
    if (results.length === 0) return '';
    return results
      .map((r, i) => `${i + 1}. ${r.title || 'Untitled'}\n   URL: ${r.url || ''}\n   ${(r.content || '').slice(0, 600)}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number; // Unix timestamp
  priority?: 'low' | 'medium' | 'high';
}

export interface Persona {
  id: string;
  name: string;
  instructions: string;
  category?: string;
  knowledgeTags?: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[]; // For categorization and search
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  apiKey: string;
  selectedModel: string;
  customEndpoint: string;
  temperature: number;
  adminPin?: string;
  paidModelIds?: string[]; // Admin configurable list of paid PRO models
  skillLibraryVersion?: number; // Tracks which SkillOS seed batch has been installed
}

// New Conversation Interface
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'document' | 'code' | 'contract' | 'report' | 'table';
  language?: string;
  content: string;
  createdAt: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AppState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  loginUser: (user: { id: string; email: string }) => Promise<boolean>;
  logoutUser: () => void;

  conversations: Conversation[]; // Now an array of conversations
  activeConversationId: string | null; // ID of the currently active conversation
  folders: string[]; // Custom project folders
  tasks: Task[];
  personas: Persona[];
  activePersonaId: string | null;
  knowledgeArticles: KnowledgeArticle[];
  settings: AppSettings;
  isProcessing: boolean;
  isActionBoardOpen: boolean;
  isMobileSidebarOpen: boolean;
  isAdminAuthenticated: boolean;
  
  // Artifact Studio State
  activeArtifact: Artifact | null;
  isArtifactStudioOpen: boolean;
  openArtifact: (artifact: Artifact) => void;
  closeArtifactStudio: () => void;
  updateActiveArtifactContent: (content: string) => void;

  // Mobile Navigation Action
  toggleMobileSidebar: (isOpen?: boolean) => void;
  
  // Admin Authentication Actions
  verifyAdminPin: (pin: string) => boolean;
  lockAdminMode: () => void;

  // Conversation Actions
  startNewConversation: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  togglePinConversation: (id: string) => void;
  setConversationCategory: (id: string, category: string) => void;
  addFolder: (folderName: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
  deleteFolder: (folderName: string) => void;
  
  // Action Board Toggle & Execution
  toggleActionBoard: () => void;
  executeTaskWithAI: (taskId: string) => Promise<void>;
  extractTasksFromChat: () => number;
  clearCompletedTasks: () => void;
  deleteProjectPlan: (projectName: string) => void;
  
  // Message Actions (now operate on active conversation)
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  
  // Other existing actions
  addTask: (title: string, dueDate?: number, priority?: 'low' | 'medium' | 'high') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newTitle?: string, newDueDate?: number, newPriority?: 'low' | 'medium' | 'high') => void;
  setProcessing: (status: boolean) => void;
  addPersona: (name: string, instructions: string) => void;
  updatePersona: (id: string, name: string, instructions: string) => void;
  deletePersona: (id: string) => void;
  setActivePersona: (id: string) => void;
  addArticle: (title: string, content: string, tags: string[]) => void;
  updateArticle: (id: string, title: string, content: string, tags: string[]) => void;
  deleteArticle: (id: string) => void;
  togglePinArticle: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  exportState: () => string;
  importState: (jsonString: string) => { success: boolean; error?: string };
  resetAllData: () => void;
  processAgentResponse: (userContent: string, imageUrl?: string, webSearch?: boolean) => Promise<void>;
  stopGeneration: () => void;
  summarizeAndSaveChatToMemory: (conversationId?: string) => Promise<void>;
}

const createNewConversation = (): Conversation => ({
  id: Math.random().toString(36).substr(2, 9),
  title: 'New Chat',
  messages: [
    {
      id: 'welcome-msg',
      role: 'agent',
      content: "👋 **Welcome! I'm NEXUS, your AI co-pilot.**\n\nWhat can I help you accomplish today? You can ask me to draft documents, create project plans, analyze business ideas, or answer any question.",
      timestamp: Date.now(),
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'nexus-personal-assistant',
    name: '🤖 NEXUS Executive Assistant',
    instructions: 'You are NEXUS, a highly proactive, intelligent Executive Personal Assistant and Daily Co-Pilot. Help the user manage daily tasks, organize schedules, brainstorm ideas, answer any general question across all topics (science, life, business, coding, arts), draft messages, and boost daily productivity with warm, clear, and proactive support.'
  },
  {
    id: 'nexus-growth-advisor',
    name: '🚀 NEXUS Digital Growth Advisor',
    instructions: 'You are the official NEXUS Digital Growth Advisor. Answer inquiries about web development, e-commerce, enterprise automation, SEO, and digital consulting. Provide strategic guidance tailored for Phnom Penh, Cambodia, and the Asian digital ecosystem.'
  },
  {
    id: 'tech-architect',
    name: '🛠️ Senior Tech Architect',
    instructions: 'You are a Senior Full-Stack Software Architect. Focus on robust system architecture, clean TypeScript code, security, performance, and scalability. Provide production-ready code with detailed architectural rationale.'
  },
  {
    id: 'product-strategist',
    name: '📝 Product & Task Strategist',
    instructions: 'You are an agile Product Strategist and Engineering Lead. Help break down ambitious user goals into clear, prioritized action items, MVP features, data requirements, and execution roadmaps.'
  },
  {
    id: 'seo-content-specialist',
    name: '✍️ SEO & Marketing Specialist',
    instructions: 'You are a Data-Driven SEO & Digital Marketing Specialist. Provide high-converting marketing copy, keyword strategies, technical SEO audit checklists, and content recommendations.'
  }
];

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        currentUser: null,
        isAuthenticated: false,

        loginUser: async (user: { id: string; email: string }) => {
          // Admin status comes ONLY from the account role stored in Supabase —
          // never from a username or password checked in the browser.
          const profileRole = await getProfileRole(user.id);
          const isAdmin = profileRole === 'admin';

          const newUser: UserAccount = {
            id: user.id,
            name: user.email.includes('@') ? user.email.split('@')[0] : user.email,
            email: user.email,
            role: isAdmin ? 'admin' : 'user',
            avatar: isAdmin ? '👑' : '👤'
          };

          set({
            currentUser: newUser,
            isAuthenticated: true,
            isAdminAuthenticated: isAdmin
          });

          // Fetch user-specific conversations from Supabase cloud for this logged in account
          fetchUserConversationsFromSupabase(user.id).then((remoteConvs) => {
            if (remoteConvs && remoteConvs.length > 0) {
              const formattedConvs = (remoteConvs as Array<{
                id: string;
                title: string;
                messages?: Message[];
                pinned?: boolean;
                category?: string;
                created_at?: number;
                updated_at?: number;
              }>).map((rc) => ({
                id: rc.id,
                title: rc.title,
                messages: rc.messages || [],
                pinned: rc.pinned || false,
                category: rc.category || 'Unassigned',
                createdAt: Number(rc.created_at) || Date.now(),
                updatedAt: Number(rc.updated_at) || Date.now()
              }));
              set({
                conversations: formattedConvs,
                activeConversationId: formattedConvs[0].id
              });
            } else {
              // New user with no cloud chats yet: give them a fresh clean workspace!
              const freshConv = createNewConversation();
              set({
                conversations: [freshConv],
                activeConversationId: freshConv.id,
                tasks: []
              });
            }
          });

          return true;
        },

        logoutUser: () => {
          // Clear the Supabase auth session so RLS-scoped queries stop resolving.
          supabase.auth.signOut();
          const freshConv = createNewConversation();
          set({
            currentUser: null,
            isAuthenticated: false,
            isAdminAuthenticated: false,
            conversations: [freshConv],
            activeConversationId: freshConv.id,
            tasks: []
          });
        },

        conversations: [createNewConversation()], // Start with one default conversation
        activeConversationId: '' as string, // Will be set in onRehydrateStorage or by startNewConversation
        folders: [],
        tasks: [],
        personas: DEFAULT_PERSONAS,
        activePersonaId: 'nexus-personal-assistant',
        knowledgeArticles: [],
        settings: {
          apiKey: '',
          selectedModel: 'deepseek-v4-flash',
          customEndpoint: 'https://gpt-agent.cc/v1/chat/completions',
          temperature: 0.7,
          paidModelIds: [
            'claude-sonnet-5', 'claude-fable-5', 'claude-opus-4-6', 'claude-opus-4-7', 'claude-opus-4-8', 'claude-opus-5',
            'gpt-5.6-sol', 'gpt-5.5', 'gpt-5.3-codex-spark',
            'qwen3.7-max', 'qwen3.8-max',
            'deepseek-v4-pro',
            'doubao-seed-2.0-code',
            'glm-5.2',
            'kimi-k3', 'grok-4.5', 'mimo-v2.5-pro', 'MiniMax-M3', 'LongCat-2.0'
          ]
        },
        isProcessing: false,
        isActionBoardOpen: false,
        isMobileSidebarOpen: false,
        isAdminAuthenticated: false,
        activeArtifact: null,
        isArtifactStudioOpen: false,

        openArtifact: (artifact) => set({ activeArtifact: artifact, isArtifactStudioOpen: true }),
        closeArtifactStudio: () => set({ isArtifactStudioOpen: false }),
        updateActiveArtifactContent: (content) => set((state) => ({
          activeArtifact: state.activeArtifact ? { ...state.activeArtifact, content } : null
        })),

        toggleMobileSidebar: (isOpen) => set((state) => ({
          isMobileSidebarOpen: isOpen !== undefined ? isOpen : !state.isMobileSidebarOpen
        })),

        verifyAdminPin: () => {
          // Admin access is granted only by the account role stored in Supabase,
          // never by a client-side PIN or hardcoded password.
          return get().isAdminAuthenticated;
        },

        lockAdminMode: () => set({ isAdminAuthenticated: false }),

        toggleActionBoard: () => set((state) => ({ isActionBoardOpen: !state.isActionBoardOpen })),

        executeTaskWithAI: async (taskId: string) => {
          const task = get().tasks.find(t => t.id === taskId);
          if (!task) return;

          // Construct authoritative execution directive prompt
          const cleanTitle = task.title.replace(/\*\*/g, '').trim();
          const prompt = `[TASK EXECUTION DIRECTIVE]\nPlease execute and fulfill Task: "${cleanTitle}".\nProvide a comprehensive, expert solution, detailed analysis, step-by-step recommendations, and actionable deliverables for this specific task. Do not list tasks or summarize; focus 100% on solving and outputting the result for this task.`;

          // Trigger AI agent response FIRST while task remains active
          await get().processAgentResponse(prompt);

          // Mark task completed AFTER AI finishes execution
          const currentTask = get().tasks.find(t => t.id === taskId);
          if (currentTask && !currentTask.completed) {
            get().toggleTask(taskId);
          }
        },

        summarizeAndSaveChatToMemory: async (conversationId?: string) => {
          const targetId = conversationId || get().activeConversationId;
          const conversation = get().conversations.find(c => c.id === targetId);
          if (!conversation || conversation.messages.length <= 1) return;

          get().setProcessing(true);

          try {
            const chatText = conversation.messages
              .filter(m => m.id !== 'welcome-msg')
              .map(m => `[${m.role.toUpperCase()}]: ${m.content}`)
              .join('\n\n');

            const prompt = `Please summarize the key takeaways, decisions, technical architectural specs, and important context from this conversation into a clean, structured Knowledge Base memory document.

Conversation Log:
${chatText}`;

            const userKey = (get().settings?.apiKey || '').trim();
            const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
            const apiKey = userKey || envKey;
            const endpoint = get().settings?.customEndpoint || 'https://openrouter.ai/api/v1/chat/completions';
            const model = get().settings?.selectedModel || 'deepseek-v4-flash';

            // When no client key is configured, route through the serverless proxy
            // so the server-side API key never ships to the browser.
            const useServerProxy = !apiKey;
            const requestUrl = useServerProxy
              ? (import.meta.env.VITE_CHAT_PROXY_URL || '/api/chat')
              : endpoint;

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (useServerProxy) {
              const sessionToken = await getSessionAccessToken();
              if (sessionToken) {
                headers['Authorization'] = `Bearer ${sessionToken}`;
              }
            } else if (apiKey) {
              headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(requestUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model,
                stream: false,
                messages: [
                  { role: 'system', content: 'You are NEXUS Memory Engine. Output concise, structured, high-density markdown summaries of user conversations for long-term memory retrieval.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.3
              })
            });

            if (response.ok) {
              const data = await response.json();
              const summaryContent = data.choices?.[0]?.message?.content || 'No summary generated.';

              const articleTitle = `Memory Summary: ${conversation.title}`;
              get().addArticle(articleTitle, summaryContent, ['chat-summary', 'memory', 'auto-saved']);

              const newArticles = get().knowledgeArticles;
              const createdArticle = newArticles.find(a => a.title === articleTitle);
              if (createdArticle && !createdArticle.pinned) {
                get().togglePinArticle(createdArticle.id);
              }
            }
          } catch (err) {
            console.error('Error saving chat summary to memory:', err);
          } finally {
            get().setProcessing(false);
          }
        },

        // Set initial active conversation after rehydration or if none exists
        // This is handled in onRehydrateStorage for persistence, or on initial load below
        // For initial load before rehydration kicks in, we can ensure one exists.
        // A better pattern for initial state is often handled by the persist middleware itself

        startNewConversation: () => {
          set((state) => {
            const newConv = createNewConversation();
            return {
              conversations: [...state.conversations, newConv],
              activeConversationId: newConv.id,
            };
          });
        },

        loadConversation: (id) => set({ activeConversationId: id }),

        deleteConversation: (id) => set((state) => {
          const filteredConversations = state.conversations.filter(conv => conv.id !== id);
          let newActiveConversationId = state.activeConversationId;
          
          // If the active conversation was deleted, switch to another or start a new one
          if (newActiveConversationId === id) {
            newActiveConversationId = filteredConversations.length > 0 
              ? filteredConversations[0].id 
              : createNewConversation().id; // Create new if none left
            
            if (filteredConversations.length === 0) {
                // If no conversations left, add the new one to the list
                return {
                    conversations: [createNewConversation()],
                    activeConversationId: newActiveConversationId,
                };
            }
          }

          return {
            conversations: filteredConversations,
            activeConversationId: newActiveConversationId,
          };
        }),

        updateConversationTitle: (id, title) => set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
        })),

        togglePinConversation: (id) => set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, pinned: !conv.pinned } : conv
          ),
        })),

        setConversationCategory: (id, category) => set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, category } : conv
          ),
        })),

        addFolder: (folderName) => set((state) => {
          const trimmed = folderName.trim();
          if (!trimmed || (state.folders || []).includes(trimmed)) return state;
          return { folders: [...(state.folders || []), trimmed] };
        }),

        renameFolder: (oldName, newName) => set((state) => {
          const trimmedNew = newName.trim();
          if (!trimmedNew || oldName === trimmedNew) return state;
          const updatedFolders = (state.folders || []).map(f => f === oldName ? trimmedNew : f);
          const updatedConvs = state.conversations.map(conv =>
            conv.category === oldName ? { ...conv, category: trimmedNew } : conv
          );
          return { folders: updatedFolders, conversations: updatedConvs };
        }),

        deleteFolder: (folderName) => set((state) => ({
          folders: (state.folders || []).filter(f => f !== folderName),
          conversations: state.conversations.map(conv =>
            conv.category === folderName ? { ...conv, category: undefined } : conv
          )
        })),

        addMessage: (msg) => set((state) => {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === state.activeConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }],
                updatedAt: Date.now(),
              };
            }
            return conv;
          });
          return { conversations: updatedConversations };
        }),
        
        addTask: (title, dueDate, priority) => set((state) => {
          const newTask: Task = { id: Math.random().toString(36).substr(2, 9), title, completed: false, createdAt: Date.now(), dueDate, priority };
          const activeUser = state.currentUser?.id || '';
          syncTaskToSupabase(activeUser, newTask);
          return { tasks: [...state.tasks, newTask] };
        }),
        
        toggleTask: (id) => set((state) => {
          const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
          const activeUser = state.currentUser?.id || '';
          const targetTask = updatedTasks.find(t => t.id === id);
          if (targetTask) syncTaskToSupabase(activeUser, targetTask);
          return { tasks: updatedTasks };
        }),
      
        deleteTask: (id) => set((state) => {
          deleteTaskFromSupabase(id);
          return { tasks: state.tasks.filter(t => t.id !== id) };
        }),

        editTask: (id, newTitle, newDueDate, newPriority) => set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { 
            ...t, 
            ...(newTitle !== undefined && { title: newTitle }), 
            ...(newDueDate !== undefined && { dueDate: newDueDate }),
            ...(newPriority !== undefined && { priority: newPriority }),
          } : t)
        })),
        
        clearCompletedTasks: () => set((state) => ({
          tasks: state.tasks.filter(t => !t.completed)
        })),

        deleteProjectPlan: (projectName: string) => set((state) => ({
          tasks: state.tasks.filter(t => {
            const parts = t.title.split(' ➔ ');
            const taskProject = parts.length >= 3 ? parts[0] : 'General Tasks & Action Items';
            return taskProject.toLowerCase() !== projectName.toLowerCase();
          })
        })),

        extractTasksFromChat: () => {
          const { conversations, activeConversationId, tasks, addTask } = get();
          const activeConv = conversations.find(c => c.id === activeConversationId);
          if (!activeConv) return 0;

          let addedCount = 0;
          const chatText = activeConv.messages.map(m => m.content).join('\n');
          
          const lines = chatText.split('\n');
          lines.forEach(line => {
            const cleanLine = line.replace(/^[-*•\d.]+\s*/, '').trim();
            if (
              cleanLine.length > 5 &&
              cleanLine.length < 120 &&
              !cleanLine.startsWith('#') &&
              !cleanLine.startsWith('http') &&
              !tasks.some(t => t.title.toLowerCase() === cleanLine.toLowerCase())
            ) {
              if (
                line.match(/^[-*•\d.]+\s+(?:[A-Z]|\[|Task|Refine|Create|Build|Design|Implement|Audit|Setup|Write|Analyze|Fix|Update)/i)
              ) {
                addTask(cleanLine, undefined, 'medium');
                addedCount++;
              }
            }
          });

          return addedCount;
        },

        setProcessing: (status) => set({ isProcessing: status }),

        stopGeneration: () => {
          if (activeAbortController) {
            activeAbortController.abort();
            activeAbortController = null;
          }
          if (activeImageGenTimer) {
            clearTimeout(activeImageGenTimer);
            activeImageGenTimer = null;
          }
          set({ isProcessing: false });
        },

        addPersona: (name, instructions) => set((state) => {
          const newPersona = { id: Math.random().toString(36).substr(2, 9), name, instructions };
          return { 
            personas: [...state.personas, newPersona],
            activePersonaId: state.personas.length === 0 ? newPersona.id : state.activePersonaId,
          };
        }),
        
        updatePersona: (id, name, instructions) => set((state) => ({
          personas: state.personas.map(p => p.id === id ? { ...p, name, instructions } : p)
        })),

        deletePersona: (id) => set((state) => ({
          personas: state.personas.filter(p => p.id !== id),
          activePersonaId: state.activePersonaId === id ? null : state.activePersonaId,
        })),

        setActivePersona: (id) => set({ activePersonaId: id }),

        addArticle: (title, content, tags) => set((state) => {
          const now = Date.now();
          const newArticle = { 
            id: Math.random().toString(36).substr(2, 9), 
            title, 
            content, 
            tags,
            createdAt: now, 
            updatedAt: now 
          };
          return { knowledgeArticles: [...state.knowledgeArticles, newArticle] };
        }),

        updateArticle: (id, title, content, tags) => set((state) => ({
          knowledgeArticles: state.knowledgeArticles.map(article => 
            article.id === id ? { ...article, title, content, tags, updatedAt: Date.now() } : article
          )
        })),

        deleteArticle: (id) => set((state) => ({
          knowledgeArticles: state.knowledgeArticles.filter(article => article.id !== id)
        })),

        togglePinArticle: (id) => set((state) => ({
          knowledgeArticles: state.knowledgeArticles.map(article =>
            article.id === id ? { ...article, pinned: !article.pinned, updatedAt: Date.now() } : article
          )
        })),

        updateSettings: (newSettings) => set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

        exportState: () => {
          const { conversations, activeConversationId, tasks, personas, activePersonaId, knowledgeArticles, settings } = get();
          return JSON.stringify({
            version: 1,
            exportedAt: new Date().toISOString(),
            conversations,
            activeConversationId,
            tasks,
            personas,
            activePersonaId,
            knowledgeArticles,
            settings,
          }, null, 2);
        },

        importState: (jsonString: string) => {
          try {
            const parsed = JSON.parse(jsonString) as Record<string, unknown>;
            if (!parsed || typeof parsed !== 'object') {
              return { success: false, error: 'Invalid JSON format.' };
            }

            set((state) => ({
              conversations: Array.isArray(parsed.conversations) && parsed.conversations.length > 0 ? (parsed.conversations as Conversation[]) : state.conversations,
              activeConversationId: typeof parsed.activeConversationId === 'string' ? parsed.activeConversationId : state.activeConversationId,
              tasks: Array.isArray(parsed.tasks) ? (parsed.tasks as Task[]) : state.tasks,
              personas: Array.isArray(parsed.personas) ? (parsed.personas as Persona[]) : state.personas,
              activePersonaId: typeof parsed.activePersonaId === 'string' ? parsed.activePersonaId : state.activePersonaId,
              knowledgeArticles: Array.isArray(parsed.knowledgeArticles) ? (parsed.knowledgeArticles as KnowledgeArticle[]) : state.knowledgeArticles,
              settings: parsed.settings && typeof parsed.settings === 'object' ? { ...state.settings, ...(parsed.settings as Partial<AppSettings>) } : state.settings,
            }));
            return { success: true };
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return { success: false, error: msg };
          }
        },

        resetAllData: () => {
          const defaultConv = createNewConversation();
          set({
            conversations: [defaultConv],
            activeConversationId: defaultConv.id,
            tasks: [],
            personas: [],
            activePersonaId: null,
            knowledgeArticles: [],
            settings: {
              apiKey: '',
              selectedModel: 'claude-fable-5',
              customEndpoint: 'https://gpt-agent.cc/v1/chat/completions',
              temperature: 0.7,
            },
          });
        },

        processAgentResponse: async (userContent, imageUrl, webSearch) => {
          const { activeConversationId, conversations, updateConversationTitle, setProcessing, knowledgeArticles, personas, activePersonaId, addTask } = get();
          
          if (!activeConversationId) {
            console.error("NEXUS: No active conversation found! Cannot process agent response.");
            return;
          }

          const currentConversation = conversations.find(conv => conv.id === activeConversationId);
          if (!currentConversation) {
            console.error("NEXUS: No active conversation found! Cannot process agent response.");
            setProcessing(false);
            return;
          }

          const isImageGen = /generate|draw|picture|photo|illustration|render|create/i.test(userContent) && /image|photo|picture|draw|illustration|render/i.test(userContent);

          if (isImageGen) {
            const userMessageId = Math.random().toString(36).substr(2, 9);
            set((state) => ({
              conversations: state.conversations.map(conv => 
                conv.id === activeConversationId 
                  ? { ...conv, messages: [...conv.messages, { id: userMessageId, role: 'user', content: userContent, imageUrl, timestamp: Date.now() }], updatedAt: Date.now() }
                  : conv
              )
            }));

            if (currentConversation.messages.length === 1 && currentConversation.messages[0].id === 'welcome-msg') {
              updateConversationTitle(activeConversationId, userContent.substring(0, 50) + (userContent.length > 50 ? '...' : ''));
            }

            setProcessing(true);
            activeImageGenTimer = setTimeout(() => {
              const cleanPrompt = userContent
                .replace(/^Generate a realistic image in\s*/i, '')
                .replace(/^Generate an image of\s*/i, '')
                .replace(/^Generate image of\s*/i, '')
                .replace(/^Draw a\s*/i, '')
                .replace(/^Create an image of\s*/i, '')
                .replace(/^Photo of\s*/i, '')
                .replace(/^Picture of\s*/i, '')
                .replace(/["']/g, '')
                .trim();

              const enhancedPrompt = `${cleanPrompt}, 4k resolution, ultra-detailed, photorealistic, sharp focus, 8k wallpaper, masterwork, studio lighting`;
              const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=2048&height=2048&model=flux&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;

              get().addMessage({
                role: 'agent',
                content: `🎨 **Ultra HD 4K Generated Image:** *${cleanPrompt}*\n\n![${cleanPrompt}](${generatedUrl})`
              });
              activeImageGenTimer = null;
              setProcessing(false);
            }, 600);
            return;
          }

          const activePersona = activePersonaId 
            ? personas.find(p => p.id === activePersonaId) 
            : undefined;
          
          const customInstructions = activePersona ? activePersona.instructions : '';

          const userMessageId = Math.random().toString(36).substr(2, 9);
          set((state) => ({
            conversations: state.conversations.map(conv => 
              conv.id === activeConversationId 
                ? { ...conv, messages: [...conv.messages, { id: userMessageId, role: 'user', content: userContent, imageUrl, timestamp: Date.now() }], updatedAt: Date.now() }
                : conv
            )
          }));

          if (currentConversation.messages.length === 1 && currentConversation.messages[0].id === 'welcome-msg') {
            updateConversationTitle(activeConversationId, userContent.substring(0, 50) + (userContent.length > 50 ? '...' : ''));
          }
          
          setProcessing(true);
          
          // Set up abort handling so the user can stop output mid-stream.
          activeAbortController?.abort();
          const controller = new AbortController();
          activeAbortController = controller;

          const { settings } = get();
          const userKey = (settings?.apiKey || '').trim();
          const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
          const apiKey = userKey || envKey;
          const endpoint = settings?.customEndpoint || 'https://gpt-agent.cc/v1/chat/completions';
          const model = settings?.selectedModel || 'deepseek-v4-flash';
          const temperature = settings?.temperature ?? 0.7;

          // When no client key is configured, route through the serverless proxy
          // (/api/chat) so the server-side API key never ships to the browser.
          const useServerProxy = !apiKey;
          const requestUrl = useServerProxy
            ? (import.meta.env.VITE_CHAT_PROXY_URL || '/api/chat')
            : endpoint;

          try {
            const updatedConversation = get().conversations.find(conv => conv.id === activeConversationId);

            // --- Start Ultra-Fast Multi-Turn RAG Search Engine ---
            const pinnedArticles = knowledgeArticles.filter(a => a.pinned);
            const unpinnedArticles = knowledgeArticles.filter(a => !a.pinned);

            const recentUserMessages = (updatedConversation?.messages || [])
              .filter(m => m.role === 'user')
              .slice(-3)
              .map(m => m.content)
              .join(' ');

            const searchContext = `${userContent} ${recentUserMessages}`.toLowerCase();
            const terms = Array.from(new Set(searchContext.match(/[a-z0-9]+/g) || [])).filter(t => t.length >= 3);

            // Persona-driven RAG boost: the active agent's knowledgeTags make its
            // skill articles surface even when the user's question phrasing differs.
            const personaTags = (activePersona?.knowledgeTags || []).map(t => t.toLowerCase());

            const scoredArticles = unpinnedArticles.map(article => {
              const titleText = article.title.toLowerCase();
              const bodyText = article.content.toLowerCase();
              const tagText = article.tags.join(' ').toLowerCase();

              let score = 0;
              terms.forEach(term => {
                if (titleText.includes(term)) score += 5;
                if (tagText.includes(term)) score += 3;
                if (bodyText.includes(term)) score += 1;
              });

              // Tag overlap with the active agent's knowledge domain.
              if (personaTags.length > 0) {
                const overlap = article.tags.filter(t => personaTags.includes(t.toLowerCase())).length;
                if (overlap > 0) score += 3 + overlap * 2;
              }

              return { article, score };
            });

            const topRelevantArticles = scoredArticles
              .filter(item => item.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map(item => item.article);

            const combinedArticles = Array.from(
              new Set([...pinnedArticles, ...topRelevantArticles])
            );

            let knowledgeBaseContent = '';
            if (combinedArticles.length > 0) {
              knowledgeBaseContent = '\n\n=== RELEVANT KNOWLEDGE BASE CONTEXT (RAG MATCHED) ===\n' +
                combinedArticles.map(a => `--- ARTICLE: ${a.title} ---\nTags: ${a.tags.join(', ')}\n${a.content}`).join('\n\n') +
                '\n======================================================\n';
            }
            // --- End RAG Search Engine ---

            // --- Optional Live Web Search (when the user toggles it on) ---
            let webSearchContent = '';
            if (webSearch && userContent.trim()) {
              const searchContext = await performWebSearch(userContent);
              if (searchContext) {
                webSearchContent = `\n\n=== LIVE WEB SEARCH RESULTS (up-to-date) ===\n${searchContext}\n======================================================\n`;
              }
            }
            // --- End Live Web Search ---

            // --- Live Project Board & Tasks Context Injection ---
            const currentTasks = get().tasks;
            let projectBoardContext = '';
            if (currentTasks.length > 0) {
              const completedCount = currentTasks.filter(t => t.completed).length;
              const pendingTasks = currentTasks.filter(t => !t.completed);
              const completedTasks = currentTasks.filter(t => t.completed);

              projectBoardContext = `\n\n=== LIVE WORKSPACE PROJECT PLANS & TASK TRACKER ===\n` +
                `Total Tasks: ${currentTasks.length} | Completed: ${completedCount} | Pending: ${pendingTasks.length}\n\n` +
                `[CURRENT PENDING TASKS]:\n` +
                (pendingTasks.length > 0 
                  ? pendingTasks.map(t => `- [ ] ${t.title}${t.priority ? ` (${t.priority.toUpperCase()} priority)` : ''}`).join('\n')
                  : 'None') + '\n\n' +
                `[COMPLETED TASKS]:\n` +
                (completedTasks.length > 0 
                  ? completedTasks.map(t => `- [x] ${t.title}`).join('\n')
                  : 'None') +
                `\n======================================================\n`;
            }

            const systemContent = `You are NEXUS, an advanced agentic AI assistant with full live context of the user's workspace, project plans, and action items. 
Answer questions directly, write clean code, and execute user requests efficiently.
${customInstructions ? `Role / Persona Instructions: ${customInstructions}` : ''}
${knowledgeBaseContent}
${webSearchContent}
${projectBoardContext}

TASK & PROJECT PLAN INSTRUCTION:
Whenever the user asks to check, review, update, or analyze their project/tasks (or asks "check my cha app", "where am I at now", "what's left to do?"), use the LIVE WORKSPACE PROJECT PLANS & TASK TRACKER context above to give them an exact, intelligent update on their progress, completed milestones, and immediate next tasks!

Whenever the user asks to create a new plan, roadmap, breakdown, or strategy (or clicks "Plan Project & Auto-Populate Board"):
1. In your main response, present a clear, beautifully structured plan divided into logical phases.
2. At the VERY END of your message, output the exact project name extracted from the user request under the exact header:
### Action Items
Project: [Exact Name requested by user e.g. "Techlaw Web App Plan" or "CHA App Plan"]

[Phase 1: Foundation & Strategy]
- [High] Define core features & MVP scope (due: 2 days)
- [Medium] Choose frontend & backend tech stack (due: 3 days)

[Phase 2: Backend & API Development]
- [High] Build REST / GraphQL API endpoints
- [Medium] Implement authentication & security

Rules for Action Items:
- Start with Project: [Specific App/Project Name] matching the user's prompt (e.g. Project: CHA App Plan).
- NEVER use generic titles like "Web App Development Plan" if the user mentioned a specific app name like CHA App!
- Group tasks under clear phase headers in square brackets like [Phase 1: Phase Name].
- List 2-3 specific, actionable step tasks under each phase header.
- ONLY list actionable step tasks under ### Action Items. Do NOT add conversational closing notes (e.g. "Want me to drill deeper...", "Let me know...") under ### Action Items. Put conversational notes before ### Action Items.
- Do NOT generate "### Action Items" for casual conversational turns (like "hello", "yes", or simple factual questions).`;

            // Clean up and format chat messages for OpenAI Vision & text compatibility:
            const sanitizedHistory: ChatMessagePayload[] = [];
            (updatedConversation?.messages || [])
              .filter(m => m.id !== 'welcome-msg' && (m.content.trim().length > 0 || m.imageUrl))
              .slice(-10)
              .forEach(m => {
                const role = m.role === 'agent' ? 'assistant' : 'user';
                
                // Build message content payload (Vision base64 image or text string)
                let messageContent: string | ChatContentPart[] = m.content;
                if (m.imageUrl) {
                  messageContent = [
                    { type: 'text', text: m.content || 'Analyze this image.' },
                    { type: 'image_url', image_url: { url: m.imageUrl } }
                  ];
                }

                const last = sanitizedHistory[sanitizedHistory.length - 1];
                if (last && last.role === role && typeof last.content === 'string' && typeof messageContent === 'string') {
                  last.content += `\n${messageContent}`;
                } else {
                  const payload: ChatMessagePayload =
                    typeof messageContent === 'string'
                      ? { role, content: messageContent }
                      : { role, content: messageContent };
                  sanitizedHistory.push(payload);
                }
              });

            const messagesPayload = [
              { role: 'system', content: systemContent },
              ...sanitizedHistory
            ];

            const headers: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            if (useServerProxy) {
              // Authenticate the proxy call with the signed-in user's session.
              const sessionToken = await getSessionAccessToken();
              if (sessionToken) {
                headers['Authorization'] = `Bearer ${sessionToken}`;
              }
            } else {
              if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
              }
              if (endpoint.includes('openrouter.ai')) {
                headers['HTTP-Referer'] = window.location.href;
                headers['X-Title'] = 'NEXUS-Agent Dashboard';
              }
            }

            // If the user pressed Stop while pre-fetch context (web search etc.)
            // was resolving, bail out before hitting the network.
            if (controller.signal.aborted) {
              setProcessing(false);
              activeAbortController = null;
              return;
            }

            const response = await fetch(requestUrl, {
              method: 'POST',
              headers,
              signal: controller.signal,
              body: JSON.stringify({
                model: model, 
                temperature: temperature,
                stream: true,
                messages: messagesPayload
              })
            });

            if (!response.ok) {
              // Friendly messaging for proxy auth/rate-limit failures so guests
              // understand why they were capped instead of seeing a raw error.
              if (response.status === 429) {
                throw new Error('You have reached the free guest limit (5 messages per hour). Sign in to your account for more messages.');
              }
              if (response.status === 401) {
                throw new Error('Your session has expired. Please sign in again to continue chatting.');
              }
              let userFriendlyMsg = `API Error ${response.status}`;
              try {
                const rawErr = await response.text();
                const jsonErr = JSON.parse(rawErr);
                const detail = jsonErr?.error?.message || jsonErr?.message || jsonErr?.error || rawErr;
                userFriendlyMsg = `Model ${model} Error: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`;
              } catch {
                // Ignore json parse error
              }
              throw new Error(userFriendlyMsg);
            }

            setProcessing(false); // Stop the bouncing dots
            
            // Add empty agent message for streaming
            const agentMessageId = Math.random().toString(36).substr(2, 9);
            set((state) => ({
              conversations: state.conversations.map(conv => 
                conv.id === activeConversationId
                  ? { ...conv, messages: [...conv.messages, { id: agentMessageId, role: 'agent', content: '', timestamp: Date.now() }], updatedAt: Date.now() }
                  : conv
              )
            }));

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullContent = '';

            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.choices[0].delta.content) {
                        fullContent += data.choices[0].delta.content;
                        const cleanedContent = fullContent
                          .replace(/^(?:User Safety:\s*safe\s*Response Safety:\s*safe\s*)+/gi, '')
                          .trimStart();

                        set((state) => ({
                          conversations: state.conversations.map(conv => 
                            conv.id === activeConversationId
                              ? { ...conv, messages: conv.messages.map(m => m.id === agentMessageId ? { ...m, content: cleanedContent } : m), updatedAt: Date.now() }
                              : conv
                          )
                        }));
                      }
                    } catch (e) {
                      console.error("NEXUS Debug: JSON parse error on API chunk:", e, "Chunk:", line);
                    }
                  }
                }
              }
            }

            activeAbortController = null;

            // After streaming finishes, check if cleanedContent is empty
            const finalCleanedContent = fullContent
              .replace(/^(?:User Safety:\s*safe\s*Response Safety:\s*safe\s*)+/gi, '')
              .trim();

            if (!finalCleanedContent) {
              const fallbackMsg = '⚠️ *The free OpenRouter model endpoint returned a blank response (likely due to temporary free-tier rate limits). Please try re-sending your message or select a specific model preset (like Gemini 2.0 Flash or Llama 3.3) in Settings.*';
              set((state) => ({
                conversations: state.conversations.map(conv => 
                  conv.id === activeConversationId
                    ? { ...conv, messages: conv.messages.map(m => m.id === agentMessageId ? { ...m, content: fallbackMsg } : m), updatedAt: Date.now() }
                    : conv
                )
              }));
            }

            // After streaming is complete, parse for Action Items
            const match = fullContent.match(/#+\s*Action Items?/i);
            
            if (match && match.index !== undefined) {
              const tasksPart = fullContent.slice(match.index + match[0].length);
              if (tasksPart) {
                const lines = tasksPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                let currentProjectName = '';
                let currentPhasePrefix = '';

                lines.forEach(line => {
                  // Project header detection e.g. Project: Finance App Development Plan or Project: [App Plan]
                  const projectMatch = line.match(/^(?:Project|Plan):\s*\[?([^\]\n]+)\]?/i);
                  if (projectMatch) {
                    currentProjectName = projectMatch[1].trim();
                    return;
                  }

                  // Phase header detection e.g. [Phase 1: Foundation & Setup]
                  const phaseMatch = line.match(/^\[(Phase\s*\d+[^\]]*)\]/i);
                  if (phaseMatch) {
                    currentPhasePrefix = phaseMatch[1].trim();
                    return;
                  }

                  const rawTask = line.replace(/^[-*•\d.]+\s*/, '').trim();
                  // Ignore markdown headers, empty lines, or AI follow-up sign-off lines (e.g., "Want me to...", "Let me know...")
                  if (
                    rawTask &&
                    !rawTask.startsWith('#') &&
                    !/^want me to/i.test(rawTask) &&
                    !/^would you like me/i.test(rawTask) &&
                    !/^let me know/i.test(rawTask) &&
                    !/^if you need/i.test(rawTask) &&
                    !/^feel free to/i.test(rawTask)
                  ) {
                    let title = rawTask;
                    let priority: 'low' | 'medium' | 'high' | undefined = undefined;
                    let dueDate: number | undefined = undefined;

                    // Priority parsing e.g. [High] Task Title
                    const prioMatch = title.match(/\[(high|medium|low)\]/i);
                    if (prioMatch) {
                      priority = prioMatch[1].toLowerCase() as 'low' | 'medium' | 'high';
                      title = title.replace(prioMatch[0], '').trim();
                    }

                    // Due date parsing e.g. (due: 2026-08-01) or (due: tomorrow)
                    const dueMatch = title.match(/\((?:due:\s*)([^)]+)\)/i);
                    if (dueMatch) {
                      const dueStr = dueMatch[1].trim().toLowerCase();
                      title = title.replace(dueMatch[0], '').trim();

                      if (dueStr === 'today') {
                        dueDate = Date.now();
                      } else if (dueStr === 'tomorrow') {
                        dueDate = Date.now() + 86400000;
                      } else {
                        const parsedTs = Date.parse(dueStr);
                        if (!isNaN(parsedTs)) {
                          dueDate = parsedTs;
                        }
                      }
                    }

                    if (title) {
                      const prefixParts: string[] = [];
                      if (currentProjectName) prefixParts.push(currentProjectName);
                      if (currentPhasePrefix) prefixParts.push(currentPhasePrefix);

                      const finalTitle = prefixParts.length > 0
                        ? `${prefixParts.join(' ➔ ')} ➔ ${title}`
                        : title;

                      addTask(finalTitle, dueDate, priority);
                    }
                  }
                });

                // Auto-open Action Board drawer so user sees project plan populate live!
                set({ isActionBoardOpen: true });
              }
            }

            // Sync conversation to Supabase cloud automatically
            const currentStore = get();
            const finishedConv = currentStore.conversations.find(c => c.id === activeConversationId);
            const activeUser = currentStore.currentUser?.id || '';
            if (finishedConv) {
              syncConversationToSupabase(activeUser, finishedConv);
            }

          } catch (error: unknown) {
            setProcessing(false);
            activeAbortController = null;
            // User stopped generation — partial content already streamed in, so
            // exit quietly instead of surfacing an error message.
            if (error instanceof DOMException && error.name === 'AbortError') {
              return;
            }
            const errMessage = error instanceof Error ? error.message : String(error);
            // Add error message to active conversation
            set((state) => ({
              conversations: state.conversations.map(conv => 
                conv.id === activeConversationId
                  ? { 
                      ...conv, 
                      messages: [...conv.messages, { 
                        id: Math.random().toString(36).substr(2, 9), 
                        role: 'agent', 
                        content: `❌ **Error connecting to AI:**\n\n${errMessage}`, 
                        timestamp: Date.now() 
                      }],
                      updatedAt: Date.now(),
                    }
                  : conv
              )
            }));
          }
        }
      }),
      {
        name: 'nexus-agent-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          conversations: state.conversations,
          activeConversationId: state.activeConversationId,
          folders: state.folders,
          tasks: state.tasks,
          personas: state.personas,
          knowledgeArticles: state.knowledgeArticles,
          settings: state.settings,
        }),
        onRehydrateStorage: () => (state) => {
          const savedState = state as AppState;
          if (!savedState) return;

          if (!savedState.personas || savedState.personas.length === 0 || !savedState.personas.some(p => p.id === 'nexus-personal-assistant')) {
            savedState.personas = DEFAULT_PERSONAS;
            savedState.activePersonaId = 'nexus-personal-assistant';
          }

          if (!savedState.folders) {
            savedState.folders = [];
          }

          if (!savedState.settings) {
            savedState.settings = {
              apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
              selectedModel: 'deepseek-chat',
              customEndpoint: 'https://api.deepseek.com/chat/completions',
              temperature: 0.7,
            };
          }

          // Seed the SkillOS library additively — never overwrite personas or
          // articles the user has edited. Bump SKILL_LIBRARY_VERSION in
          // skillLibrary.ts to re-seed new items after a content update.
          if (savedState.settings.skillLibraryVersion !== SKILL_LIBRARY_VERSION) {
            const knownPersonaIds = new Set((savedState.personas || []).map(p => p.id));
            const knownArticleIds = new Set((savedState.knowledgeArticles || []).map(a => a.id));
            const now = Date.now();

            const missingPersonas = SKILLOS_LIBRARY
              .map(entry => entry.persona)
              .filter(p => !knownPersonaIds.has(p.id));

            if (missingPersonas.length > 0) {
              savedState.personas = [...(savedState.personas || []), ...missingPersonas];
            }

            const missingArticles = SKILLOS_LIBRARY
              .flatMap(entry => entry.articles)
              .filter(a => !knownArticleIds.has(a.id))
              .map(a => ({ ...a, pinned: false, createdAt: now, updatedAt: now }));

            if (missingArticles.length > 0) {
              savedState.knowledgeArticles = [...(savedState.knowledgeArticles || []), ...missingArticles];
            }

            savedState.settings = {
              ...savedState.settings,
              skillLibraryVersion: SKILL_LIBRARY_VERSION,
            };
          }
          if (!savedState.conversations || savedState.conversations.length === 0) {
            savedState.conversations = [createNewConversation()];
            savedState.activeConversationId = savedState.conversations[0].id;
          } else if (!savedState.activeConversationId) {
            savedState.activeConversationId = savedState.conversations[0].id; // Set first as active if none set
          }

          // Migration from old single messages array to conversation format
          // This is a complex migration. If 'messages' (old format) exists, create a new conversation for it.
          const rawState = savedState as unknown as Record<string, unknown>;
          if ('messages' in rawState && rawState.messages !== undefined && Array.isArray(rawState.messages) && rawState.messages.length > 0) {
            const oldMessages = rawState.messages as Message[];
            const migratedConversation: Conversation = {
              id: Math.random().toString(36).substr(2, 9),
              title: oldMessages[1]?.content.substring(0, 50) || 'Migrated Chat', // Use first user message or default
              messages: oldMessages,
              createdAt: oldMessages[0]?.timestamp || Date.now(),
              updatedAt: oldMessages[oldMessages.length - 1]?.timestamp || Date.now(),
            };
            savedState.conversations.push(migratedConversation);
            savedState.activeConversationId = migratedConversation.id;
            delete rawState.messages; // Clean up old state
          }

          // Ensure active conversation always exists and is valid
          if (savedState.activeConversationId) {
            const found = savedState.conversations.find(conv => conv.id === savedState.activeConversationId);
            if (!found && savedState.conversations.length > 0) {
              savedState.activeConversationId = savedState.conversations[0].id;
            } else if (!found) {
              const newConv = createNewConversation();
              savedState.conversations = [newConv];
              savedState.activeConversationId = newConv.id;
            }
          }

          // Migration for customInstructions to personas (existing logic)
          if ('customInstructions' in rawState && rawState.customInstructions !== undefined && savedState.personas.length === 0) {
            const oldInstructions = String(rawState.customInstructions);
            if (oldInstructions.trim() !== '') {
              const defaultPersona: Persona = { 
                id: 'default-persona', 
                name: 'Default Persona', 
                instructions: oldInstructions 
              };
              savedState.personas = [defaultPersona];
              // No need to set activePersonaId here, as it's handled by global state or persona management
            }
            delete rawState.customInstructions; // Clean up old state
          }

        },
      }
    )
  )
);
