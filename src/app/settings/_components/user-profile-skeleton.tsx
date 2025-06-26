import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function UserProfileSkeleton() {
  return (
    <div className="w-80 p-6 border-r bg-background hidden sm:block">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="text-center space-y-2 flex flex-col items-center">
          <Skeleton className="h-6 w-32 " />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-20 mx-auto" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfileSkeleton;
