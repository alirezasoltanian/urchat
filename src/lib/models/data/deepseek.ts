import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { ModelConfig } from "../types";

const getOpenRouterProvider = (apiKey?: string) =>
  createOpenAICompatible({
    name: "openrouter",
    apiKey: apiKey || process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

const deepseekModels: ModelConfig[] = [
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    providerId: "deepseek",
    modelFamily: "DeepSeek",
    baseProviderId: "deepseek",
    description:
      "Flagship model by DeepSeek, optimized for performance and reliability.",
    tags: ["flagship", "reasoning", "performance", "reliability"],
    contextWindow: 64000,
    inputCost: 0.14,
    outputCost: 0.28,
    priceUnit: "per 1M tokens",
    vision: false,
    tools: true,
    audio: false,
    reasoning: true,
    openSource: false,
    speed: "Medium",
    intelligence: "High",
    website: "https://deepseek.com",
    apiDocs: "https://platform.deepseek.com/api-docs",
    modelPage: "https://deepseek.com",
    releasedAt: "2024-04-01",
    icon: "deepseek",
    apiSdk: (apiKey?: string) =>
      getOpenRouterProvider(apiKey)("deepseek/deepseek-r1:free"),
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    provider: "DeepSeek",
    providerId: "deepseek",
    modelFamily: "DeepSeek",
    baseProviderId: "deepseek",
    description: "Smaller open-weight DeepSeek model for casual or hobby use.",
    tags: ["open-source", "smaller", "hobby", "research"],
    contextWindow: 32768,
    inputCost: 0.0,
    outputCost: 0.0,
    priceUnit: "per 1M tokens",
    vision: false,
    tools: true,
    audio: false,
    reasoning: true,
    openSource: true,
    speed: "Fast",
    intelligence: "Medium",
    website: "https://deepseek.com",
    apiDocs: "https://github.com/deepseek-ai/deepseek",
    modelPage: "https://github.com/deepseek-ai",
    releasedAt: "2024-12-26",
    icon: "deepseek",
    apiSdk: (apiKey?: string) => getOpenRouterProvider(apiKey)("deepseek-v3"),
  },
];

export { deepseekModels };
