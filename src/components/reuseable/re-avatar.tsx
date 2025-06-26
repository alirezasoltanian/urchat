import Image from "next/image";
import { type AvatarProps } from "@radix-ui/react-avatar";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { PersonStanding } from "lucide-react";

interface UserAvatarProps extends AvatarProps {
  name?: string | null;
  src?: string | null;
  defaultPlaceholder?: boolean;
}

export function ReAvatar({
  name,
  src,
  defaultPlaceholder = false,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {src ? (
        <div className="relative aspect-square size-full">
          <Image
            fill
            src={src}
            alt="profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        name && (
          <AvatarFallback>
            <span className="sr-only">{name}</span>
            {defaultPlaceholder ? (
              <PersonStanding className=" size-4" />
            ) : (
              name.slice(0, 1)
            )}
          </AvatarFallback>
        )
      )}
    </Avatar>
  );
}
