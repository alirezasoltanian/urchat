"use client";

import { AnimatePresence } from "motion/react";
import React, { memo } from "react";
import { Suggestions } from "./suggestions";
export const PromptSystem = memo(function PromptSystem({
  onQuery,
}: {
  onQuery: (query: string) => void;
}) {
  return (
    <>
      <div className="relative order-1 w-full container max-w-[900px] md:order-2 md:h-[70px]">
        <AnimatePresence mode="popLayout">
          <Suggestions onQuery={onQuery} />
        </AnimatePresence>
      </div>
    </>
  );
});
