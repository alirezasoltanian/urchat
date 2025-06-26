"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Scroller } from "@/components/ui/scroller";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Account", href: "account" },
  { name: "Customization", href: "customization" },
  { name: "History & Sync", href: "history" },
  { name: "Models", href: "models" },
  { name: "API Keys", href: "api-keys" },
  { name: "Attachments", href: "attachments" },
  { name: "Contact Us", href: "contact" },
];

export function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <Scroller
      hideScrollbar={true}
      orientation="horizontal"
      className="w-full p-4"
      asChild
    >
      <nav className="flex items-center gap-1 ">
        {navItems.map((item) => (
          <Link
            href={`/settings/${item.href}`}
            key={item.name}
            className={cn(
              buttonVariants({
                variant: pathname.includes(item.href) ? "default" : "ghost",
              })
            )}
            //   className={`whitespace-nowrap ${
            //     item.active
            //       ? "bg-red-600 hover:bg-red-700 text-white"
            //       : "text-muted-foreground hover:text-foreground"
            //   }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </Scroller>
  );
}
