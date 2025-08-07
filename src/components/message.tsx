"use client";

import type { UIMessage } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, memo, useCallback, useState } from "react";
// import { DocumentToolCall, DocumentToolResult } from "./document";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import type { UseChatHelpers } from "@ai-sdk/react";
import GenerateImage from "./tools/generate-image";
import SearchSection from "./tools/search-section";
import { Vote } from "@/db/schema";
import { GlowEffect } from "./core/glow-effect";
import { Tooltip } from "./reuseable/re-tooltip";
import CopyButton from "./CopyButton";
import { Attachment, ChatMessage } from "@/types";
import { BorderTrail } from "./core/border-trail";
import { Image } from "lucide-react";
import { TextShimmer } from "./core/text-shimmer";
import ChatTextHighlighter from "./chat-text-highlighter";

export const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
  onQuerySelect,
  setInput,
  setAttachments,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  onQuerySelect: (query: string) => void;
  setInput: Dispatch<SetStateAction<string>>;
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  console.log("firstfirstfirstfirst222", message);
  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );
  const handleHighlight = useCallback(
    (text: string) => {
      const quotedText = `> ${text.replace(/\n/g, "\n> ")}\n\n`;
      setInput((prev) => prev + quotedText);

      // Focus the input after adding the quote
      setTimeout(() => {
        const inputElement = document.querySelector(
          'textarea[placeholder*="Ask"]'
        ) as HTMLTextAreaElement;
        if (inputElement) {
          inputElement.focus();
          // Move cursor to end
          inputElement.setSelectionRange(
            inputElement.value.length,
            inputElement.value.length
          );
        }
      }, 100);
    },
    [setInput]
  );
  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message pb-8"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-4 w-full items-end relative ",
              {
                "min-h-96 ":
                  message.role === "assistant" && requiresScrollPadding,
              },
              { "items-start": message.role === "assistant" }
            )}
          >
            {attachmentsFromMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.filename ?? "file",
                      contentType: attachment.mediaType,
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning" && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 items-end relative"
                    >
                      {!isReadonly && message.role === "assistant" && (
                        <div className="absolute -start-1 bottom-[-40px]">
                          <MessageActions
                            key={`action-${message.id}`}
                            chatId={chatId}
                            messageId={message.id}
                            text={message.parts
                              ?.filter((part) => part.type === "text")
                              .map((part) => part.text)
                              .join("\n")
                              .trim()}
                            vote={vote}
                            isLoading={isLoading}
                            createdAt={message.createdAt}
                          />
                        </div>
                      )}
                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <ChatTextHighlighter
                          onHighlight={handleHighlight}
                          removeHighlightOnClick={true}
                        >
                          <ChatTextHighlighter
                            onHighlight={handleHighlight}
                            removeHighlightOnClick={true}
                          >
                            <Markdown>{sanitizeText(part.text)}</Markdown>
                          </ChatTextHighlighter>
                        </ChatTextHighlighter>
                      </div>
                      {message.role === "user" && !isReadonly && (
                        <div className="flex gap-2 absolute -bottom-[30px]">
                          <Tooltip content="Edit message">
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              size="iconsm"
                              className="  text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Copy">
                            <CopyButton
                              className={cn(
                                buttonVariants({
                                  variant: "ghost",
                                  size: "iconsm",
                                }),
                                "  text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              )}
                              text={
                                message.parts?.find(
                                  (part) => part?.type === "text" && !!part.text
                                )?.text || ""
                              }
                            />
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div
                      key={key}
                      className="flex flex-row mt-6 gap-2 items-start w-full"
                    >
                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-generateImage") {
                console.log("tool-generateImage", type, part.state);
                if (part.state !== "output-available") {
                  return (
                    <div className="relative size-52 flex-col items-center justify-center rounded-md bg-zinc-200 px-5 py-2 dark:bg-zinc-800">
                      <BorderTrail
                        style={{
                          boxShadow:
                            "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                        }}
                        size={100}
                      />
                      <div
                        className="flex h-full animate-pulse flex-col items-center justify-center space-y-2"
                        role="status"
                        aria-label="Loading..."
                      >
                        <motion.div
                          animate={{
                            color: [
                              "#0894FF",
                              "#C959DD",
                              "#FF2E54",
                              "#FF9004",
                              "#0894FF",
                            ],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Image size={64} />
                        </motion.div>
                      </div>
                    </div>
                  );
                }
                if (part.state === "output-available") {
                  return (
                    <GenerateImage
                      setAttachments={setAttachments}
                      tool={{ output: part?.output, input: part.input }}
                      setInput={setInput}
                    />
                  );
                }
              }
              if (type === "tool-search") {
                if (part.state !== "output-available") {
                  return (
                    <TextShimmer
                      duration={1.2}
                      className="text-xl font-medium [--base-color:var(--color-blue-500)] [--base-gradient-color:var(--color-blue-200)] dark:[--base-color:var(--color-blue-700)] dark:[--base-gradient-color:var(--color-blue-400)]"
                    >
                      Search the web
                    </TextShimmer>
                  );
                }
                if (part.state === "output-available") {
                  return (
                    <SearchSection
                      tool={{ output: part?.output, input: part.input }}
                    />
                  );
                }
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message, nextProps.message)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-10 animate-pulse relative rounded-full overflow-hidden ">
          <div className="pointer-events-none absolute inset-0 z-0">
            <GlowEffect
              colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
              mode="colorShift"
              blur="medium"
              duration={4}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
