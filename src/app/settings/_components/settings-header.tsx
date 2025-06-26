"use client";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";

export function SettingsHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };
  return (
    <header className="flex items-center justify-between py-4 border-b bg-background">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center gap-2 text-foreground"
        )}
      >
        <ArrowLeft className="size-4" />
        Back to Chat
      </Link>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleThemeToggle}
            >
              {theme === "light" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Toggle theme</p>
          </TooltipContent>
        </Tooltip>
        <Button
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/auth");
                },
              },
            });
          }}
          variant="ghost"
          className="text-foreground"
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
