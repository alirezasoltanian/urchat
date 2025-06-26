"use client";

import { PromptSuggestion } from "@/components/prompt-suggestion";
import { AnimatePresence, motion } from "motion/react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { SUGGESTIONS as SUGGESTIONS_CONFIG } from "@/constants";
import { TRANSITION_SUGGESTIONS } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

import { GlowEffect } from "./core/glow-effect";
import { BorderTrail } from "./core/border-trail";
import { Image } from "lucide-react";
const MotionPromptSuggestion = motion.create(PromptSuggestion);

export const Suggestions = memo(function Suggestions({
  onQuery,
}: {
  onQuery: (query: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    SUGGESTIONS_CONFIG[0].label
  );

  const activeCategoryData = SUGGESTIONS_CONFIG.find(
    (group) => group.label === activeCategory
  );

  const showCategorySuggestions =
    activeCategoryData && activeCategoryData.items.length > 0;

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setActiveCategory(null);
    onQuery(suggestion);
  }, []);

  const handleCategoryClick = useCallback(
    (suggestion: { label: string; prompt: string }) => {
      setActiveCategory(suggestion.label);
    },
    []
  );

  const suggestionsGrid = useMemo(
    () => (
      <motion.div
        key="suggestions-grid"
        className="flex w-full max-w-full flex-nowrap justify-start gap-2 overflow-x-auto px-2 md:mx-auto md:max-w-2xl md:flex-wrap md:justify-center md:pl-0"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, y: 10, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
        transition={TRANSITION_SUGGESTIONS}
        style={{
          scrollbarWidth: "none",
        }}
      >
        {SUGGESTIONS_CONFIG.map((suggestion, index) => (
          <motion.div
            key={suggestion.label}
            initial="initial"
            animate="animate"
            transition={{
              ...TRANSITION_SUGGESTIONS,
              delay: index * 0.02,
            }}
            variants={{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
            }}
          >
            <Button
              className={cn(
                activeCategory === suggestion.label && "",
                "capitalize"
              )}
              variant={
                activeCategory === suggestion.label ? "default" : "outline"
              }
              onClick={() => handleCategoryClick(suggestion)}
            >
              <suggestion.icon className="size-4" />
              {suggestion.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    ),
    [activeCategory]
  );

  const suggestionsList = useMemo(
    () => (
      <motion.div
        className="flex w-full flex-col space-y-1 px-2 mt-8"
        key={activeCategoryData?.label}
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, y: 10, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          exit: {
            opacity: 0,
            y: -10,
            filter: "blur(4px)",
          },
        }}
        transition={TRANSITION_SUGGESTIONS}
      >
        {activeCategoryData?.items.map((suggestion: string, index: number) => (
          <MotionPromptSuggestion
            key={`${activeCategoryData?.label}-${suggestion}-${index}`}
            highlight={activeCategoryData.highlight}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className="block h-full text-left"
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{
              ...TRANSITION_SUGGESTIONS,
              delay: index * 0.05,
            }}
          >
            {suggestion}
          </MotionPromptSuggestion>
        ))}
      </motion.div>
    ),
    [
      activeCategory,
      activeCategoryData?.highlight,
      activeCategoryData?.items,
      activeCategoryData?.label,
    ]
  );

  return (
    <div>
      {suggestionsGrid}

      <AnimatePresence mode="wait">{suggestionsList}</AnimatePresence>
    </div>
  );
});
