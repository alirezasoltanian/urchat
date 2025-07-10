import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { Chat } from "@/components/chat";
import { DBMessage } from "@/db/schema";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/queries/chat";
import type { Attachment, UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page(props: {
  params: Promise<{ chatId: string }>;
}) {
  const params = await props.params;
  const { chatId } = params;
  const chat = await getChatById({ id: chatId });

  if (!chat) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }
  if (chat.visibility === "private") {
    if (!session.user || session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id: chatId,
  });

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          user={session.user}
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          autoResume={true}
        />
      </>
    );
  }
}
