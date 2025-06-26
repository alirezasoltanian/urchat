"use client";
import { ReAvatar } from "@/components/reuseable/re-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { capitalize } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import UserProfileSkeleton from "./user-profile-skeleton";
import { shortcuts } from "@/constants";

export function UserProfile() {
  const { data: userData, isPending } = useQuery(
    trpc.user.userExtraData.queryOptions()
  );
  if (isPending) {
    return <UserProfileSkeleton />;
  }
  const baseToken = 50000;
  return (
    <div className="w-80 p-6 border-r bg-background hidden sm:block">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <ReAvatar
          className="size-24 text-2xl font-bold text-primary-foreground bg-primary"
          name={userData?.name}
          src={userData?.image}
        />

        <div className="text-center">
          <h2 className="text-xl font-semibold">{userData?.name}</h2>
          {userData?.email && (
            <p className="text-sm text-muted-foreground">{userData?.email}</p>
          )}
          {userData?.planId && (
            <Badge variant="secondary" className="mt-2">
              {capitalize(userData?.planId)} Plan
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {baseToken - (userData?.chatToken ?? 0) > 50_000
                  ? 50_000
                  : baseToken - (userData?.chatToken ?? 0)}{" "}
                /{baseToken}
              </span>
            </div>
            <Progress
              value={
                ((baseToken - (userData?.chatToken ?? 0)) / baseToken) * 100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 ">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className=" font-medium">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <Badge key={keyIndex} className="flex items-center gap-1">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
