"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateChatVisiblityById } from "@/lib/queries/chat";

import CopyButton from "./CopyButton";
import { Button } from "./ui/button";
import Spinner from "./ui/spinner";

interface ChatShareProps {
  chatId: string;
  className?: string;
  setExternalOpen?: (open: boolean) => void;
  externalOpen?: boolean;
  visibility: "private" | "public";
}

export function ChatShare({
  chatId,
  className,
  visibility,
  externalOpen,
  setExternalOpen,
}: ChatShareProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;
  const [pending, startTransition] = useTransition();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  const [shareUrl, setShareUrl] = useState(
    visibility === "public" ? `${baseUrl}/chat/${chatId}` : ""
  );

  const handleShare = async () => {
    startTransition(() => {
      setOpen(true);
    });
    const result = await updateChatVisiblityById({
      chatId,
      visibility: "public",
    });
    console.log("resultresultresult", result);

    if (!result) {
      toast.error("Failed to share chat");
      return;
    }
    const shareLink = `${baseUrl}/chat/${chatId}`;

    setShareUrl(shareLink);
  };

  return (
    <div className={className}>
      <Dialog
        open={open}
        onOpenChange={(open) => setOpen(open)}
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
      >
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Share Link</DialogTitle>
            <DialogDescription>
              Anyone with this link will be able to view this search result.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid w-full items-center">
            <div
              dir="ltr"
              className="relative flex w-fit max-w-full items-center overflow-hidden rounded-full border-2 p-2"
            >
              {shareUrl && (
                <p className="truncate text-left break-words">{shareUrl}</p>
              )}
              {shareUrl || visibility === "public" ? (
                <CopyButton className="p-1" text={shareUrl} />
              ) : (
                <Button
                  className="w-[126px] rounded-full"
                  onClick={handleShare}
                  disabled={pending}
                  size="sm"
                >
                  {pending ? <Spinner /> : "Create link"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
