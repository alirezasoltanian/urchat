import { Attachment } from "ai";
import {
  BookOpenText,
  Brain,
  Code,
  ImageIcon,
  Lightbulb,
  NotepadText,
  Paintbrush,
  Sparkle,
} from "lucide-react";

const maxFileSize = 1 * 1024 * 1024; // 1 MB
const maxFilesSize = 20 * 1024 * 1024; // 20 MB
export const unknownError =
  "An unknown error occurred. Please try again later.";

export const acceptFileTypes: Record<
  string,
  { types: string[]; errorMessage: string }
> = {
  any: { types: [], errorMessage: "something wrong " },
  images: {
    types: ["image/png", "image/jpeg", "image/avif"],
    errorMessage: "(.png or .jpg only)",
  },
  csv: {
    types: ["text/csv"],
    errorMessage: "(.csv only)",
  },
  video: {
    types: ["video/mp4", "video/quicktime"],
    errorMessage: "(.mp4 or .quicktime only)",
  },
  audio: {
    types: ["audio/mp3"],
    errorMessage: "(.mp3 only)",
  },
  archive: {
    types: [
      "application/zip",
      "application/x-rar-compressed ",
      "application/pdf",
      "application/vnd.rar",
    ],
    errorMessage: "(.zip or .rar or .pdf only)",
  },
};
export const imageDefaultUploadFile = {
  acceptFileTypes: acceptFileTypes.images,
  maxFileSize: 1048576 * 10,
  maxFilesSize: 20 * 1024 * 1024,
  maxFileCount: 6,
};

export const attachmentDefaultUploadFile = {
  acceptFileTypes: {
    types: [
      ...acceptFileTypes.images.types,
      ...acceptFileTypes.archive.types,
      ...acceptFileTypes.csv.types,
    ],
    errorMessage:
      acceptFileTypes.images.errorMessage +
      acceptFileTypes.archive.errorMessage +
      acceptFileTypes.csv.errorMessage,
  },
  maxFileSize: 1048576 * 10,
  maxFilesSize: 20 * 1024 * 1024,
  maxFileCount: 6,
};

export const guestRegex = /^guest-\d+$/;

export const fileDefaultUploadFile = {
  acceptFileTypes: acceptFileTypes.archive,
  maxFileSize: 40 * 1024 * 1024,
  maxFilesSize: 100 * 1024 * 1024,
  maxFileCount: 4,
};

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);
export const CHAT_ID = "search" as const;

export const SUGGESTIONS = [
  {
    label: "Code",
    highlight: "Help me",
    prompt: `Help me`,
    items: [
      "Help me create a React component for a user profile",
      "Help me set up routing in a Next.js application",
      "Help me write a JavaScript function to fetch data from an API",
      "Help me convert this Python script to JavaScript",
    ],
    icon: Code,
  },
  {
    label: "Image",
    highlight: "Generate",
    prompt: `Generate`,
    items: [
      "Generate an image of a bustling marketplace",
      "Generate an image of a tranquil forest scene",
      "Generate an image representing unity and diversity",
      "Generate an image of a futuristic transportation system",
    ],
    icon: ImageIcon,
  },
  {
    label: "Design",
    highlight: "Design",
    prompt: `Design`,
    items: [
      "Design a logo for a startup company",
      "Design a landing page for an e-commerce website",
      "Design an infographic about climate change",
      "Design a business card for a freelancer",
    ],
    icon: Paintbrush,
  },
  {
    label: "Summary",
    highlight: "Summarize",
    prompt: `Summarize`,
    items: [
      "Summarize the key events of the Cold War",
      "Summarize the main themes of 'Pride and Prejudice'",
      "Summarize the impact of social media on communication",
      "Summarize the benefits of a balanced diet",
    ],
    icon: NotepadText,
  },
  {
    label: "Research",
    highlight: "Research",
    prompt: `Research`,
    items: [
      "Research the effects of climate change on biodiversity",
      "Research the history of artificial intelligence",
      "Research the impact of remote learning on education",
      "Research the latest advancements in renewable energy technology",
    ],
    icon: BookOpenText,
  },
  {
    label: "Get inspired",
    highlight: "Inspire me",
    prompt: `Inspire me`,
    items: [
      "Inspire me with a story of resilience",
      "Inspire me with a quote from a famous artist",
      "Inspire me with a creative writing prompt about adventure",
      "Inspire me with a description of a bustling city at night",
    ],
    icon: Sparkle,
  },
  {
    label: "Think deeply",
    highlight: "Reflect on",
    prompt: `Reflect on`,
    items: [
      "Reflect on the importance of empathy in society",
      "Reflect on the concept of happiness and what it means to you",
      "Reflect on the challenges of balancing work and life",
      "Reflect on the role of technology in our daily lives",
    ],
    icon: Brain,
  },
  {
    label: "Learn gently",
    highlight: "Explain",
    prompt: `Explain`,
    items: [
      "Explain the basics of blockchain technology",
      "Explain the concept of mindfulness and its benefits",
      "Explain how climate change affects weather patterns",
      "Explain the principles of effective communication",
    ],
    icon: Lightbulb,
  },
];
export const shortcuts = [
  {
    action: "Search",
    keys: ["Ctrl", "Shift", "K"],
  },
  {
    action: "Focus Chat",
    keys: ["Ctrl", "Shift", "L"],
  },
  {
    action: "New Chat",
    keys: ["Ctrl", "Shift", "O"],
  },
  {
    action: "Toggle Sidebar",
    keys: ["Ctrl", , "B"],
  },
  {
    action: "Shortcuts",
    keys: ["Ctrl", "Shift", "S"],
  },
];
export const FREE_MODELS_IDS = [
  "openrouter:deepseek/deepseek-r1:free",
  "openrouter:meta-llama/llama-3.3-8b-instruct:free",
  "pixtral-large-latest",
  "mistral-large-latest",
  "gpt-4.1-nano",
];
