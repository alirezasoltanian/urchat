import { Image } from "lucide-react";
import { motion } from "motion/react";
import { BorderTrail } from "../core/border-trail";
import MobileImage from "../MobileImage";
import ImageMessageAction from "./image-message-action";
import { Dispatch, SetStateAction } from "react";
import { Attachment, ChatTools } from "@/types";
import { UIMessage } from "ai";

function GenerateImage({
  setAttachments,
  tool,
  setInput,
}: {
  tool: ChatTools["generateImage"];
  setInput: Dispatch<SetStateAction<string>>;
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}) {
  const urlOfImage = tool.output.url;
  if (!urlOfImage) {
    return <div>No image found</div>;
  }
  const description = tool.input.description as string | undefined;
  console.log("tooltool", tool.input.description);

  return (
    <div className="flex gap-2">
      <MobileImage
        layoutId={urlOfImage}
        className="size-52 overflow-hidden rounded-md"
        alt="image chat"
        src={urlOfImage}
      />
      <ImageMessageAction
        setAttachments={setAttachments}
        url={urlOfImage}
        description={description}
        setInput={setInput}
      />
    </div>
  );
}

export default GenerateImage;
