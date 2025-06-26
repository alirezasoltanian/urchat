import {
  Editable,
  EditableArea,
  EditableInput,
  EditablePreview,
} from "@/components/ui/editable";
import type { Chat } from "@/db/schema";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { renameChatTitle } from "@/lib/queries/chat";
import { Edit, GitFork, Share } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";
import { MoreHorizontalIcon, TrashIcon } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onSharing,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onSharing: (chatId: string, visibility: string) => void;
}) => {
  const [chatTitle, setChatTitle] = useState(chat.title);
  const [isEditing, setIsEditing] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });
  const handleSubmit = (value: string) => {
    if (value.trim() !== chatTitle) {
      renameChatTitle({ chatId: chat.id, newTitle: value.trim() });
      setChatTitle(value.trim());
    }
    setIsEditing(false);
  };
  const truncateTitle =
    chatTitle.length > 20 ? chatTitle.slice(0, 20) + "..." : chatTitle;

  return (
    <SidebarMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="items-center h-fit"
      >
        {isActive || isEditing ? (
          <Editable
            editing={isEditing}
            onEditingChange={setIsEditing}
            triggerMode="dblclick"
            defaultValue={chatTitle}
            onSubmit={(value) => {
              handleSubmit(value);
            }}
            className="w-full"
            placeholder="عنوان چت"
          >
            <EditableArea className="w-full">
              <EditablePreview className="border-none p-0">
                <p className="truncate font-medium select-none">
                  {truncateTitle}
                </p>
              </EditablePreview>
              <EditableInput className="w-[90%]" />
            </EditableArea>
          </Editable>
        ) : (
          <Link
            className="w-[90%]"
            onClick={() => {
              isMobile && setOpenMobile(false);
            }}
            href={`/chat/${chat.id}`}
          >
            <p className="truncate  select-none">{truncateTitle}</p>
          </Link>
        )}
      </SidebarMenuButton>
      {chat.forkId && (
        <GitFork className="size-3 absolute -top-0.5 -start-0.5" />
      )}

      {!isEditing && (
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5 mt-0.5"
              showOnHover={!isActive}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-lg" side="bottom" align="end">
            <DropdownMenuItem
              className="flex w-full text-start cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <Edit className=" size-4" />
              <p>Rename</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer "
              onSelect={() => onSharing(chat.id, chat.visibility)}
            >
              <Share className=" size-4" />
              <span>Share</span>
            </DropdownMenuItem>
            {chat.forkId && (
              <DropdownMenuItem className="cursor-pointer ">
                <Link
                  className="flex  items-center w-full"
                  href={`/chat/${chat.forkId}`}
                >
                  <GitFork className="me-2 size-4" />
                  <span>Source</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive focus:dark:text-red-500 focus:bg-destructive/30  dark:text-red-500"
              onSelect={() => onDelete(chat.id)}
            >
              <TrashIcon className="me-2 size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
