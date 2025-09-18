import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { xai } from "@ai-sdk/xai";
import { openai } from "@ai-sdk/openai";

export const myProvider = customProvider({
  languageModels: {
    "chat-model": xai("grok-2-vision-1212"),
    "chat-model-reasoning": wrapLanguageModel({
      model: xai("grok-3-mini-beta"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-5-nano"),
    openai: openai("gpt-5-nano"),
    "artifact-model": xai("grok-2-1212"),
  },
  imageModels: {
    "small-model": xai.image("grok-2-image"),
  },
});
