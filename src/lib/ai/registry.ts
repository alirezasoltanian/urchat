import { createOpenAI, openai } from "@ai-sdk/openai";
import {
  createProviderRegistry,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
// import { anthropic } from '@ai-sdk/anthropic'
// import { google } from '@ai-sdk/google'
// import { createAzure } from '@ai-sdk/azure'

export const registry = createProviderRegistry({
  openai,
  // togetherai,
  //   anthropic,
  // google,

  // xai,
  // deepseek,
  // fireworks: {
  //   ...createFireworks({
  //     apiKey: process.env.FIREWORKS_API_KEY
  //   }),
  //   languageModel: fireworks
  // },
  // fireworks: createFireworks({
  //   apiKey: process.env.FIREWORKS_API_KEY ?? "",
  // }),
  // ollama: createOllama({
  //   baseURL: `${process.env.OLLAMA_BASE_URL}/api`,
  // }),
  //   azure: createAzure({
  //     apiKey: process.env.AZURE_API_KEY,
  //     resourceName: process.env.AZURE_RESOURCE_NAME
  //   }),
  "openai-compatible": createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL,
  }),
});

export function getModel(model: string) {
  return registry.languageModel(
    model as Parameters<typeof registry.languageModel>[0]
  );
}

export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "google":
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case "groq":
      return !!process.env.GROQ_API_KEY;
    case "ollama":
      return !!process.env.OLLAMA_BASE_URL;
    case "deepseek":
      return !!process.env.DEEPSEEK_API_KEY;
    case "fireworks":
      return !!process.env.FIREWORKS_API_KEY;
    case "xai":
      return !!process.env.XAI_API_KEY;
    case "togetherai":
      return !!process.env.TOGETHER_AI_API_KEY;
    case "azure":
      return !!process.env.AZURE_API_KEY && !!process.env.AZURE_RESOURCE_NAME;
    case "openai-compatible":
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL
      );
    default:
      return false;
  }
}
export function getToolCallModel(model?: string) {
  const [provider, ...modelNameParts] = model?.split(":") ?? [];
  const modelName = modelNameParts.join(":");
  switch (provider) {
    case "deepseek":
      return getModel("deepseek:deepseek-chat");
    case "fireworks":
      return getModel(
        "fireworks:accounts/fireworks/models/llama-v3p1-8b-instruct"
      );
    case "groq":
      return getModel("groq:llama-3.1-8b-instant");
    case "ollama":
      const ollamaModel =
        process.env.NEXT_PUBLIC_OLLAMA_TOOL_CALL_MODEL || modelName;
      return getModel(`ollama:${ollamaModel}`);
    default:
      return getModel("openai:gpt-4o-mini");
  }
}
export function isToolCallSupported(model?: string) {
  const [provider, ...modelNameParts] = model?.split(":") ?? [];
  const modelName = modelNameParts.join(":");
  if (provider === "ollama") {
    return false;
  }
  if (provider === "google") {
    return false;
  }
  // Deepseek R1 is not supported
  // Deepseek v3's tool call is unstable, so we include it in the list
  return !modelName?.includes("deepseek");
}
export function isReasoningModel(model: string): boolean {
  if (typeof model !== "string") {
    return false;
  }
  return (
    model.includes("deepseek-r1") ||
    model.includes("deepseek-reasoner") ||
    model.includes("o3-mini")
  );
}
