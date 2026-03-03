"use client";
import { createContext, useContext } from "react";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";

const PresenceContext = createContext<any>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const presence = useGlobalPresence();
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
