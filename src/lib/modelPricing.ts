// ============================================================
// modelPricing.ts
// All prices are in USD per 1,000 tokens (input / output)
// Sources: Anthropic, OpenAI, DeepSeek official docs (March 2026)
// ============================================================

export interface ModelPricing {
  modelId: string;          // exact string used in API calls
  displayName: string;
  provider: "anthropic" | "openai" | "deepseek";
  inputPricePer1k: number;  // $ per 1,000 input tokens
  outputPricePer1k: number; // $ per 1,000 output tokens
}

// ── Claude models ────────────────────────────────────────────
// Prices: $5/$25, $3/$15, $1/$5, $0.8/$4 per 1M tokens → divide by 1000
const claudeModels: ModelPricing[] = [
  {
    modelId: "claude-opus-4-6",
    displayName: "Claude Opus 4.6",
    provider: "anthropic",
    inputPricePer1k: 0.005,
    outputPricePer1k: 0.025,
  },
  {
    modelId: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    provider: "anthropic",
    inputPricePer1k: 0.003,
    outputPricePer1k: 0.015,
  },
  {
    modelId: "claude-haiku-4-5",
    displayName: "Claude Haiku 4.5",
    provider: "anthropic",
    inputPricePer1k: 0.001,
    outputPricePer1k: 0.005,
  },
  {
    modelId: "claude-3-5-haiku-latest",
    displayName: "Claude 3.5 Haiku",
    provider: "anthropic",
    inputPricePer1k: 0.0008,
    outputPricePer1k: 0.004,
  },
];

// ── DeepSeek models ──────────────────────────────────────────
// deepseek-chat  = V3.2 : $0.28/$0.42 per 1M (cache miss)
// deepseek-reasoner = R1 : $0.28/$0.42 per 1M
const deepseekModels: ModelPricing[] = [
  {
    modelId: "deepseek-chat",
    displayName: "DeepSeek V3 (Chat)",
    provider: "deepseek",
    inputPricePer1k: 0.00028,
    outputPricePer1k: 0.00042,
  },
  {
    modelId: "deepseek-reasoner",
    displayName: "DeepSeek R1 (Reasoner)",
    provider: "deepseek",
    inputPricePer1k: 0.00028,
    outputPricePer1k: 0.00042,
  },
];

// ── GPT models ───────────────────────────────────────────────
// Prices per 1M tokens from OpenAI official pricing (Q1 2026):
//   gpt-5.4                : $2.50 / $15.00
//   gpt-5.2                : $1.75 / $14.00
//   gpt-5.3-codex          : $1.75 / $14.00
//   gpt-5-mini             : $0.25 / $2.00
//   gpt-5-nano             : $0.05 / $0.40
//   gpt-4.1                : $2.00 / $8.00
//   o4-mini-deep-research  : $2.00 / $8.00
const gptModels: ModelPricing[] = [
  {
    modelId: "gpt-5.4",
    displayName: "GPT-5.4",
    provider: "openai",
    inputPricePer1k: 0.0025,
    outputPricePer1k: 0.015,
  },
  {
    modelId: "gpt-5.2",
    displayName: "GPT-5.2",
    provider: "openai",
    inputPricePer1k: 0.00175,
    outputPricePer1k: 0.014,
  },
  {
    modelId: "gpt-5.3-codex",
    displayName: "GPT-5.3 Codex",
    provider: "openai",
    inputPricePer1k: 0.00175,
    outputPricePer1k: 0.014,
  },
  {
    modelId: "gpt-5-mini",
    displayName: "GPT-5 Mini",
    provider: "openai",
    inputPricePer1k: 0.00025,
    outputPricePer1k: 0.002,
  },
  {
    modelId: "gpt-5-nano",
    displayName: "GPT-5 Nano",
    provider: "openai",
    inputPricePer1k: 0.00005,
    outputPricePer1k: 0.002,
  },
  {
    modelId: "gpt-4.1",
    displayName: "GPT-4.1",
    provider: "openai",
    inputPricePer1k: 0.002,
    outputPricePer1k: 0.008,
  },
  {
    modelId: "o4-mini-deep-research",
    displayName: "o4 Mini Deep Research",
    provider: "openai",
    inputPricePer1k: 0.002,
    outputPricePer1k: 0.008,
  },
];

// ── Master lookup table ──────────────────────────────────────
export const MODEL_PRICING: ModelPricing[] = [
  ...claudeModels,
  ...deepseekModels,
  ...gptModels,
];

// ── Helpers ──────────────────────────────────────────────────

/**
 * Look up pricing for the currently active model.
 * Pass in the model string returned by the API (e.g. response.model).
 * Returns null if the model is not in the table.
 */
export function getPricing(modelId: string): ModelPricing | null {
  const normalized = modelId.toLowerCase().trim();
  return (
    MODEL_PRICING.find((m) => m.modelId.toLowerCase() === normalized) ?? null
  );
}

export interface CostEstimate {
  modelId: string;
  displayName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * Calculate the cost for a single API call.
 *
 * @param modelId    - model string from the API response
 * @param inputTokens  - number of input tokens used
 * @param outputTokens - number of output tokens used
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const pricing = getPricing(modelId);

  if (!pricing) {
    console.warn(`[modelPricing] Unknown model: "${modelId}". Cost set to 0.`);
    return {
      modelId,
      displayName: modelId,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    };
  }

  const inputCost  = (inputTokens  / 1000) * pricing.inputPricePer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputPricePer1k;

  return {
    modelId: pricing.modelId,
    displayName: pricing.displayName,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

/**
 * Format a CostEstimate as a human-readable string block,
 * matching the style of your existing Token Counts output.
 */
export function formatCostEstimate(estimate: CostEstimate): string {
  return [
    "",
    `Cost Estimate  (${estimate.displayName})`,
    `Input Cost:    $${estimate.inputCost.toFixed(6)}`,
    `Output Cost:   $${estimate.outputCost.toFixed(6)}`,
    `Total Cost:    $${estimate.totalCost.toFixed(6)}`,
  ].join("\n");
}

// ── Running session totals (optional) ───────────────────────
let sessionCost = 0;

export function addToSessionTotal(cost: number): void {
  sessionCost += cost;
}

export function getSessionTotal(): number {
  return sessionCost;
}

export function resetSessionTotal(): void {
  sessionCost = 0;
}