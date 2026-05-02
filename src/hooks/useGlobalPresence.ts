import { useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Status = "online" | "away";

export function useGlobalPresence() {
  const activePresences = useQuery(api.presence.getOnlineUsers) || [];
  const updatePresence = useMutation(api.presence.update);

  const onlineUsers = new Set<string>();
  const awayUsers = new Set<string>();

  activePresences.forEach((p: { status: string; user_id: string }) => {
    if (p.status === "online") onlineUsers.add(p.user_id);
    else if (p.status === "away") awayUsers.add(p.user_id);
  });

  const setStatus = useCallback(
    async (status: Status) => {
      await updatePresence({ status });
    },
    [updatePresence],
  );

  useEffect(() => {
    let awayTimeout: ReturnType<typeof setTimeout>;

    const onFocus = () => {
      clearTimeout(awayTimeout);
      setStatus("online");
    };

    const onBlur = () => {
      awayTimeout = setTimeout(() => {
        setStatus("away");
      }, 5 * 60 * 1000);
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    setStatus("online");

    return () => {
      clearTimeout(awayTimeout);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [setStatus]);

  return { onlineUsers, awayUsers, setStatus };
}
