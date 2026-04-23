import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon } from "@hugeicons/core-free-icons";

interface MemberStatusIndicatorProps {
  isOnline: boolean;
  isAway: boolean;
}

export function MemberStatusIndicator({
  isOnline,
  isAway,
}: MemberStatusIndicatorProps) {
  if (isOnline) {
    return (
      <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-green-500 rounded-full" />
    );
  }

  if (isAway) {
    return (
      <HugeiconsIcon
        icon={Moon02Icon}
        fill="currentColor"
        className="absolute text-yellow-400 right-0 bottom-0 w-[10px] h-[10px] opacity-90"
      />
    );
  }

  return (
    <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-gray-500 rounded-full" />
  );
}
