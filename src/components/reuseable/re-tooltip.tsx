"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
// import Linkify from "linkify-react";
import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "../ui/badge";
import { Button, buttonVariants } from "../ui/button";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export interface TooltipProps
  extends Omit<TooltipPrimitive.TooltipContentProps, "content"> {
  content:
    | ReactNode
    | string
    | ((props: { setOpen: (open: boolean) => void }) => ReactNode);
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen} delayDuration={0}>
      <TooltipPrimitive.Trigger
        asChild
        onClick={() => {
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
      >
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          side={side}
          className="animate-slide-up-fade bg-background z-99 items-center overflow-hidden rounded-lg border shadow-xs"
          collisionPadding={0}
        >
          {typeof content === "string" ? (
            <span className="block max-w-xs px-2 py-1 text-center text-sm text-pretty">
              {content}
            </span>
          ) : typeof content === "function" ? (
            content({ setOpen })
          ) : (
            content
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function TooltipContent({
  title,
  cta,
  href,
  target,
  onClick,
}: {
  title: ReactNode;
  cta?: string;
  href?: string;
  target?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex max-w-xs flex-col items-center space-y-3 p-4 text-center">
      <p className="text-sm text-gray-700">{title}</p>
      {cta &&
        (href ? (
          <Link
            href={href}
            {...(target ? { target } : {})}
            className={cn(
              buttonVariants({ variant: "primary" }),
              "flex h-9 w-full items-center justify-center rounded-lg border px-4 text-sm whitespace-nowrap"
            )}
          >
            {cta}
          </Link>
        ) : onClick ? (
          <Button className="h-9" onClick={onClick} variant="primary">
            {cta}
          </Button>
        ) : null)}
    </div>
  );
}

export function SimpleTooltipContent({
  title,
  cta,
  href,
}: {
  title: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="max-w-xs px-4 py-2 text-center text-sm text-gray-700">
      {title}{" "}
      {cta && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex text-gray-500 underline underline-offset-4 hover:text-gray-800"
        >
          {cta}
        </a>
      )}
    </div>
  );
}

// export function LinkifyTooltipContent({ children }: { children: ReactNode }) {
//   return (
//     <div className="block max-w-md whitespace-pre-wrap px-4 py-2 text-center text-sm text-gray-700">
//       <Linkify
//         as="p"
//         options={{
//           target: "_blank",
//           rel: "noopener noreferrer nofollow",
//           className:
//             "underline underline-offset-4 text-gray-400 hover:text-gray-700",
//         }}
//       >
//         {children}
//       </Linkify>
//     </div>
//   );
// }

export function InfoTooltip(props: Omit<TooltipProps, "children">) {
  return (
    <Tooltip {...props}>
      <HelpCircle className="h-4 w-4 text-gray-500" />
    </Tooltip>
  );
}

export function BadgeTooltip({ children, content, ...props }: TooltipProps) {
  return (
    <Tooltip content={content} {...props}>
      <div className="flex cursor-pointer items-center">
        <Badge
          variant="gray"
          className="border-gray-300 transition-all hover:bg-gray-200"
        >
          {children}
        </Badge>
      </div>
    </Tooltip>
  );
}

export function ButtonTooltip({
  tooltipContent,
  children,
  ...props
}: {
  tooltipContent: ReactNode | string;
  children: ReactNode;
} & any) {
  return (
    <Tooltip content={tooltipContent}>
      <div className="flex cursor-pointer items-center">
        <button type="button" {...props}>
          {children}
        </button>
      </div>
    </Tooltip>
  );
}
