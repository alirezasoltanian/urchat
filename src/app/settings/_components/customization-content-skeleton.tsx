import { Skeleton } from "@/components/ui/skeleton";

export function CustomizationContentSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground md:p-6 py-6">
      <div className=" mx-auto ">
        <h1 className="text-3xl font-bold mb-2">
          <Skeleton className="h-9 w-64" />
        </h1>

        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="flex justify-between ">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
