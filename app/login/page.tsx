"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import { Galindo, Lexend } from "next/font/google";
import { useAuthFromFirebase } from "@/hooks/useAuthFromFirebase";
import { useEffect, useState } from "react";
import Link from "next/link";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
});

const lexend = Lexend({
  weight: ["400", "600"],
  subsets: ["latin"],
});

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthFromFirebase();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/portal");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome back to Portal!");
      router.push("/portal");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading || (isAuthenticated && !isSigningIn)) {
    return (
      <div className="h-screen w-full bg-[#080e2a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#080e2a] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Pane - Visuals */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0c1235] via-[#080e2a] to-[#120a2e] items-center justify-center border-r border-white/5">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#5c3dd8]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7c4fd4]/10 blur-[120px] rounded-full animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col items-center p-12 text-center">
          {/* Main Illustration SVG */}
          <div className="w-full max-w-md mb-12 transform hover:scale-105 transition-transform duration-700">
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="portal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c4fd4" />
                  <stop offset="100%" stopColor="#5c3dd8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Abstract Portal Shapes */}
              <circle cx="250" cy="250" r="180" stroke="url(#portal-gradient)" strokeWidth="2" strokeDasharray="10 20" opacity="0.3" className="animate-[spin_60s_linear_infinite]" />
              <circle cx="250" cy="250" r="150" stroke="url(#portal-gradient)" strokeWidth="1" opacity="0.5" className="animate-[spin_40s_linear_infinite_reverse]" />

              {/* Floating Spheres (Glassmorphism) */}
              <g filter="url(#glow)">
                <circle cx="250" cy="250" r="100" fill="url(#portal-gradient)" fillOpacity="0.15" />
                <path d="M250 150C305.228 150 350 194.772 350 250" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </g>

              {/* Central Connection Nodes */}
              <circle cx="250" cy="250" r="40" fill="url(#portal-gradient)" />
              <circle cx="250" cy="250" r="20" fill="white" fillOpacity="0.8" />

              {/* Connecting Lines */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <rect
                  key={i}
                  x="249" y="100" width="2" height="60"
                  fill="url(#portal-gradient)"
                  transform={`rotate(${angle} 250 250)`}
                  opacity={0.4 + (i * 0.1)}
                />
              ))}
            </svg>
          </div>

          <h2 className={`${lexend.className} text-4xl font-bold text-white mb-4 tracking-tight`}>
            Step into the Portal
          </h2>
          <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
            Where conversations flow effortlessly and privacy finds its true home.
          </p>
        </div>
      </div>

      {/* Right Pane - Auth */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#080e2a] relative">
        <div className="absolute top-8 left-8 md:hidden">
          <Link href="/" className={`${galindo.className} text-2xl text-white`}>
            Portal
          </Link>
        </div>

        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Link href="/" className={`${galindo.className} text-4xl text-white mb-4 hidden md:block w-fit`}>
              Portal
            </Link>
            <h1 className={`${lexend.className} text-3xl font-semibold text-white tracking-tight`}>
              Sign in to your account
            </h1>
            <p className="text-[#8b949e]">
              Welcome back! Please enter your details to continue.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-100 text-[#0c0d12] font-semibold py-4 px-4 rounded-2xl transition-all active:scale-[0.98] shadow-xl hover:shadow-white/5 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#080e2a] px-3 text-[#565f6a]">Secure Authentication</span>
              </div>
            </div>
            <p className="text-center text-sm text-[#565f6a] px-6">
              By continued use, you agree to our{" "}
              <Link href="#" className="underline hover:text-white transition-colors">Terms of Service</Link> and{" "}
              <Link href="#" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="text-[#8b949e] hover:text-white text-sm transition-colors flex items-center gap-2 group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to shared landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
