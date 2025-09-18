"use client";

import {
  attachmentDefaultUploadFile,
  imageDefaultUploadFile,
} from "@/constants";

import { uploadFilesToS3 } from "@/app/_actions/clientFileUploader";
import type { UseChatHelpers } from "@ai-sdk/react";
import { ArrowUp, Check, Mic, Paperclip, Square, X } from "lucide-react";
import { motion } from "motion/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";

import { cn, getContentType } from "@/lib/utils";

import { GlowEffect } from "./core/glow-effect";
import { Tooltip } from "./reuseable/re-tooltip";

import { Button } from "./ui/button";
import Spinner from "./ui/spinner";

import { transcribeAudio } from "@/app/_actions/transcribe";
import ModelCombobox from "./model-selector";
import { SearchModeToggle } from "./search-mode-toggle";
import { VoiceVisualizer } from "./voice-visualizer";
import { useHotkeys } from "react-hotkeys-hook";
import { PreviewAttachment } from "./preview-attachment";
import { id } from "zod/v4/locales";
import { Attachment, ChatMessage } from "@/types";

function isFileInArray(file: File, existingFiles: File[]) {
  return existingFiles.some(
    (existing) =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.type === file.type
  );
}
interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  placeholder?: string;
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  attachments: Attachment[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
}

