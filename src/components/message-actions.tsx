import { memo, useRef, useState } from "react";
import { Vote } from "@/db/schema/chat";
import { openai } from "@ai-sdk/openai";
import equal from "fast-deep-equal";
import {
  AudioLinesIcon,
  CircleStopIcon,
  ForkKnife,
  GitFork,
  PauseIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { forkAction, readMessage } from "@/lib/queries/chat";
import { cn } from "@/lib/utils";

import CopyButton from "@/components/CopyButton";
import { Tooltip } from "@/components/reuseable/re-tooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

export function PureMessageActions({
  chatId,
  messageId,
  text,
  vote,
  isLoading,
  createdAt,
}: {
  chatId: string;
  messageId: string;
  text: string;
  vote: Vote | undefined;
  isLoading: boolean;
  createdAt: Date;
}) {
  const [isReading, setIsReading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isForkLoading, setIsForkLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { mutate } = useSWRConfig();

  if (isLoading) return null;

  const handleReading = async () => {
    try {
      console.log("firstfirst");

      setIsAudioLoading(true);
      const truncatedText =
        text.length > 100 ? text.slice(0, 100) + "..." : text;
      const audio = await readMessage(truncatedText);
      setIsAudioLoading(false);
      setIsReading(true);

      if (!audio) {
        throw new Error("تولید صدا ناموفق بود");
      }
      if (audio.error) {
        toast.error(audio.error);
        return;
      }

      // Create blob directly from the audio data
      const audioBlob = new Blob([audio.audioData], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audioElement = new Audio(audioUrl);
        audioRef.current = audioElement;
        audioElement.play();
      }

      audioRef.current.onended = () => {
        setIsReading(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      toast.error("تولید گفتار ناموفق بود");
      setIsAudioLoading(false);
      setIsReading(false);
    }
  };

  const stopReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsReading(false);
    }
  };

  return (
    <div className="flex flex-row gap-2 p-1">
      {text && (
        <Tooltip content="کپی">
          <CopyButton
            className={cn(buttonVariants({ variant: "ghost", size: "iconsm" }))}
            text={text as string}
          />
        </Tooltip>
      )}
      {text && (
        <Tooltip content="خواندن با صدا">
          <Button
            onClick={() => {
              if (isReading) {
                stopReading();
              } else if (!isAudioLoading) {
                handleReading();
              }
            }}
            disabled={isAudioLoading}
            variant="ghost"
            size="iconsm"
          >
            {isReading ? (
              <CircleStopIcon className="size-3" />
            ) : isAudioLoading ? (
              <Spinner />
            ) : (
              <AudioLinesIcon className="size-3" />
            )}
          </Button>
        </Tooltip>
      )}
      <Tooltip content="انشعاب">
        <Button
          onClick={async () => {
            setIsForkLoading(true);
            await forkAction({ chatId, createdAt });
            setIsForkLoading(false);
          }}
          disabled={isForkLoading}
          variant="ghost"
          size="iconsm"
        >
          {isForkLoading ? <Spinner /> : <GitFork className="size-3" />}
        </Button>
      </Tooltip>

      <Tooltip content="بازخورد مثبت">
        <Button
          data-testid="message-upvote"
          className="text-muted-foreground pointer-events-auto!"
          size="iconsm"
          disabled={vote?.isUpvoted}
          variant="ghost"
          onClick={async () => {
            const upvote = fetch("/api/vote", {
              method: "PATCH",
              body: JSON.stringify({
                chatId,
                messageId: messageId,
                type: "up",
              }),
            });

            toast.promise(upvote, {
              loading: "در حال ثبت بازخورد مثبت...",
              success: () => {
                mutate<Array<Vote>>(
                  `/api/vote?chatId=${chatId}`,
                  (currentVotes) => {
                    if (!currentVotes) return [];

                    const votesWithoutCurrent = currentVotes.filter(
                      (vote) => vote.messageId !== messageId
                    );

                    return [
                      ...votesWithoutCurrent,
                      {
                        chatId,
                        messageId: messageId,
                        isUpvoted: true,
                      },
                    ];
                  },
                  { revalidate: false }
                );

                return "ثبت شد";
              },
              error: "ثبت رأی مثبت ناموفق بود.",
            });
          }}
        >
          <ThumbsUpIcon
            className={cn(
              vote && vote.isUpvoted && "fill-foreground",
              "size-3"
            )}
          />
        </Button>
      </Tooltip>

      <Tooltip content="بازخورد منفی">
        <Button
          data-testid="message-downvote"
          className="text-muted-foreground pointer-events-auto!"
          variant="ghost"
          size="iconsm"
          disabled={vote && !vote.isUpvoted}
          onClick={async () => {
            const downvote = fetch("/api/vote", {
              method: "PATCH",
              body: JSON.stringify({
                chatId,
                messageId: messageId,
                type: "down",
              }),
            });

            toast.promise(downvote, {
              loading: "در حال ثبت بازخورد منفی...",
              success: () => {
                mutate<Array<Vote>>(
                  `/api/vote?chatId=${chatId}`,
                  (currentVotes) => {
                    if (!currentVotes) return [];

                    const votesWithoutCurrent = currentVotes.filter(
                      (vote) => vote.messageId !== messageId
                    );

                    return [
                      ...votesWithoutCurrent,
                      {
                        chatId,
                        messageId: messageId,
                        isUpvoted: false,
                      },
                    ];
                  },
                  { revalidate: false }
                );

                return "ثبت شد.";
              },
              error: "ثبت رأی منفی ناموفق بود.",
            });
          }}
        >
          <ThumbsDownIcon
            className={cn(
              vote && !vote.isUpvoted && "fill-foreground",
              "size-3"
            )}
          />
        </Button>
      </Tooltip>
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  }
);
