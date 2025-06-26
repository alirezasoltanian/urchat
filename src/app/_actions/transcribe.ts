"use server";

import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as transcribe } from "ai";

export async function transcribeAudio(audioFile: File) {
  try {
    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error("Invalid audio file");
    }
    if (!audioFile.type.startsWith("audio/")) {
      throw new Error("File must be an audio file");
    }
    const maxSizeForOneMinute = 960 * 1024;
    if (audioFile.size > maxSizeForOneMinute) {
      throw new Error("Audio file must be less than 1 minute");
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const transcript = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: base64String,
    });

    return transcript.text;
  } catch (error) {
    console.error("Transcription error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to transcribe audio");
  }
}
