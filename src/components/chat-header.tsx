"use client";

import { useRouter } from "next/navigation";

// import { ModelSelector } from '@/components/model-selector';
import { authClient } from "@/lib/auth-client";
import type { User } from "better-auth";
import Link from "next/link";
import { type Dispatch, type SetStateAction } from "react";
import { ReAvatar } from "./reuseable/re-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ChatHeader({
  user,
  setOpenShortcutDialog,
}: {
  user: User;
  setOpenShortcutDialog: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center justify-end px-2 md:px-2 gap-2">
      {/* {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )} */}

      {/* {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )} */}

      <div className="">
        <DropdownMenu>
          <DropdownMenuTrigger className="me-2" asChild>
            <div>
              <ReAvatar src={user.name} src={user?.image} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Chat</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link className="w-full" href="/settings/account">
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link className="w-full" href="/settings/customization">
                  Customization
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setOpenShortcutDialog(true)}>
                Shortcuts
                <DropdownMenuShortcut>
                  <div className="flex gap-0.5">
                    <kbd className="px-1 py-0,5 text-xs bg-muted rounded">
                      Ctrl
                    </kbd>
                    <kbd className="px-1 py-0,5 text-xs bg-muted rounded">
                      Shift
                    </kbd>
                    <kbd className="px-1 py-0,5 text-xs bg-muted rounded">
                      S
                    </kbd>
                  </div>
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link href="/settings/Contact">Contact</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/auth");
                    },
                  },
                });
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
