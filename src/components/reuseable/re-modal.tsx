"use client";

import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title?: string;
  description?: string;
  textButton?: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  form?: any;
  renderButton?: any;
  onClose?: () => void;
  className?: string;
  preventDefaultClose?: boolean;
  onOpenAutoFocus?: boolean;
}

function ReModal({
  title,
  description,
  textButton,
  children,
  form,
  open,
  onOpenChange,
  renderButton,
  onClose,
  className,
  preventDefaultClose,
  onOpenAutoFocus = true,
  ...props
}: Props) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();
  //   async function submitFunction(e: React.FormEvent<HTMLFormElement>) {
  //     e.preventDefault();
  //     startTransition(async () => {
  //       const val = e.target as HTMLFormElement;
  //       const text = val.description.value as string;

  //       const res = await submit(text);
  //       toast.success(`باموفقیت اضافه شد`);
  //       setOpen(false);
  //       router.refresh();
  //     });
  //   }
  const formContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (formContainerRef.current) {
        formContainerRef.current.style.setProperty(
          "bottom",
          `env(safe-area-inset-bottom)`
        );
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize(); // Initial call in case the keyboard is already open
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);
  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (preventDefaultClose && !dragged) {
      return;
    }
    // fire onClose event if provided
    onClose && onClose();

    // if setShowModal is defined, use it to close modal
    if (onOpenChange) {
      onOpenChange(false);
      // else, this is intercepting route @modal
    } else {
      router.back();
    }
  };
  if (!isMobile) {
    return (
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open && form) {
            form.reset();
          }
          if (!open) {
            closeModal();
          }
          onOpenChange?.(open);
        }}
        {...props}
      >
        {(renderButton || textButton) && (
          <DialogTrigger asChild>
            {textButton ? (
              <Button variant="outline">{textButton}</Button>
            ) : renderButton ? (
              <div className="w-fit">{renderButton()}</div>
            ) : null}
          </DialogTrigger>
        )}
        <DialogContent
          // onOpenAutoFocus={(e) => !onOpenAutoFocus && e.preventDefault()}
          className={cn("sm:max-w-[425px]", className)}
        >
          <DialogHeader>
            {title ? (
              <DialogTitle>{title}</DialogTitle>
            ) : (
              <DialogTitle className="hidden"></DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        if (!open && form) {
          form.reset();
        }
        if (!open) {
          closeModal();
        }
        onOpenChange?.(open);
      }}
      repositionInputs={false}
      {...props}
    >
      {(renderButton || textButton) && (
        <DrawerTrigger asChild>
          {textButton ? (
            <Button variant="outline">{textButton}</Button>
          ) : renderButton ? (
            <div>{renderButton()}</div>
          ) : null}
        </DrawerTrigger>
      )}
      <DrawerContent
        ref={formContainerRef}
        className={cn("min-h-fit p-6 pt-0", className)}
      >
        <div className="bg-muted/50 mx-auto mt-4 h-1 w-[100px] rounded-full" />

        {(title || description) && (
          <DrawerHeader className="ps-0 pb-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
        )}
        {children}
      </DrawerContent>
    </Drawer>
  );
}

export default ReModal;
