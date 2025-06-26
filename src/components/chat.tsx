"use client";

import { ChatHeader } from "@/components/chat-header";
import { useAutoResume } from "@/hooks/use-auto-resume";

import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { ChatSDKError } from "@/lib/errors";

import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import type { Attachment, UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { Messages } from "./messages";
// import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";

import { User } from "better-auth";
import { useHotkeys } from "react-hotkeys-hook";
import { MultimodalInput } from "./multimodal-input";
import ReModal from "./reuseable/re-modal";
import { Badge } from "./ui/badge";
import { useSidebar } from "./ui/sidebar";
import type { VisibilityType } from "./visibility-selector";
import { forkAction } from "@/lib/queries/chat";
import { Button } from "./ui/button";
import { ForkKnife, GitFork } from "lucide-react";
import Spinner from "./ui/spinner";
import { shortcuts } from "@/constants";
import { Vote } from "@/db/schema";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  user,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  user: User;
}) {
  const { mutate } = useSWRConfig();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
    handleInputChange,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    fetch: fetchWithErrorHandlers,
    experimental_prepareRequestBody: (body) => {
      console.log("Request Body:", body);
      return {
        id,
        message: body.messages.at(-1),
        selectedChatModel: initialChatModel,
        selectedVisibilityType: visibilityType,
      };
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      // if (error instanceof ChatSDKError) {
      toast({
        type: "error",
        description: error.message,
      });
      // }
    },
  });

  const onQuerySelect = (query: string) => {
    if (!messages.length) {
      window.history.replaceState({}, "", `/chat/${id}`);
    }
    append({
      role: "user",
      content: query ?? input,
      parts: [{ text: query ?? input, type: "text" }],
    });
  };
  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [openShortcutDialog, setOpenShortcutDialog] = useState(false);
  const [isForkLoading, setIsForkLoading] = useState(false);

  const { toggleSidebar, setOpenMobile } = useSidebar();
  const router = useRouter();
  // useAutoResume({
  //   autoResume,
  //   initialMessages,
  //   experimental_resume,
  //   data,
  //   setMessages,
  // });
  useHotkeys("ctrl+shift+s", (event) => {
    event.preventDefault();
    setOpenShortcutDialog(true);
  });
  useHotkeys("ctrl+b", (event) => {
    event.preventDefault();

    toggleSidebar();
  });
  useHotkeys("ctrl+shift+o", (event) => {
    event.preventDefault();

    setOpenMobile(false);
    router.push("/");
    router.refresh();
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          user={user}
          chatId={id}
          selectedModelId={initialChatModel}
          openShortcutDialog={openShortcutDialog}
          setOpenShortcutDialog={setOpenShortcutDialog}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          onQuerySelect={onQuerySelect}
          handleInputChange={handleInputChange}
          isReadonly={isReadonly}
          setAttachments={setAttachments}
        />

        {!isReadonly ? (
          <MultimodalInput
            input={input}
            chatId={id}
            setInput={setInput}
            handleSubmit={handleSubmit}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            selectedVisibilityType={visibilityType}
          />
        ) : (
          <Button
            onClick={async () => {
              setIsForkLoading(true);
              await forkAction({
                chatId: id,
                createdAt: messages.at(-1)?.createdAt as Date,
              });
              setIsForkLoading(false);
            }}
            disabled={isForkLoading}
            className=" mx-auto flex mt-auto absolute bottom-8 left-0 right-0 duration-500   gap-2 md:w-1/2 w-[90%] max-w-[650px]  px-0 pt-2 "
          >
            {isForkLoading ? <Spinner /> : <GitFork className="size-3" />}
            Fork All chat
          </Button>
        )}

        <ReModal onOpenChange={setOpenShortcutDialog} open={openShortcutDialog}>
          <div className="space-y-4 py-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className=" font-medium">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <Badge key={keyIndex} className="flex items-center gap-1">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ReModal>
      </div>
    </>
  );
}
