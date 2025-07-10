import { CaseLower, Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/id";
import { Dispatch, SetStateAction } from "react";
import { Attachment } from "@/types";

function ImageMessageAction({
  url,
  description,

  setInput,
  setAttachments,
}: {
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  url: string;
  description?: string;
  setInput: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex flex-col gap-2">
      {description && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setInput(description);
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
