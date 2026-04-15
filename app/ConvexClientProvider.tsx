"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, User } from "firebase/auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

import { useAuthFromFirebase } from "@/hooks/useAuthFromFirebase";

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
