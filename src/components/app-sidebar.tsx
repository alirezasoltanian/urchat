"use client";

import { useRouter } from "next/navigation";

import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { User } from "better-auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SidebarToggle } from "./sidebar-toggle";
import { BookImage, Plus, Search } from "lucide-react";
export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [openSearchDialog, setOpenSearchDialog] = useState(false);

  return (
    <div>
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-row justify-center items-center">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-3 items-center"
              >
                <Image
                  src="/images/logos/urchat-logo.svg"
                  width={64}
                  height={64}
                  className=""
                  alt="logo"
                />
              </Link>
            </div>
            <Button
              onClick={() => {
                setOpenMobile(false);
                router.push("/");
                router.refresh();
              }}
              className="mt-3 justify-between group/button "
            >
              <p className="flex gap-2">
                {" "}
                <span>
                  <Plus />{" "}
                </span>{" "}
                New Chat
              </p>
              <p className="group-hover/button:block hidden text-muted-foreground">
                Ctrl+Shift+O
              </p>
            </Button>
            <Button
              onClick={() => {
                setOpenSearchDialog(true);
              }}
              variant="ghost"
              className="mt-1 justify-between group/button "
            >
              <p className="flex gap-2">
                {" "}
                <span>
                  <Search />{" "}
                </span>{" "}
                Search
              </p>
              <p className="group-hover/button:block hidden text-muted-foreground">
                Ctrl+K
              </p>
            </Button>
            {/* <Link
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start"
              )}
              onClick={() => {
                setOpenMobile(false);
              }}
              href="/library"
            >
              <p className="flex gap-2">
                {" "}
                <span>
                  <BookImage />{" "}
                </span>{" "}
                Library
              </p>
            </Link> */}
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory
            openSearchDialog={openSearchDialog}
            setOpenSearchDialog={setOpenSearchDialog}
            user={user}
          />
        </SidebarContent>
        <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
      </Sidebar>
      <SidebarToggle setOpenSearchDialog={setOpenSearchDialog} />
    </div>
  );
}
