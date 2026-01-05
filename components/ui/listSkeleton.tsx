import { Skeleton } from "./skeleton";
export const ListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-[24px] mt-2 w-[268px] rounded-[4px]" />
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Skeleton className="rounded-[8px] w-9 h-9" />
          <div className="flex flex-col ">
            <Skeleton className="h-[26px] mt-2 w-[210px] rounded-[4px]" />
            <Skeleton className="h-[12px] mt-2 w-[140px] rounded-[4px]" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="rounded-[8px] w-9 h-9" />
          <div className="flex flex-col ">
            <Skeleton className="h-[26px] mt-2 w-[210px] rounded-[4px]" />
            <Skeleton className="h-[12px] mt-2 w-[140px] rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
