"use client";

import { AnimatePresence } from "motion/react";
import React, { memo } from "react";
import { Suggestions } from "./suggestions";
import { Card, CardDescription, CardTitle } from "./ui/card";
import * as LucideIcons from "lucide-react";

type PromptItem = {
  name: string;
  description: string;
  icon?: string;
};

const defaultSuggestions: PromptItem[] = [
  {
    name: "دریافت مشتری ها",
    description: "لیستی از مشتری هاتان رو مشاهده می کنید",
    icon: "User",
  },
  {
    name: "دریافت فکتورها",
    description: "تمام فاکتورهایتان را دریافت کنید",
    icon: "FileText",
  },
  {
    name: "تجزیه و تحلبل جامع",
    description: "بررسی و پیشنهادات برای دیدی بهتر از فروشگاه",
    icon: "LineChart",
  },
  {
    name: "نمودار درآمدی",
    description: "نموداری از فروش هاینان داشته باش",
    icon: "ChartColumnBig",
  },
];

export const PromptSystem = memo(function PromptSystem({
  onQuery,
  items,
}: {
  onQuery: (query: string) => void;
  items?: PromptItem[]; // optional JSON-provided items
}) {
  const data: PromptItem[] = items && items.length ? items : defaultSuggestions;
  return (
    <>
      <div className="relative order-1 w-full container max-w-[900px] md:order-2 md:h-[70px]">
        <div className="flex flex-wrap gap-4">
          {data.map((item, index) => {
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
                className="p-4 cursor-pointer relative w-72 overflow-hidden"
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
