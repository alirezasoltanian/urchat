"use client";

import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Toggle } from "./ui/toggle";
import { getCookie, setCookie } from "@/lib/cookies";

export function SearchModeToggle() {
  const [isSearchMode, setIsSearchMode] = useState(true);

  useEffect(() => {
    const savedMode = getCookie("search-mode");
    if (savedMode !== null) {
      setIsSearchMode(savedMode === "true");
    } else {
      setCookie("search-mode", "true");
    }
  }, []);

  const handleSearchModeChange = (pressed: boolean) => {
    setIsSearchMode(pressed);
    console.log("first", pressed.toString());

    setCookie("search-mode", pressed.toString());
  };

  return (
    <Toggle
      aria-label="Toggle search mode"
      pressed={isSearchMode}
      onPressedChange={handleSearchModeChange}
      variant="outline"
      className={cn(
        "gap-1 px-3 border border-input text-muted-foreground bg-background",
        "data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900",
        "data-[state=on]:text-blue-500 dark:data-[state=on]:text-blue-300",
        "data-[state=on]:border-blue-200 dark:data-[state=on]:border-blue-800",
        "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Globe className="size-4" />
      <span className="text-xs hidden md:block">Search</span>
    </Toggle>
  );
}
