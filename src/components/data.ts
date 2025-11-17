export const tones = ["professional", "friendly", "persuasive"];

export const deepseekModels = [
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    description: "Ideal for everyday conversations, brainstorming ideas, and general creative writing tasks.",
    tool_calling: true,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    description: "Great for analytical work, solving math or logic problems, and detailed step-by-step reasoning.",
    tool_calling: false,
  },
];

export const chatgptModels = [
  {
    id: "gpt-5",
    name: "GPT-5",
    description: "Best for complex reasoning, detailed explanations, coding, and high-quality creative tasks.",
    tool_calling: true,
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Perfect for fast, everyday tasks like drafting emails, summarizing content, or quick analysis.",
    tool_calling: false,
  },
  {
    id: "gpt-5-nano",
    name: "GPT-5 Nano",
    description: "Designed for instant, concise answers to short questions or simple lookups.",
    tool_calling: false,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    description: "Balanced model for general-purpose use—great for writing, research, and casual coding.",
    tool_calling: true,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "Fast and efficient for day-to-day assistance, summaries, and conversational tasks.",
    tool_calling: false,
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    description: "Lightweight option for quick facts, simple queries, or short responses.",
    tool_calling: false,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "High-performance model built for advanced reasoning, coding, and complex creative projects.",
    tool_calling: true,
  },
];

export const claudeModels = [
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    description: "Enterprise-grade performance for large-scale, high-context workloads and automation.",
    tool_calling: true,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description: "Balanced for everyday tasks—great for quick writing, summaries, light reasoning, and efficient coding help.",
    tool_calling: true,
  },
  {
    id: "claude-opus-4-1",
    name: "Claude Opus 4.1",
    description: "Flagship model for deep reasoning, complex analysis, and long-form creative or technical writing.",
    tool_calling: true,
  },
  {
    id: "claude-3-7-sonnet-latest",
    name: "Claude 3.7 Sonnet",
    description: "Enhanced for adaptive, multi-step reasoning and autonomous or agent-style workflows.",
    tool_calling: true,
  },
  
  {
    id: "claude-3-5-haiku-latest",
    name: "Claude 3.5 Haiku",
    description: "Fast and cost-efficient for everyday chat, summarization, and translation tasks.",
    tool_calling: true,
  },
];
