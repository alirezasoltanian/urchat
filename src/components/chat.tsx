"use client";

import { ChatHeader } from "@/components/chat-header";

import { useChatVisibility } from "@/hooks/use-chat-visibility";

import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { Messages } from "./messages";
// import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import { toast } from "./toast";
import * as LucideIcons from "lucide-react";

import { shortcuts } from "@/constants";
import { Vote } from "@/db/schema";
import { forkAction } from "@/lib/queries/chat";
import { Attachment, ChatMessage } from "@/types";
import { User } from "better-auth";
import { GitFork } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { MultimodalInput } from "./multimodal-input";
import ReModal from "./reuseable/re-modal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import Spinner from "./ui/spinner";
import type { VisibilityType } from "./visibility-selector";
type PromptItem = {
  name: string;
  description: string;
  icon?: string;
};
const defaultSuggestions: PromptItem[] = [
  {
    name: "دریافت مشتری ها",
    description: "لیستی از مشتری هاتان رو مشاهده می کنید",
    icon: "User",
  },
  {
    name: "دریافت فکتورها",
    description: "تمام فاکتورهایتان را دریافت کنید",
    icon: "FileText",
  },
  {
    name: "تجزیه و تحلبل جامع",
    description: "بررسی و پیشنهادات برای دیدی بهتر از فروشگاه",
    icon: "LineChart",
  },
  {
    name: "نمودار درآمدی",
    description: "نموداری از فروش هاینان داشته باش",
    icon: "ChartColumnBig",
  },
];
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
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  user: User;
}) {
  const { mutate } = useSWRConfig();
  const [input, setInput] = useState<string>("");
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    sendMessage,

    status,
    stop,
    regenerate,
  } = useChat({
    id,
    messages: initialMessages,
    experimental_throttle: 100,

    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    // onData: (dataPart) => {
    //   setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    // },
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
  useEffect(() => {
    console.log("messagemessagemessage", messages.at(-1));
  }, [messages]);
  const onQuerySelect = (query: string) => {
    if (!messages.length) {
      window.history.replaceState({}, "", `/chat/${id}`);
    }
    sendMessage({
      role: "user",

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

  useEffect(() => {
    function onProductsSelected(e: any) {
      const ids: string[] = e?.detail?.ids ?? [];
      if (!ids.length) return;
      setInput((prev) => `${prev}\n\nمحصولات: ${ids.join(",")}`);
    }
    function onCustomersSelected(e: any) {
      const ids: string[] = e?.detail?.ids ?? [];
      if (!ids.length) return;
      setInput((prev) => `${prev}\n\nمشتری‌ها: ${ids.join(",")}`);
    }
    function onInvoicesSelected(e: any) {
      const ids: string[] = e?.detail?.ids ?? [];
      if (!ids.length) return;
      setInput((prev) => `${prev}\n\nفاکتورها: ${ids.join(",")}`);
    }
    window.addEventListener(
      "diginext:products:selected",
      onProductsSelected as any
    );
    window.addEventListener(
      "diginext:customers:selected",
      onCustomersSelected as any
    );
    window.addEventListener(
      "diginext:invoices:selected",
      onInvoicesSelected as any
    );
    return () => {
      window.removeEventListener(
        "diginext:products:selected",
        onProductsSelected as any
      );
      window.removeEventListener(
        "diginext:customers:selected",
        onCustomersSelected as any
      );
      window.removeEventListener(
        "diginext:invoices:selected",
        onInvoicesSelected as any
      );
    };
  }, [setInput]);

  return (
    <>
      <div dir="rtl" className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader user={user} setOpenShortcutDialog={setOpenShortcutDialog} />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          onQuerySelect={onQuerySelect}
          setInput={setInput}
          isReadonly={isReadonly}
          setAttachments={setAttachments}
        />
        {messages.length && (
          <div className="flex gap-1 w-full absolute bottom-32 mx-auto left-0 right-0 max-w-[650px] overflow-x-auto">
            {defaultSuggestions.map((item, index) => {
              const iconName = item.icon ?? "CircleHelp";
              const IconComponent =
                ((
                  LucideIcons as unknown as Record<
                    string,
                    React.ComponentType<any>
                  >
                )[iconName] as React.ComponentType<any> | undefined) ??
                (LucideIcons as any).CircleHelp;

              return (
                <Button
                  className="flex gap-1 items-center"
                  onClick={() => onQuerySelect(item.name)}
                >
                  <IconComponent className="size-4" />

                  <p>{item.name}</p>
                </Button>
              );
            })}
          </div>
        )}
        {!isReadonly ? (
          <MultimodalInput
            input={input}
            chatId={id}
            setInput={setInput}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            sendMessage={sendMessage}
            setMessages={setMessages}
          />
        ) : (
          <Button
            onClick={async () => {
              setIsForkLoading(true);
              const createdAtStr = (messages.at(-1)?.metadata as any)
                ?.createdAt as string | undefined;
              await forkAction({
                chatId: id,
                createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
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
