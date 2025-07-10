import type { Attachment } from "ai";

import { LoaderIcon } from "./icons";
import MobileImage from "./MobileImage";
import { cn } from "@/lib/utils";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  isInChat = true,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  isInChat?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  console.log("attachmentattachment", attachment);
  const isPdf = contentType === "application/pdf";
  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="   relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith("image") ? (
            isInChat ? (
              <div className="size-40 relative">
                <MobileImage
                  layoutId={url}
                  className="size-40 overflow-hidden rounded-md"
                  alt={name ?? "An image attachment"}
                  src={url}
                  key={url}
                />
              </div>
            ) : (
              <img
                src={url}
                alt={name}
                className="size-10 rounded-xl object-cover"
              />
            )
          ) : isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                " hover:bg-muted-foreground rounded-md size-10 flex justify-center items-center text-center",
                isInChat && "size-40"
              )}
            >
              📄
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:bg-muted-foreground rounded-md size-10 flex justify-center items-center text-center"
            >
              📎
            </a>
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div
        className={cn(
          "text-xs text-zinc-500 h-3 truncate w-10",
          isInChat && "w-40"
        )}
      >
        {name}
      </div>
    </div>
  );
};
