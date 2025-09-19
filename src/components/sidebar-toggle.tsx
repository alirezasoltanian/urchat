import type { ComponentProps } from "react";

import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PlusIcon, SidebarLeftIcon } from "@/components/icons";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "motion/react";

export function SidebarToggle({
  setOpenSearchDialog,
}: {
  setOpenSearchDialog: (open: boolean) => void;
}) {
  const { toggleSidebar, open, setOpenMobile } = useSidebar();
  const router = useRouter();

  return (
    <div className="fixed z-40 top-2 left-2">
      {open ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="sidebar-toggle-button"
              onClick={toggleSidebar}
              variant="outline"
              size="icon"
            >
              <SidebarLeftIcon size={12} />
            </Button>
          </TooltipTrigger>
          <TooltipContent align="start">نوار کناری</TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="sidebar-toggle-button"
                onClick={toggleSidebar}
                variant="outline"
                size="icon"
              >
                <SidebarLeftIcon size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start">نوار کناری</TooltipContent>
          </Tooltip>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{
              x: open ? -50 : 0,
              opacity: open ? 0 : 1,

              display: open ? "none" : "block",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setOpenSearchDialog(true);
                  }}
                  variant="outline"
                  type="button"
                  size="icon"
                >
                  <Search size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">Search Chat</TooltipContent>
            </Tooltip> */}
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{
              x: open ? -50 : 0,
              opacity: open ? 0 : 1,

              display: open ? "none" : "block",
            }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                    router.refresh();
                  }}
                  variant="outline"
                  type="button"
                  size="icon"
                >
                  <PlusIcon size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">چت جدید</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      )}
    </div>
  );
}
