"use client";

import { Galindo } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useUIStore } from "@/store/uiStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PixelBlast from "@/components/PixelBlast";
import { useColor } from "@/contexts/colorContext";
import {
  Navbar,
  Hero,
  Privacy,
  GoodStuff,
  BeautifullyCrafted,
  BasicsCovered,
  Theming,
  CTA,
  Footer,
} from "@/components/landing";


export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setModal } = useUIStore();
  const { userId, isLoaded } = useAuth();
  const isAuthenticated = !!userId;
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const { color, setColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const deletedToastShown = useRef(false);

  useEffect(() => {
    if (searchParams.get("deleted") === "true" && !deletedToastShown.current) {
      deletedToastShown.current = true;
      toast.success("Account deleted successfully");
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleEnter = () => {
    if (isAuthenticated) {
      router.push("/portal");
      return;
    }
    router.push("/login");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated]);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const beautifullyCraftedRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: beautifullyCraftedRef,
    offset: ["start end", "end start"],
  });

  const beautifullyCraftedOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.45, 0.75, 1],
    [0, 1, 1, 0],
  );
  const beautifullyCraftedBlur = useTransform(
    scrollYProgress,
    [0.1, 0.45, 0.75, 1],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div
      ref={containerRef}
      className="h-screen selection:bg-white/10 bg-[#0a080b] overflow-y-auto overflow-x-hidden relative"
    >
      <div ref={contentRef} className="w-full">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#505050"
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.2}
            transparent
            edgeFade={0.1}
          />
        </div>

        <Navbar scrolled={scrolled} handleEnter={handleEnter} />

        <Hero handleEnter={handleEnter} dashboardRef={dashboardRef} />
      </div>

      <Privacy />

      <GoodStuff />

      <BeautifullyCrafted
        beautifullyCraftedRef={beautifullyCraftedRef}
        beautifullyCraftedOpacity={beautifullyCraftedOpacity}
        beautifullyCraftedBlur={beautifullyCraftedBlur}
      />

      <BasicsCovered />


      <Theming colorDialog={colorDialog} setColorDialog={setColorDialog} />

      <CTA handleEnter={handleEnter} />

      <Footer />


    </div>
  );
}
