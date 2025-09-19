"use client";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { User } from "better-auth";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

export function SidebarUserNav({ user }: { user: User }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex items-center gap-2"
          )}
        >
          <div className="flex flex-col gap-1">
            <p>Upgrade Plan</p>
            <p>More access to the best models</p>
          </div>
        </Link> */}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
