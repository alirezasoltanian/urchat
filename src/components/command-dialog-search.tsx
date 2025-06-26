"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  Smile,
  User,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useHotkeys } from "react-hotkeys-hook";
import { Chat } from "@/db/schema";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function CommandDialogSearch({
  openSearchDialog,
  setOpenSearchDialog,
  paginatedChatHistories,
}: {
  openSearchDialog?: boolean;
  setOpenSearchDialog: (open: boolean) => void;
  paginatedChatHistories?: Array<{ chats: Chat[]; hasMore: boolean }>;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  useHotkeys(
    ["ctrl+shift+k"],
    (event) => {
      event.preventDefault();
      console.log("Opening command palette");
      setOpenSearchDialog(true);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    }
  );
  // Get the latest 5 chats from all paginated data
  const getLatestChats = React.useMemo(() => {
    if (!paginatedChatHistories) return [];

    const allChats = paginatedChatHistories.flatMap((page) => page.chats);
    return allChats
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [paginatedChatHistories]);

  // Filter chats based on search query
  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return getLatestChats;

    return getLatestChats.filter((chat) =>
      chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [getLatestChats, searchQuery]);

  // Group chats by time periods
  const groupedChats = React.useMemo(() => {
    const now = new Date();
    const groups: {
      today: Chat[];
      yesterday: Chat[];
      lastWeek: Chat[];
      lastMonth: Chat[];
      older: Chat[];
    } = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      const daysDiff = Math.floor(
        (now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        groups.today.push(chat);
      } else if (daysDiff === 1) {
        groups.yesterday.push(chat);
      } else if (daysDiff <= 7) {
        groups.lastWeek.push(chat);
      } else if (daysDiff <= 30) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    setOpenSearchDialog(false);
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  return (
    <>
      <CommandDialog
        open={openSearchDialog}
        onOpenChange={setOpenSearchDialog}
        value={searchQuery}
        onValueChange={setSearchQuery}
      >
        <CommandInput placeholder="Search or press Enter to start new chat..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {/* Today */}
          {groupedChats.today.length > 0 && (
            <CommandGroup heading="Today">
              {groupedChats.today.map((chat) => (
                <CommandItem
                  key={chat.id}
                  onSelect={() => handleChatSelect(chat.id)}
                  className=""
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex items-center justify-between py-3 w-full"
                  >
                    <div className="flex items-center gap-3">
                      <span className="truncate">
                        {chat.title.length > 40
                          ? chat.title.slice(0, 40) + "..."
                          : chat.title || "Untitled Chat"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chat.createdAt)}
                    </span>
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {/* Yesterday */}
          {groupedChats.yesterday.length > 0 && (
            <>
              {groupedChats.today.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Yesterday">
                {groupedChats.yesterday.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => handleChatSelect(chat.id)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {chat.title.length > 40
                          ? chat.title.slice(0, 40) + "..."
                          : chat.title || "Untitled Chat"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chat.createdAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {/* Last 7 days */}
          {groupedChats.lastWeek.length > 0 && (
            <>
              {(groupedChats.today.length > 0 ||
                groupedChats.yesterday.length > 0) && <CommandSeparator />}
              <CommandGroup heading="Last 7 days">
                {groupedChats.lastWeek.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => handleChatSelect(chat.id)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {chat.title.length > 40
                          ? chat.title.slice(0, 40) + "..."
                          : chat.title || "Untitled Chat"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chat.createdAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {/* Last 30 days */}
          {groupedChats.lastMonth.length > 0 && (
            <>
              {(groupedChats.today.length > 0 ||
                groupedChats.yesterday.length > 0 ||
                groupedChats.lastWeek.length > 0) && <CommandSeparator />}
              <CommandGroup heading="Last 30 days">
                {groupedChats.lastMonth.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => handleChatSelect(chat.id)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {chat.title.length > 40
                          ? chat.title.slice(0, 40) + "..."
                          : chat.title || "Untitled Chat"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chat.createdAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {/* Older */}
          {groupedChats.older.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="This year">
                {groupedChats.older.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    onSelect={() => handleChatSelect(chat.id)}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {chat.title.length > 40
                          ? chat.title.slice(0, 40) + "..."
                          : chat.title || "Untitled Chat"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(chat.createdAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {/* Keyboard shortcuts footer
          <div className="border-t p-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    ⏎
                  </kbd>
                  <span>Go to chat</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    ⌘K
                  </kbd>
                  <span>Toggle</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  Esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
          </div> */}
        </CommandList>
      </CommandDialog>
    </>
  );
}
