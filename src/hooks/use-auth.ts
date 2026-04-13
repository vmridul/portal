"use client";

import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import type { User as AppUser } from "@/lib/types";

interface UseAuthResult {
  user: AppUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setAppUser(null);
  }, []);

  return {
    user: appUser,
    firebaseUser,
    isLoading,
    isAuthenticated: firebaseUser !== null,
    signOut,
  };
}