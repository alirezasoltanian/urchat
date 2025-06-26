import { Attachment, ToolInvocation } from "ai";

import { Image } from "lucide-react";
import { motion } from "motion/react";
import { BorderTrail } from "../core/border-trail";
import MobileImage from "../MobileImage";
import ImageMessageAction from "./image-message-action";
import { Dispatch, SetStateAction } from "react";

function GenerateImage({
  setAttachments,
  tool,
  handleInputChange,
}: {
  tool: ToolInvocation;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
}) {
  switch (tool.state) {
    case "call":
      return (
        <div className="relative size-52 flex-col items-center justify-center rounded-md bg-zinc-200 px-5 py-2 dark:bg-zinc-800">
          <BorderTrail
            style={{
              boxShadow:
                "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
            }}
            size={100}
          />
          <div
            className="flex h-full animate-pulse flex-col items-center justify-center space-y-2"
            role="status"
            aria-label="Loading..."
          >
            <motion.div
              animate={{
                color: ["#0894FF", "#C959DD", "#FF2E54", "#FF9004", "#0894FF"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Image size={64} />
            </motion.div>
          </div>
        </div>
      );
  }
  const dataResults: { url: string } =
    tool.state === "result" ? tool.result : undefined;

  if (!dataResults) {
    return <div>No image found</div>;
  }
  const description = tool.args.description as string | undefined;
  console.log("tooltool", tool.args.description);

  return (
    <div className="flex gap-2">
      <MobileImage
        layoutId={dataResults.url}
        className="size-52 overflow-hidden rounded-md"
        alt="image chat"
        src={dataResults.url}
      />
      <ImageMessageAction
        setAttachments={setAttachments}
        url={dataResults.url}
        description={description}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}

export default GenerateImage;
