export type ModelFamily = "openai" | "anthropic" | "google" | "meta" | "thinkingmachines";

export type KernelModel = {
  id: string;
  label: string;
  family: ModelFamily;
  /** Open-weight / open-source lineage vs. closed frontier model. */
  openSource: boolean;
  blurb: string;
};

/** Provider metadata for grouping + the little identity dot in the picker. */
export const MODEL_FAMILY_META: Record<ModelFamily, { label: string; accent: string }> = {
  openai: { label: "OpenAI", accent: "oklch(0.72 0.02 120)" },
  anthropic: { label: "Anthropic", accent: "oklch(0.68 0.13 55)" },
  google: { label: "Google", accent: "oklch(0.7 0.15 250)" },
  meta: { label: "Meta", accent: "oklch(0.66 0.17 260)" },
  thinkingmachines: { label: "Thinking Machines Lab", accent: "oklch(0.72 0.16 200)" },
};

export const KERNEL_MODELS: KernelModel[] = [
  // Frontier OpenAI models (Responses API)
  {
    id: "openai/gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    family: "openai",
    openSource: false,
    blurb: "Flagship reasoning. The default Kernel brain.",
  },
  {
    id: "openai/gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    family: "openai",
    openSource: false,
    blurb: "Balanced everyday quality at lower cost.",
  },
  {
    id: "openai/gpt-5.5-pro",
    label: "GPT-5.5 Pro",
    family: "openai",
    openSource: false,
    blurb: "Extended reasoning for the hardest problems.",
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    family: "openai",
    openSource: false,
    blurb: "Strong mini model for sub-agents.",
  },
  {
    id: "openai/gpt-5-nano",
    label: "GPT-5 Nano",
    family: "openai",
    openSource: false,
    blurb: "Cheapest, fastest OpenAI option here.",
  },

  // Anthropic
  {
    id: "anthropic/claude-opus-4.8",
    label: "Claude Opus 4.8",
    family: "anthropic",
    openSource: false,
    blurb: "Anthropic's most capable model, for deep and careful work.",
  },
  {
    id: "anthropic/claude-sonnet-5",
    label: "Claude Sonnet 5",
    family: "anthropic",
    openSource: false,
    blurb: "Fast, well-rounded reasoning and writing.",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    family: "anthropic",
    openSource: false,
    blurb: "Near-instant answers for everyday turns.",
  },

  // Google
  {
    id: "google/gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    family: "google",
    openSource: true,
    blurb: "Latest Flash: quick coding and agentic work.",
  },
  {
    id: "google/gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro",
    family: "google",
    openSource: true,
    blurb: "Next-gen Gemini reasoning, quality first.",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    family: "google",
    openSource: true,
    blurb: "Balanced cost, latency and quality.",
  },

  // Meta
  {
    id: "meta/llama-4-maverick",
    label: "Llama 4 Maverick",
    family: "meta",
    openSource: true,
    blurb: "Open-weight multimodal, strong general reasoning.",
  },
  {
    id: "meta/llama-4-scout",
    label: "Llama 4 Scout",
    family: "meta",
    openSource: true,
    blurb: "Lightweight open-weight model with a huge context window.",
  },

  // Thinking Machines Lab
  {
    id: "thinkingmachines/tinker-lab",
    label: "Tinker Lab",
    family: "thinkingmachines",
    openSource: false,
    blurb: "Thinking Machines Lab's research-grade reasoning model.",
  },
];

export const DEFAULT_MODEL_ID = "openai/gpt-5.6-sol";

export function resolveModel(id: string | null | undefined): KernelModel {
  return (
    KERNEL_MODELS.find((model) => model.id === id) ??
    KERNEL_MODELS.find((model) => model.id === DEFAULT_MODEL_ID)!
  );
}
