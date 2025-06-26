export const DEFAULT_CHAT_MODEL: string = "chat-model";
import { LanguageModelV1 } from "ai";

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model",
    name: "Chat model",
    description: "Primary model for all-purpose chat",
  },
  {
    id: "chat-model-reasoning",
    name: "Reasoning model",
    description: "Uses advanced reasoning",
  },
];

export const DEFAULT_MODEL_NAME: string = "openai:gpt-4o";
export const DEFAULT_MODEL: string = "openai:gpt-4o-mini";
export const DEFAULT_MODEL_CUSTOM: string = "openai-compatible:lmstudio";

export interface Model {
  id: string;
  name: string;
  provider: string;
  providerId: string;
  description?: string;
  features?: string[];
  enabled: boolean;
  toolCallModel?: string;
  toolCallType?: string;
  capabilities?: string[];
}

export const models = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    providerId: "openai",
    enabled: true,
    toolCallType: "native",
    capabilities: ["vision", "image-generation", "search"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o mini",
    provider: "OpenAI",
    providerId: "openai",
    enabled: true,
    toolCallType: "native",
    capabilities: ["vision", "image-generation", "search"],
  },

  {
    id: "claude-sonnet-4",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    providerId: "anthropic",
    enabled: true,
    capabilities: ["vision", "pdfs", "search"],
    toolCallType: "native",
  },
  {
    id: "gemini-2.0-flash-001",
    name: "Google Gemini-2 flash",
    provider: "Google",
    providerId: "google",
    description: "",
    enabled: true,
    toolCallType: "manual",
    toolCallModel: "gemini-2.0-flash",
    capabilities: ["fast", "vision", "search", "pdfs"],
  },

  {
    id: "grok-3-beta",
    name: "Grok 3",
    provider: "xAI",
    providerId: "x-ai",
    enabled: true,
    toolCallType: "native",
  },
];

type ModelConfig = {
  id: string; // "gpt-4.1-nano" // same from AI SDKs
  name: string; // "GPT-4.1 Nano"
  provider: string; // "OpenAI", "Mistral", etc.
  providerId: string; // "openai", "mistral", etc.
  modelFamily?: string; // "GPT-4", "Claude 3", etc.
  baseProviderId: string; // "gemini" // same from AI SDKs

  description?: string; // Short 1–2 line summary
  tags?: string[]; // ["fast", "cheap", "vision", "OSS"]

  contextWindow?: number; // in tokens
  inputCost?: number; // USD per 1M input tokens
  outputCost?: number; // USD per 1M output tokens
  priceUnit?: string; // "per 1M tokens", "per image", etc.

  vision?: boolean;
  tools?: boolean;
  audio?: boolean;
  reasoning?: boolean;
  webSearch?: boolean;
  openSource?: boolean;

  speed?: "Fast" | "Medium" | "Slow";
  intelligence?: "Low" | "Medium" | "High";

  website?: string; // official website (e.g. https://openai.com)
  apiDocs?: string; // official API docs (e.g. https://platform.openai.com/docs/api-reference)
  modelPage?: string; // official product page (e.g. https://x.ai/news/grok-2)
  releasedAt?: string; // "2024-12-01" (optional, for tracking changes)

  icon?: string; // e.g. "gpt-4", "claude", "mistral", or custom string

  // apiSdk?: () => LanguageModelV1 // "openai("gpt-4.1-nano")"
  apiSdk?: (
    apiKey?: string,
    opts?: { enableSearch?: boolean }
  ) => LanguageModelV1;

  accessible?: boolean; // true if the model is accessible to the user
};

export type { ModelConfig };
