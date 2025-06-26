import type { CoreAssistantMessage, CoreToolMessage } from "ai";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// @ts-expect-error: owned by ngard
import { ChatSDKError, type ErrorCode } from "@/lib/errors";

import { models } from "./ai/models";
export const createUrlStorage = (id: string) => {
  return `${process.env.S3_STORAGE_URL}/${id}`;
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat");
    }

    throw error;
  }
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};
export async function fetchClient(input: RequestInfo, init?: RequestInit) {
  const csrf = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="))
    ?.split("=")[1];

  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "x-csrf-token": csrf || "",
      "Content-Type": "application/json",
    },
  });
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const mimeTypes = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  json: "application/json",
  txt: "text/plain",
  zip: "application/zip",
};
export function getContentType(url: string) {
  const fileName = url.split("/").pop().split("?")[0];
  const extension = fileName.split(".").pop().toLowerCase();
  return mimeTypes[extension] || "application/octet-stream";
}

/**
 * Sanitizes a URL by replacing spaces with '%20'
 * @param url - The URL to sanitize
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, "%20");
}

export async function getBaseUrlString(): Promise<string> {
  const baseUrlObj = await getBaseUrl();
  return baseUrlObj.toString();
}
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
}

export function createModelId(model: Model): string {
  return `${model.providerId}:${model.id}`;
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };
export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}
