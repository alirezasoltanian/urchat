import { Skeleton } from "@/components/ui/skeleton";

function loading() {
  return (
    <div className="flex flex-wrap gap-1 container mt-16">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="relative">
          <Skeleton className="absolute top-4 end-4 size-10 rounded-md z-10" />
          <Skeleton className="size-60 rounded-md" />
        </div>
      ))}
    </div>
  );
}
export default loading;
