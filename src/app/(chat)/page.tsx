import { cookies, headers } from "next/headers";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
// import { DataStreamHandler } from "@/components/data-stream-handler";
import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }
  if (!modelIdFromCookie) {
    return (
      <>
        <Suspense>
          <Chat
            user={session.user}
            key={id}
            id={id}
            initialMessages={[]}
            initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
            initialVisibilityType="private"
            isReadonly={false}
            autoResume={false}
          />
        </Suspense>
      </>
    );
  }
}
