// components/UserListSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

// Assume same dims as Usercard (adjust if needed)
const LOADING_CARDS = 7;
type UserListSkeletonProps = {
  count: number;
};

export default function UserListSkeleton({ count }: UserListSkeletonProps) {
  return (
    <div className="min-h-[80vh] flex justify-center items-center">
      <div className="flex flex-wrap gap-2 p-2 justify-center items-center">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-lg shadow bg-white p-4 w-[300px] gap-2 border"
          >
            <div className="flex gap-2">
              <Skeleton className="h-12 w-12 rounded-full mb-2" />
              <div className="">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-5 w-40 mb-1" />
              </div>
            </div>
            <Skeleton className="flex  h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
