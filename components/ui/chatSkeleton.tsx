import { Skeleton } from "./skeleton";
export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col gap-10 p-8">
      <div className="flex gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-[500px] rounded-[6px]" />
          <Skeleton className="h-7 w-[400px] rounded-[6px]" />
          <Skeleton className="h-7 w-[600px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9" />
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className="h-7 w-[500px] rounded-[6px]" />
          <Skeleton className="h-7 w-[400px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex  gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-[500px] rounded-[6px]" />
          <Skeleton className="h-7 w-[400px] rounded-[6px]" />
          <Skeleton className="h-7 w-[300px] rounded-[6px]" />
          <Skeleton className="h-7 w-[600px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9" />
        <div className="flex flex-col gap-2 items-end">
          <Skeleton className="h-7 w-[500px] rounded-[6px]" />
          <Skeleton className="h-7 w-[400px] rounded-[6px]" />
          <Skeleton className="h-7 w-[300px] rounded-[6px]" />
        </div>
      </div>
    </div>
  );
};
