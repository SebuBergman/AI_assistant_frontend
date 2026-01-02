export const tones = ["professional", "friendly", "persuasive"];

export const deepseekModels = [
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    description:
      "Ideal for everyday conversations, brainstorming ideas, and general creative writing tasks.",
    tool_calling: true,
    pricing: {
      input: "$0.00028 / 1K tokens",
      output: "$0.00042 / 1K tokens",
    },
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    description:
      "Great for analytical work, solving math or logic problems, and detailed step-by-step reasoning.",
    tool_calling: false,
    pricing: {
      input: "$0.00028 / 1K tokens",
      output: "$0.00042 / 1K tokens",
    },
  },
];

export const chatgptModels = [
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    description: "Best flagship model for coding and agentic tasks across industries.",
    tool_calling: true,
    pricing: {
      input: "$0.00175 / 1K tokens",
      output: "$0.014 / 1K tokens",
    }
  },
  {
    id: "gpt-5.1",
    name: "GPT-5.1",
    description:
      "Best for complex reasoning, detailed explanations, coding, and high-quality creative tasks.",
    tool_calling: true,
    pricing: {
      input: "$0.00125 / 1K tokens",
      output: "$0.01 / 1K tokens",
    },
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    description:
      "Perfect for fast, everyday tasks like drafting emails, summarizing content, or quick analysis.",
    tool_calling: false,
    pricing: {
      input: "$0.00025 / 1K tokens",
      output: "$0.002 / 1K tokens",
    },
  },
  {
    id: "gpt-5-nano",
    name: "GPT-5 Nano",
    description:
      "Designed for instant, concise answers to short questions or simple lookups.",
    tool_calling: false,
    pricing: {
      input: "$0.00005 / 1K tokens",
      output: "$0.002 / 1K tokens",
    },
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    description:
      "Balanced model for general-purpose use—great for writing, research, and casual coding.",
    tool_calling: true,
    pricing: {
      input: "$0.002 / 1K tokens",
      output: "$0.008 / 1K tokens",
    },
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description:
      "Fast and efficient for day-to-day assistance, summaries, and conversational tasks.",
    tool_calling: false,
    pricing: {
      input: "$0.0004 / 1K tokens",
      output: "$0.0016 / 1K tokens",
    },
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    description:
      "Lightweight option for quick facts, simple queries, or short responses.",
    tool_calling: false,
    pricing: {
      input: "$0.0001 / 1K tokens",
      output: "$0.0004 / 1K tokens",
    },
  },
  {
    id: "o4-mini-deep-research",
    name: "GPT-o4 Mini Deep Research",
    description:
      "Fast and affordable deep research model - Ideal for tackling complex, multi-step research tasks.",
    tool_calling: true,
    pricing: {
      input: "$0.0025 / 1K tokens",
      output: "$0.01 / 1K tokens",
    },
  },
];

export const claudeModels = [
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    description:
      "Enterprise-grade performance for large-scale, high-context workloads and automation.",
    tool_calling: true,
    pricing: {
      input: "$0.003 / 1K tokens",
      output: "$0.015 / 1K tokens",
    },
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    description:
      "Balanced for everyday tasks—great for quick writing, summaries, light reasoning, and efficient coding help.",
    tool_calling: true,
    pricing: {
      input: "$0.001 / 1K tokens",
      output: "$0.005 / 1K tokens",
    },
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    description:
      "Flagship model for deep reasoning, complex analysis, and long-form creative or technical writing.",
    tool_calling: true,
    pricing: {
      input: "$0.005 / 1K tokens",
      output: "$0.025 / 1K tokens",
    },
  },
  {
    id: "claude-3-5-haiku-latest",
    name: "Claude 3.5 Haiku",
    description:
      "Fast and cost-efficient for everyday chat, summarization, and translation tasks.",
    tool_calling: true,
    pricing: {
      input: "$0.0008 / 1K tokens",
      output: "$0.004 / 1K tokens",
    },
  },
];
