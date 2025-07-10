import { after } from "next/server";
import { openai } from "@ai-sdk/openai";
import { type FilePart, experimental_generateImage as generateImage } from "ai";
import { z } from "zod";
import { tool } from "ai";

import { decreaseToken } from "@/lib/actions/user";
import { uploadFileToS3 } from "@/app/_actions/clientFileUploader";
import { uploadFilesToDB } from "@/lib/actions/file";

export const generateImageTool = (id: string) =>
  tool({
    description: "Generate an image based on the prompt.",
    inputSchema: z.object({
      description: z
        .string()
        .describe("make a prompt for the image user want to generate"),
    }),
    execute: async (
      { description }: { description: string },
      { toolCallId }: { toolCallId: string }
    ) => {
      const { image } = await generateImage({
        model: openai.image("dall-e-3"),
        n: 1,
        prompt: description,
      });
      after(() => {
        decreaseToken(30000);
      });

      // Convert base64 to File object
      const base64Data = image.base64;
      const binaryData = Buffer.from(base64Data, "base64");
      const file = new File([binaryData], `generated_${Date.now()}.png`, {
        type: "image/png",
      });

      // Upload to S3
      const result = await uploadFileToS3({
        file,
        maxFilesSize: 10 * 1024 * 1024, // 10MB
        maxFileSize: 5 * 1024 * 1024, // 5MB
        acceptFileTypes: {
          types: ["image/png", "image/jpeg", "image/jpg"],
          errorMessage: "Only image files are allowed",
        },
      });
      console.log("firstfirstfirstfirst444", result.fileManagerType.key);

      await uploadFilesToDB({
        files: [
          {
            name: result.fileManagerType.name,
            size: result.fileManagerType.size,
            key: result.fileManagerType.key,
            type: result.fileManagerType.type,
          },
        ],
        folder: "/",
        chatId: id,
        toolCallId,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      return {
        url: result.websiteType.url,
      };
    },
  });
