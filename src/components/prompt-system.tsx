"use client";

import { AnimatePresence } from "motion/react";
import React, { memo } from "react";
import { Suggestions } from "./suggestions";
import { Card, CardDescription, CardTitle } from "./ui/card";
import * as LucideIcons from "lucide-react";
import { suggestions } from "@/constants";

export const PromptSystem = memo(function PromptSystem({
  onQuery,
  items,
}: {
  onQuery: (query: string) => void;
  items?: any; // optional JSON-provided items
}) {
  return (
    <>
      <div className="relative order-1 w-full container max-w-[900px] md:order-2 md:h-[70px]">
        <h3 className="mb-6">دستور موردنظر خود را انتخاب کنید</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {suggestions.slice(0, 4).map((item, index) => {
            const iconName = item.icon ?? "CircleHelp";
            const IconComponent =
              ((
                LucideIcons as unknown as Record<
                  string,
                  React.ComponentType<any>
                >
              )[iconName] as React.ComponentType<any> | undefined) ??
              (LucideIcons as any).CircleHelp;

            return (
              <Card
                key={index}
                className="p-4 cursor-pointer relative w-[310px] overflow-hidden hover:bg-background/80 transition-all"
                onClick={() => {
                  onQuery(item.name);
                }}
              >
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                <IconComponent className="absolute size-16 -bottom-2 opacity-50 -left-2" />
              </Card>
            );
          })}
        </div>
        {/* <AnimatePresence mode="popLayout">
          <Suggestions onQuery={onQuery} />
        </AnimatePresence> */}
      </div>
    </>
  );
});
