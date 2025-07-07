import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DataStreamProvider } from "@/components/data-stream-provider";

async function layout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    cookies(),
  ]);
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";
  return (
    <DataStreamProvider>
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}

export default layout;
