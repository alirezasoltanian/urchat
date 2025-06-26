"use server";
import { UploadedFile } from "@/types";
import { currentUser } from "./user";
import { files } from "@/db/schema";
import { db } from "@/db";

export async function uploadFilesToDB({
  files,
  folder,
  chatId,
  toolCallId,
}: {
  files: UploadedFile[];
  folder?: string;
  chatId: string;
  toolCallId?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) return;
    const userId = user.id;
    await insertFileRecords({
      userId,
      filesData: files,
      folder,
      chatId,
      toolCallId,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return { success: true };
  } catch (error) {
    console.error("Error uploading files:", error);
    return { success: false };
  }
}
export async function insertFileRecords({
  userId,
  filesData,
  folder,
  chatId,
  toolCallId,
}: {
  userId: string;
  filesData: Array<{
    name: string;
    size: number;
    key: string;
    type: string;
  }>;
  folder?: string;
  chatId: string;
  toolCallId?: string;
}) {
  const now = new Date();
  console.log("datadata");
  const newFilesData = filesData.map((fileData, index) => ({
    userId,
    filename: fileData.name,
    mimeType: fileData.type,
    folder: folder ?? "",
    size: fileData.size,
    s3Key: fileData.key,
    chatId,
    toolId: toolCallId,
  }));
  const newFiles = await db.insert(files).values(newFilesData).returning();
  console.log("datadata", newFiles);

  return newFiles;
}
