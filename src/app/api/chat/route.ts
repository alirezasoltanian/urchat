import type { Chat } from "@/db/schema";
import { generateTitleFromUserMessage } from "@/lib/actions/chat";
import { decreaseToken, getChatToken } from "@/lib/actions/user";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import { generateImageTool } from "@/lib/ai/tools/generate-image-tool";
import { searchTool } from "@/lib/ai/tools/search-tool";
import { auth } from "@/lib/auth";
import { ChatSDKError } from "@/lib/errors";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
} from "@/lib/queries/chat";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import {
  postRequestBodySchema,
  type PostRequestBody,
} from "@/lib/validations/chat";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { cookies } from "next/headers";
import { after } from "next/server";
// import {
//   createResumableStreamContext,
//   type ResumableStreamContext,
// } from "resumable-stream";

export const maxDuration = 60;

// let globalStreamContext: ResumableStreamContext | null = null;

// function getStreamContext() {
//   if (!globalStreamContext) {
//     try {
//       globalStreamContext = createResumableStreamContext({
//         waitUntil: after,
//       });
//     } catch (error: any) {
//       if (error.message.includes("REDIS_URL")) {
//         console.log(
//           " > Resumable streams are disabled due to missing REDIS_URL"
//         );
//       } else {
//         console.error("errorerrorerrorerror", error);
//       }
//     }
//   }

//   return globalStreamContext;
// }

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;

    console.log("222222", message, selectedChatModel, selectedVisibilityType);
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    console.log("3333", session?.user);

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }
    const userChatToken = await getChatToken();
    if (!userChatToken || userChatToken <= 1000) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });
    console.log("3333", chat);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });
      console.log("4444", title);

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    }

    const previousMessages = await getMessagesByChatId({ id });
    console.log("6666", previousMessages);

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
        },
      ],
    });
    console.log("4444", selectedChatModel, selectedVisibilityType);

    const cookieStore = await cookies();
    const modelJson = cookieStore.get("selected-model")?.value;
    const searchMode = cookieStore.get("search-mode")?.value === "true";
    let selectedModel = DEFAULT_MODEL;

    if (modelJson) {
      try {
        selectedModel = modelJson;
      } catch (e) {
        console.error("Failed to parse selected model:", e);
      }
    }

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const system = systemPrompt();

    const openrouterFormat = selectedModel.replace(":", "/");

    const model = createOpenAICompatible({
      name: "openrouter",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    }).chatModel(openrouterFormat);
    // const model = createOpenRouter({
    //   apiKey: process.env.OPENROUTER_API_KEY,
    // }).chat(openrouterFormat);
    const stream = createDataStream({
      execute: (dataStream) => {
        const result = streamText({
          model,
          system,
          messages,
          stopWhen: searchMode ? stepCountIs(5) : stepCountIs(1),
          experimental_activeTools: searchMode
            ? ["search", "generateImage"]
            : ["generateImage"],

          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: {
            search: searchTool,
            generateImage: generateImageTool(id),
          },
          onFinish: async ({ response, usage }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === "assistant"
                  ),
                });

                if (!assistantId) {
                  throw new Error("No assistant message found!");
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });
                console.log("hellohello111", assistantMessage);

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                    },
                  ],
                });
                const { totalTokens } = usage;
                after(() => {
                  totalTokens && decreaseToken(totalTokens);
                });
                after(() => {
                  totalTokens && decreaseToken(totalTokens);
                });

                dataStream.writeData({
                  type: "append-message",
                  message: JSON.stringify(assistantMessage),
                });
                console.log("hellohello222", assistantMessage);
              } catch (_) {
                console.error("Failed to save chat");
              }
            }
          },
        });

        // result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
        // console.log("firstfirstfirst10101222", result);
      },
      onError: (error) => {
        console.log("firstfirstfirstfirst555", error);

        return "Oops, an error occurred!";
      },
    });

    // const streamContext = getStreamContext();
    // console.log("firstfirstfirst10101", stream);
    return new Response(stream);

    // if (streamContext) {
    //   return new Response(
    //     await streamContext.resumableStream(streamId, () => stream)
    //   );
    // } else {
    //   return new Response(stream);
    // }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      console.log("firstfirst", error);

      return error.toResponse();
    }
  }
}

export async function GET(request: Request) {
  // const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  // if (!streamContext) {
  //   return new Response(null, { status: 204 });
  // }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new ChatSDKError("not_found:stream").toResponse();
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  // const stream = await streamContext.resumableStream(
  //   recentStreamId,
  //   () => emptyDataStream
  // );

  /*
   * For when the generation is streaming during SSR
   * but the resumable stream has concluded at this point.
   */
  // if (!stream) {
  //   const messages = await getMessagesByChatId({ id: chatId });
  //   const mostRecentMessage = messages.at(-1);

  //   if (!mostRecentMessage) {
  //     return new Response(emptyDataStream, { status: 200 });
  //   }

  //   if (mostRecentMessage.role !== "assistant") {
  //     return new Response(emptyDataStream, { status: 200 });
  //   }

  //   const messageCreatedAt = new Date(mostRecentMessage.createdAt);

  //   if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
  //     return new Response(emptyDataStream, { status: 200 });
  //   }

  //   const restoredStream = createDataStream({
  //     execute: (buffer) => {
  //       buffer.writeData({
  //         type: "append-message",
  //         message: JSON.stringify(mostRecentMessage),
  //       });
  //     },
  //   });

  //   return new Response(restoredStream, { status: 200 });
  // }

  // return new Response(stream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
