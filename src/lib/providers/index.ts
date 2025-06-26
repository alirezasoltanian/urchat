export type Provider = {
  id: string;
  name: string;
  available: boolean;
  icon: string;
};

export const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: "OpenRouter",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "openaI",
  },
  {
    id: "mistral",
    name: "Mistral",
    icon: "mistral",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "deepseek",
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "gemini",
  },
  {
    id: "claude",
    name: "Claude",
    icon: "claude",
  },
  {
    id: "grok",
    name: "Grok",
    icon: "grok",
  },
  {
    id: "xai",
    name: "XAI",
    icon: "xai",
  },
  {
    id: "google",
    name: "Google",
    icon: "google",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic",
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: "ollama",
  },
  {
    id: "meta",
    name: "Meta",
    icon: "meta",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "preplexity",
  },
] as Provider[];
