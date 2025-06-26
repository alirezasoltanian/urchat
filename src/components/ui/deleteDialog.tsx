"use client";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ReModal from "../reuseable/re-modal";
import { Button } from "./button";
import { DropdownMenuShortcut } from "./dropdown-menu";

function DeleteDialog({
  deleteAction,
  onOpenChange,
  open,
  deleteTitle,
  deleteDescription,
  renderButton,
  defaultButton = false,
  isPending,
}: {
  deleteAction: () => void;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  deleteTitle?: string;
  deleteDescription?: string;
  renderButton?: any;
  defaultButton?: boolean;
  isPending: boolean;
}) {
  const router = useRouter();

  return (
    <ReModal
      onOpenChange={onOpenChange}
      open={open}
      title={deleteTitle}
      renderButton={() => (
        <div>
          {renderButton
            ? renderButton()
            : defaultButton && (
                <Button variant="ghost" className="w-full">
                  حذف
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </Button>
              )}
        </div>
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <h3>{deleteDescription}</h3>
        <div className="mt-4 flex w-full gap-3 *:w-[50%]">
          <Button
            disabled={isPending}
            variant="ghost"
            className=""
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={isPending} onClick={deleteAction}>
            Delete
          </Button>
        </div>
      </div>
    </ReModal>
  );
}

export default DeleteDialog;
