import { useState, useEffect, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, User } from "firebase/auth";

export function useAuthFromFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onIdTokenChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  return useMemo(
    () => ({
      isLoading: isLoading,
      isAuthenticated: user !== null,
      user,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        if (user) {
          return await user.getIdToken(forceRefreshToken);
        }
        return null;
      },
    }),
    [user, isLoading],
  );
}
