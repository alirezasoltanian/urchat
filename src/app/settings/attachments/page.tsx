import MobileImage from "@/components/MobileImage";
import { PreviewAttachment } from "@/components/preview-attachment";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { files } from "@/db/schema";
import { currentUser } from "@/lib/actions/user";
import { cn, createUrlStorage } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { BookImage, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/auth");
  }
  const userId = user.id;
  const filesData = await db
    .select()
    .from(files)
    .where(and(eq(files.userId, userId), eq(files.folder, "/attachment")));
  console.log("aaaaaaa", filesData);
  if (!filesData.length) {
    return (
      <div className="flex size-full text-muted-foreground mt-24 justify-center items-center flex-col gap-6">
        <BookImage size={80} />
        <p className="text-muted-foreground font-semibold text-lg">
          You haven't attachment any images or files yet.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 container mt-16">
      {filesData.map((item, index) => (
        <div className="relative">
          <Link
            href={`/chat/${item.chatId}`}
            className={cn(
              buttonVariants({ size: "icon" }),
              "absolute top-4 end-4 z-10"
            )}
          >
            <ExternalLink />
          </Link>

          <PreviewAttachment
            attachment={{
              name: item.filename ?? "An image attachment",
              url: createUrlStorage(item.s3Key),
              contentType: item.mimeType,
            }}
            isInChat={true}
          />
        </div>
      ))}
    </div>
  );
}

export default page;