export function MultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  placeholder,
  attachments,
  setAttachments,
  setMessages,
  sendMessage,
}: MultimodalInputProps) {
  const textareaRef = useRef(true);
  const [isComposing, setIsComposing] = useState(false);
  const [enterDisabled, setEnterDisabled] = useState(false);
  const [files, setFiles] = useState<FileList[] | undefined>([]);
  const recordTimeLimit = 60; // second
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => {
    setIsComposing(false);
    setEnterDisabled(true);
    setTimeout(() => {
      setEnterDisabled(false);
    }, 300);
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;

    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter((file) =>
        attachmentDefaultUploadFile.acceptFileTypes.types.includes(file.type)
      );

      if (validFiles.length === selectedFiles.length) {
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => {
          dataTransfer.items.add(file);
        });
        setFiles([dataTransfer.files]);
        const fileDataImages = new FormData();
        if (validFiles && validFiles.length) {
          [...validFiles].forEach((image) => {
            fileDataImages.append("file", image);
          });
        }

        const resUploadImages = await uploadFilesToS3({
          ...attachmentDefaultUploadFile,
          data: fileDataImages,
          folder: "/attachments",
          chatId,
          uploadToDB: true,
        });

        const images = resUploadImages.data;
        if (!images) {
          toast.error("Something Is Wrong");
        }
        if (images?.length) {
          const imageData = images.map((item) => {
            return {
              ...item,
              contentType: getContentType(item.url),
              from: "uploaded-file",
            };
          });
          setAttachments([...attachments, ...imageData]);
        }
        setFiles([]);
      } else {
        setFiles([]);
        toast.error("Only image and text files are allowed");
      }
    }
  };

  function handleFileRemove(url: string) {
    setAttachments(attachments.filter((item) => item.url !== url));
  }
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);

    for (const item of items) {
      console.log("itemitemitemitem", item);
      // Check if it's actually an image
      if (
        item.kind === "file" &&
        attachmentDefaultUploadFile.acceptFileTypes.types.includes(item.type)
      ) {
        e.preventDefault();

        const file = item.getAsFile();
        if (file) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const syntheticEvent = {
            target: {
              files: dataTransfer.files,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          console.log("syntheticEventsyntheticEvent", syntheticEvent);
          handleFileChange(syntheticEvent);
        }
      }
    }
  }

  const [dragActive, setDragActive] = useState(false);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      attachmentDefaultUploadFile.acceptFileTypes.types.includes(file.type)
    );

    if (droppedFiles.length > 0) {
      setFiles((prev) => {
        const uniqueFiles = droppedFiles.filter(
          (file) => !isFileInArray(file, prev)
        );
        return [...prev, ...uniqueFiles];
      });
    }
  }

  const filePreview = useMemo(() => {
    if (!files || files.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 p-2">
        {Array.from(files[0]).map((file) => {
          return (
            <div className="relative size-fit" key={file.name}>
              {/* <div className="absolute text-red-500 inset-0 m-auto size-5">
                <Spinner />
              </div> */}
              <PreviewAttachment
                attachment={{
                  name: file.name,
                  url: URL.createObjectURL(file),
                  contentType: file.type,
                }}
                isUploading={true}
                isInChat={false}
              />
              {/* <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="size-10 rounded-xl object-cover"
              /> */}
            </div>
          );
        })}
      </div>
    );
  }, [files]);
  function onEnter(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (e.currentTarget.checkValidity()) {
        // handleSubmit(e)
      } else {
        e.currentTarget.reportValidity();
      }
    }
  }

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  useHotkeys("ctrl+shift+l", () => {
    textareaRef.current.focus();
  });
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && !isProcessing) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= recordTimeLimit) {
            stopRecording();
            return 60;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isRecording, isProcessing]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        setAudioChunks(chunks);
      };

      // Start recording with a timeslice to ensure we get data
      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioChunks([]); // Clear any previous chunks
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleConfirmRecording = async () => {
    if (!isRecording || !mediaRecorder) {
      toast.error("No active recording to confirm");
      return;
    }

    // First stop the recording
    stopRecording();

    // Wait a moment for the last chunks to be processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (audioChunks.length === 0) {
      toast.error("No audio recorded");
      return;
    }

    // Use the actual recording time instead of calculating from chunks
    const totalDuration = recordingTime;

    console.log("totalDuration", totalDuration);
    if (totalDuration > recordTimeLimit) {
      toast.error("حداکثر زمان ضبط صدا یک دقیقه است");
      handleCancelRecording();
      return;
    }

    setIsProcessing(true);
    try {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      const transcribedText = await transcribeAudio(audioFile);

      if (transcribedText) {
        setInput(transcribedText);
      } else {
        toast.error("Failed to transcribe audio");
      }

      setAudioChunks([]);
    } catch (error) {
      console.error("Error in handleConfirmRecording:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process recording"
      );
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    setAudioChunks([]);
    setIsRecording(false);
  };
  console.log(
    "firstfirstfirst123",
    input.length === 0,
    status !== "submitted",
    files
  );
  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);
    console.log("firstfirstfirst192", {
      role: "user",
      parts: [
        ...attachments.map((attachment) => ({
          type: "file" as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: "text",
          text: input,
        },
      ],
    });

    sendMessage({
      role: "user",
      parts: [
        ...attachments.map((attachment) => ({
          type: "file" as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: "text",
          text: input,
        },
      ],
    });
    setAttachments([]);
    setInput("");
  }, [input, setInput, attachments, sendMessage, setAttachments, chatId]);
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };
  return (
    // <div
    //   className={cn(
    //     "bg-background container w-full px-0 absolute bottom-0 left-0 right-0 mx-auto"
    //   )}
    // >
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (status !== "submitted") {
          submitForm();
        }
      }}
      onKeyDown={onEnter}
      className=" mx-auto mt-auto absolute bottom-0 left-0 right-0 duration-500   flex w-full max-w-[650px] flex-col px-0 pt-2 "
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="relative">
        {(status === "submitted" || status === "streaming") && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-0"
            animate={{
              opacity: status === "submitted" || status === "streaming" ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <GlowEffect
              colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
              mode="colorShift"
              blur="medium"
              duration={4}
            />
          </motion.div>
        )}
        <div
          className={`bg-background/90 relative z-10 rounded-t-2xl border p-1 shadow-md ${
            dragActive
              ? "before:border-primary before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-dashed"
              : ""
          }`}
        >
          {files && files.length > 0 && filePreview}
          <div className="flex flex-wrap gap-2 p-2">
            {attachments?.map((item) => (
              <div className="relative size-fit" key={item.url}>
                <span
                  onClick={() => handleFileRemove(item.url)}
                  className="bg-muted absolute top-[-8] right-[-8] rounded-full p-1"
                >
                  <X className="h-3 w-3 cursor-pointer" />
                </span>
                <PreviewAttachment isInChat={false} attachment={item} />
              </div>
            ))}
          </div>
          {/* <div className="flex items-center gap-1 px-3 py-2">{children}</div> */}
          {!isRecording ? (
            <Textarea
              ref={textareaRef}
              autoFocus={true}
              minRows={1}
              maxRows={3}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="text-normal  bg-transparent m-0 mt-2 w-full resize-none  px-3 ring-0 outline-none"
              placeholder={placeholder ?? "دستورتان را وارد کنید"}
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !isComposing &&
                  !enterDisabled
                ) {
                  if (input.trim().length === 0) {
                    e.preventDefault();
                    return;
                  }
                  e.preventDefault();
                  const textarea = e.target as HTMLTextAreaElement;
                  textarea.form?.requestSubmit();
                }
              }}
              onPaste={handlePaste}
            />
          ) : (
            <div className="flex items-center justify-center">
              <div
                className={cn(
                  recordingTime === recordTimeLimit
                    ? "text-destructive"
                    : "text-muted-foreground",
                  "flex w-[52px] items-center me-1 gap-1 justify-between text-sm"
                )}
              >
                <span>
                  {Math.floor(recordTimeLimit / 60)}:
                  {(recordTimeLimit % 60).toString().padStart(2, "0")}
                </span>
                <span>/</span>
                <span>
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <VoiceVisualizer
                mediaRecorder={mediaRecorder}
                isRecording={isRecording}
              />
            </div>
          )}

          <div
            dir="ltr"
            className="flex items-center justify-between gap-2 p-3"
          >
            <input
              type="file"
              id="multimodal"
              name="multimodal"
              accept={attachmentDefaultUploadFile.acceptFileTypes.types.join(
                ","
              )}
              multiple={true}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              {/* <Tooltip content="Add File">
                <Button
                  // disabled={isErrored}
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("multimodal")?.click();
                  }}
                >
                  <Paperclip className="size-5" />
                </Button>
              </Tooltip> */}
              {/* <ModelCombobox />
              <SearchModeToggle /> */}
            </div>
            {!isRecording ? (
              <div className="flex  items-center gap-2">
                {/* <Tooltip content="Dictate">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 rounded-xl"
                      onClick={startRecording}
                      disabled={isProcessing}
                    >
                      <Mic className="size-5" />
                    </Button>
                  </Tooltip> */}
                <Button
                  type={status === "submitted" ? "button" : "submit"}
                  size={"icon"}
                  variant={status === "submitted" ? "ghost" : "default"}
                  className={cn(
                    "transform",
                    status === "submitted" && "animate-pulse"
                  )}
                  disabled={
                    (input.length === 0 &&
                      status !== "submitted" &&
                      !attachments?.length) ||
                    !!files?.length
                  }
                  onClick={status === "submitted" ? stop : undefined}
                >
                  {status === "submitted" ? (
                    <Square size={16} />
                  ) : (
                    <ArrowUp size={16} />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-xl"
                  onClick={handleConfirmRecording}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Spinner /> : <Check className="size-5" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelRecording();
                  }}
                  disabled={isProcessing}
                >
                  <X className="size-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
    // </div>
  );
}
