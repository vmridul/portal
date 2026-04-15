import { Skeleton } from "./Skeleton";
export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col gap-10 p-8">
      <div className="flex gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9 flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 items-start">
          <Skeleton className="h-7 w-full md:max-w-[500px] max-w-[200px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[400px] max-w-[150px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[600px] max-w-[220px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9 flex-shrink-0" />
        <div className="flex flex-col gap-2 items-start flex-1">
          <Skeleton className="h-7 w-full md:max-w-[500px] max-w-[200px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[400px] max-w-[150px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9 flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 items-start">
          <Skeleton className="h-7 w-full md:max-w-[500px] max-w-[200px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[400px] max-w-[150px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[300px] max-w-[100px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[600px] max-w-[220px] rounded-[6px]" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="rounded-[8px] h-9 w-9 flex-shrink-0" />
        <div className="flex flex-col gap-2 items-start flex-1">
          <Skeleton className="h-7 w-full md:max-w-[500px] max-w-[200px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[400px] max-w-[150px] rounded-[6px]" />
          <Skeleton className="h-7 w-full md:max-w-[300px] max-w-[100px] rounded-[6px]" />
        </div>
      </div>
    </div>
  );
};
