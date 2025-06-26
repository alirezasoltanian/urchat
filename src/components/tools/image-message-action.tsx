import { Attachment, FilePart } from "ai";
import { CaseLower, Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setCookie } from "@/lib/cookies";
import { createModelId } from "@/lib/utils";
import { generateId } from "@/lib/id";
import { Dispatch, SetStateAction } from "react";

function ImageMessageAction({
  url,
  description,

  handleInputChange,
  setAttachments,
}: {
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  url: string;
  description?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {description && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const syntheticEvent = {
              target: {
                value: description,
              },
            } as React.ChangeEvent<HTMLTextAreaElement>;

            handleInputChange?.(syntheticEvent);
          }}
        >
          <CaseLower className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setAttachments((prev) => [
            ...prev,
            {
              id: generateId(),
              name: "image.png",
              url: url,
              contentType: "image/png",
            },
          ]);
        }}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const a = document.createElement("a");
          a.href = url;
          a.download = "image.png";
          a.click();
        }}
      >
        <Download className="size-4" />
      </Button>
    </div>
  );
}

export default ImageMessageAction;
