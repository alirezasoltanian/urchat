import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { xai } from "@ai-sdk/xai";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const myProvider = customProvider({
  languageModels: {
    "chat-model": openrouter("openai/gpt-5-nano"),
    "chat-model-reasoning": openrouter("openai/gpt-5-nano"),
    "title-model": openrouter("openai/gpt-5-nano"),
    openai: openrouter("openai/gpt-5-nano"),
    "artifact-model": openrouter("openai/gpt-5-nano"),
  },
  imageModels: {
    "small-model": xai.image("grok-2-image"),
  },
});
