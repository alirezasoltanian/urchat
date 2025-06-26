import type { Attachment, UIMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { Greeting } from "./greeting";
import { Dispatch, memo, SetStateAction, useEffect } from "react";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "motion/react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/types";
import { PromptSystem } from "./prompt-system";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  isReadonly: boolean;
  onQuerySelect: (query: string) => void;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  onQuerySelect,
  handleInputChange,
  setAttachments,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
    scrollToBottom,
  } = useMessages({
    chatId,
    status,
  });

  console.log("datadata", messages);
  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 mb-[120px] flex-1 overflow-y-auto pt-4 relative"
    >
      {messages.length === 0 && <PromptSystem onQuery={onQuerySelect} />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          handleInputChange={handleInputChange}
          setAttachments={setAttachments}
          onQuerySelect={onQuerySelect}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
