"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, User } from "firebase/auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useAuthFromFirebase() {
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
        [user, isLoading]
    );
}

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { isLoading, isAuthenticated, fetchAccessToken } = useAuthFromFirebase();

    return (
        <ConvexProviderWithAuth
            client={convex}
            useAuth={() => ({ isLoading, isAuthenticated, fetchAccessToken })}
        >
            {children}
        </ConvexProviderWithAuth>
    );
}
