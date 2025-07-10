import { TextShimmer } from "../core/text-shimmer";
import { useState } from "react";
import ReModal from "../reuseable/re-modal";
import Link from "next/link";
import { ChatTools } from "@/types";
interface Source {
  id: string;
  url: string;
  sourcesType: string;
  title: string;
}
interface Result {
  text: string;
  sources: Source[];
}
function SearchSection({ tool }: { tool: ChatTools["search"] }) {
  const [open, setOpen] = useState(false);
  console.log("tooltooltooltool", tool);

  return (
    <ReModal
      onOpenChange={setOpen}
      open={open}
      title="Sources"
      renderButton={() => (
        <div className="flex hover:cursor-pointer items-center  hover:bg-muted-foreground py-1 pr-2 pl-5 rounded-full  ">
          {tool.output.sources.slice(0, 3).map((source: Source) => {
            const hostname = new URL(source.url).hostname;
            const favicon = `https://www.google.com/s2/favicons?domain=${hostname}.au&sz=32`;
            return (
              <div className="size-8  relative rounded-full -ml-3 overflow-hidden bg-muted-foreground border-2 border-background">
                <img
                  alt="icon of source"
                  className="absolute inset-0 size-full object-cover"
                  src={favicon}
                />
              </div>
            );
          })}
          <p className="ms-2">Sources</p>
        </div>
      )}
    >
      <div>
        {tool.output.sources.slice(0, 3).map((source: Source) => {
          const hostname = new URL(source.url).hostname;
          const favicon = `https://www.google.com/s2/favicons?domain=${hostname}.au&sz=32`;
          return (
            <Link
              href={`${source.url}`}
              className="flex p-3 rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 flex-col gap-2"
            >
              <div className="flex gap-1 items-center">
                <div className="size-5 relative rounded-full  overflow-hidden bg-muted-foreground border-2 border-background">
                  <img
                    alt="icon of source"
                    className="absolute inset-0 size-full object-cover"
                    src={favicon}
                  />
                </div>
                <p>{hostname}</p>
              </div>
              <p>{source.title}</p>
            </Link>
          );
        })}
      </div>
    </ReModal>
  );
}

export default SearchSection;
