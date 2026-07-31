export interface ModelPreset {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow?: string;
  hasVision?: boolean;
}

export const MODEL_PRESETS: ModelPreset[] = [

  // Anthropic / Claude
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', description: 'High-concurrency aggregated model with 1M context. Ideal for agents, workflows, vision, and high throughput.', contextWindow: '1M', hasVision: true },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'Anthropic', description: 'Next-gen flagship model for complex reasoning, full-stack coding, and multi-turn agent workflows.', contextWindow: '1M', hasVision: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', description: 'Top-tier frontier reasoning model for deep research, complex system engineering, and multi-day agent tasks.', contextWindow: '1M', hasVision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Lightweight & ultra-fast Claude model optimized for quick Q&A, text classification, and low-latency API calls.', contextWindow: '256K', hasVision: true },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', description: 'Multimodal model with 1M context, suited for complex architectural design, deep reasoning, and code refactoring.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', provider: 'Anthropic', description: 'Advanced model for deep code reviews, technical planning, and multi-stage logic validation.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'Anthropic', description: 'High-value enterprise model for long-horizon agent execution and rigorous technical reporting.', contextWindow: '1M', hasVision: true },
  { id: 'claude-opus-5', name: 'Claude Opus 5', provider: 'Anthropic', description: 'Premier Opus 5 engine built for enterprise agent programming, deep reasoning, and software delivery.', contextWindow: '1M', hasVision: true },

  // OpenAI
  { id: 'gpt-5.6-sol', name: 'GPT 5.6 Sol', provider: 'OpenAI', description: 'High-capacity flagship model for complex Q&A, advanced code generation, long document context, and vision.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-terra', name: 'GPT 5.6 Terra', provider: 'OpenAI', description: 'Balanced performance model for daily engineering tasks, document processing, and multimodal interaction.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.6-luna', name: 'GPT 5.6 Luna', provider: 'OpenAI', description: 'High-speed entry model tailored for frequent API calls, general Q&A, and document parsing.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.4', name: 'GPT 5.4', provider: 'OpenAI', description: 'General workhorse model for daily Q&A, software engineering, long-form writing, and agent automation.', contextWindow: '1M', hasVision: true },
  { id: 'gpt-5.5', name: 'GPT 5.5', provider: 'OpenAI', description: 'High-capability model tailored for complex reasoning, code architecture planning, and critical production tasks.', contextWindow: '258K', hasVision: true },
  { id: 'gpt-5.3-codex-spark', name: 'GPT 5.3 Codex Spark', provider: 'OpenAI', description: 'Real-time Codex coding engine for rapid code completion, live debugging, and UI tweaking.', contextWindow: '128K', hasVision: false },

  // Qwen
  { id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus', provider: 'Qwen', description: 'High-value 1M context model for large codebases, technical documentation, and tool-use agent workflows.', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-plus', name: 'Qwen 3.7 Plus', provider: 'Qwen', description: 'Next-gen agent model tuned for OpenClaw, Claude Code, Hermes, and codebase navigation.', contextWindow: '1M', hasVision: true },
  { id: 'qwen3.7-max', name: 'Qwen 3.7 Max', provider: 'Qwen', description: 'Flagship reasoning engine for complex logic, system architecture design, and long-cycle agent tasks.', contextWindow: '1M', hasVision: false },
  { id: 'qwen3.8-max', name: 'Qwen 3.8 Max', provider: 'Qwen', description: 'Multimodal 1M context model supporting high-value analysis, complex reasoning, and multimodal inputs.', contextWindow: '1M', hasVision: true },

  // DeepSeek
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', description: 'High-performance reasoning model tailored for math, complex algorithmic planning, and deep code analysis.', contextWindow: '1M', hasVision: false },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', description: 'Fast, cost-effective DeepSeek variant for rapid Q&A, summarization, and lightweight reasoning.', contextWindow: '1M', hasVision: false },

  // ByteDance / Doubao
  { id: 'doubao-seed-2.0-code', name: 'Doubao Seed 2.0 Code', provider: 'ByteDance', description: 'Specialized coding model for code synthesis, refactoring, debugging, and engineering assistance.', contextWindow: '200K', hasVision: true },
  { id: 'doubao-seed-2.0-pro', name: 'Doubao Seed 2.0 Pro', provider: 'ByteDance', description: 'Enhanced general model for complex Q&A, creative writing, multimodal vision, and analytical tasks.', contextWindow: '128K', hasVision: true },

  // Zhipu GLM
  { id: 'glm-5.1', name: 'GLM 5.1', provider: 'Zhipu GLM', description: 'Flagship general model for writing, data analysis, coding, and agent engineering workflows.', contextWindow: '256K', hasVision: true },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu GLM', description: 'Next-gen multimodal model for complex technical writing, multimodal vision, and code generation.', contextWindow: '1M', hasVision: true },

  // Kimi / xAI / Xiaomi / MiniMax / Meituan / Tencent / Stepfun
  { id: 'kimi-k3', name: 'Kimi K3', provider: 'Moonshot Kimi', description: 'Next-gen 1M context multimodal model for massive document analysis, codebase Q&A, and vision.', contextWindow: '1M', hasVision: true },
  { id: 'grok-4.5', name: 'Grok 4.5', provider: 'xAI Grok', description: 'Powerful general intelligence model for technical Q&A, programming, and long document reasoning.', contextWindow: '500K', hasVision: true },
  { id: 'mimo-v2.5-pro', name: 'MiMo v2.5 Pro', provider: 'Xiaomi MiMo', description: 'Professional enterprise model for long text analysis, strategic planning, and automated workflows.', contextWindow: '1M', hasVision: false },
  { id: 'mimo-v2.5', name: 'MiMo v2.5', provider: 'Xiaomi MiMo', description: 'Cost-effective model for daily conversational tasks, rewriting, summarization, and batch processing.', contextWindow: '1M', hasVision: true },
  { id: 'MiniMax-M3', name: 'MiniMax M3', provider: 'MiniMax', description: '1M context multimodal model built for long documents, agent tasks, multi-turn reasoning, and vision.', contextWindow: '1M', hasVision: true },
  { id: 'LongCat-2.0', name: 'LongCat 2.0', provider: 'Meituan', description: 'Long-context agentic coding model for codebase understanding, complex planning, and long-form reasoning.', contextWindow: '1M', hasVision: false },
  { id: 'hy3', name: 'Hunyuan 3 (hy3)', provider: 'Tencent', description: 'Hunyuan 3 reasoning & agent model for code execution, document analysis, and task automation.', contextWindow: '256K', hasVision: false },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', provider: 'Stepfun', description: 'High-speed model for code assistant workflows, conversational Q&A, vision, and lightweight agents.', contextWindow: '256K', hasVision: true },
];
