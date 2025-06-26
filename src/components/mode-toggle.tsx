"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { useTheme } from "./theme-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  return (
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
  );
}
