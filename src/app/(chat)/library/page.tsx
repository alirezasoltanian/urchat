import MobileImage from "@/components/MobileImage";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { files } from "@/db/schema";
import { currentUser } from "@/lib/actions/user";
import { cn, createUrlStorage } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { BookImage, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/auth");
  }
  const userId = user.id;
  const filesData = await db
    .select()
    .from(files)
    .where(and(eq(files.userId, userId), eq(files.folder, "/")));
  console.log("aaaaaaa");
  if (!filesData.length) {
    return (
      <div className="flex size-full justify-center items-center flex-col gap-6">
        <BookImage size={80} />
        <p className="text-muted-foreground font-semibold text-lg">
          You haven't generated any images yet.
        </p>
      </div>
    );
  }
  return (
    <div className="container mt-16">
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          <h2>Library</h2>
          <p className="text-muted-foreground">(generated image)</p>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "link" }))}
          href="/settings/attachments"
        >
          Attachments
        </Link>
      </div>
      <div className="flex flex-wrap gap-1 container mt-5">
        {filesData.map((item, index) => (
          <div className="relative">
            <Link
              href={`/chat/${item.chatId}`}
              className={cn(
                buttonVariants({ size: "icon" }),
                "absolute top-4 end-4"
              )}
            >
              <ExternalLink />
            </Link>
            <MobileImage
              layoutId={createUrlStorage(item.s3Key)}
              className="size-60 overflow-hidden rounded-md"
              alt={item.filename ?? "An image attachment"}
              src={createUrlStorage(item.s3Key)}
              key={createUrlStorage(item.s3Key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default page;
