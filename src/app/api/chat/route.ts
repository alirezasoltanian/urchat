import { VisibilityType } from "@/components/visibility-selector";
import { generateTitleFromUserMessage } from "@/lib/actions/chat";
import { decreaseToken, getChatToken } from "@/lib/actions/user";
import { ChatModel, DEFAULT_MODEL } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import { generateImageTool } from "@/lib/ai/tools/generate-image-tool";
import { searchTool } from "@/lib/ai/tools/search-tool";
import { auth } from "@/lib/auth";
import { ChatSDKError } from "@/lib/errors";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/queries/chat";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import {
  postRequestBodySchema,
  type PostRequestBody,
} from "@/lib/validations/chat";
import { ChatMessage } from "@/types";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
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

    console.dir({ aaa: "adasdasf", json: json }, { depth: null });
    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.log("first4566", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }
  console.log("firs1111t", requestBody);

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

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

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const messages = convertToModelMessages(uiMessages);

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
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

    // const model = createOpenAICompatible({
    //   name: "openrouter",
    //   apiKey: process.env.OPENROUTER_API_KEY,
    //   baseURL: "https://openrouter.ai/api/v1",
    // }).chatModel(openrouterFormat);
    const model = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    }).chat(openrouterFormat);
    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          // model: openai("gpt-4-turbo"),
          model,
          system,
          messages,
          stopWhen: searchMode ? stepCountIs(5) : stepCountIs(1),
          onFinish: async ({ usage }) => {
            const { totalTokens } = usage;
            after(() => {
              totalTokens && decreaseToken(totalTokens);
            });
            after(() => {
              totalTokens && decreaseToken(totalTokens);
            });
          },
          experimental_activeTools: searchMode
            ? ["search", "generateImage"]
            : ["generateImage"],

          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            search: searchTool,
            generateImage: generateImageTool(id),
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
        // console.log("firstfirstfirst10101222", result);
      },

      onFinish: async ({ messages }) => {
        if (session.user?.id) {
          try {
            await saveMessages({
              messages: messages.map((message) => ({
                id: message.id,
                role: message.role,
                parts: message.parts,
                attachments: [],
                chatId: id,
              })),
            });
          } catch (_) {
            console.error("Failed to save chat");
          }
        }
      },
      generateId: generateUUID,

      onError: (error) => {
        console.log("firstfirstfirstfirst555", error);

        return "Oops, an error occurred!";
      },
    });

    // const streamContext = getStreamContext();
    // console.log("firstfirstfirst10101", stream);

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));

    // if (streamContext) {
    //   return new Response(
    //     await streamContext.resumableStream(streamId, () => stream)
    //   );
    // } else {
    //   return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    // }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      console.log("firstfirst", error);

      return error.toResponse();
    }
  }
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
