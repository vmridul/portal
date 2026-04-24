import { usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * Hook to get the current active conversation ID from the URL
 * Returns the conversation ID if the user is currently viewing a conversation
 * Returns null if not in a conversation view
 */
export function useActiveConversationId(): string | null {
  const pathname = usePathname();
  
  return useMemo(() => {
    // Check if we're on a friend conversation page: /portal/friend/[id]
    const friendMatch = pathname.match(/^\/portal\/friend\/([^\/]+)(\/.*)?$/);
    if (friendMatch) {
      return friendMatch[1];
    }
    
    // Check if we're on a room conversation page: /portal/room/[id]
    const roomMatch = pathname.match(/^\/portal\/room\/([^\/]+)(\/.*)?$/);
    if (roomMatch) {
      return roomMatch[1];
    }
    
    // Not in a conversation view
    return null;
  }, [pathname]);
}