"use client";

import { Galindo, Lexend } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SignOutButton, Show, useAuth, SignInButton } from "@clerk/nextjs";

import { motion } from "framer-motion";
import { useRef } from "react";

import { useUIStore } from "@/store/uiStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Lenis from "lenis";
import PixelBlast from "@/components/PixelBlast";
import { useColor } from "@/contexts/colorContext";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  RoomItemMock,
  FriendItemMock,
  CallWidgetMock,
  PendingRequestMock,
  RoomMembersMock,
  ProfileButtonMock,
  AvatarStatusMock,
  MessageNotificationMock,
  CallEndedNotificationMock,
  ChatInputBarMock,
  UserProfilePopupMock,
  RecentCallItemMock,
  ChatMessageMock,
  ActiveCallMock,
  TypingIndicatorMock,
  FullAppMock,
  MentionsAutocompleteMock,
} from "@/components/mocks";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-galindo",
  display: "swap",
});

const lexend = Lexend({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

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

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
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

  // useEffect(() => {
  //   if (!containerRef.current || !contentRef.current) return;

  //   const lenis = new Lenis({
  //     wrapper: containerRef.current,
  //     content: contentRef.current,
  //     wheelMultiplier: 1.3,
  //     lerp: 0.1,
  //   });

  //   let rafId: number;
  //   function raf(time: number) {
  //     lenis.raf(time);
  //     rafId = requestAnimationFrame(raf);
  //   }
  //   rafId = requestAnimationFrame(raf);

  //   return () => {
  //     cancelAnimationFrame(rafId);
  //     lenis.destroy();
  //   };
  // }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 300);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const privacy = ["Encrypted Calls", "No Tracking", "No Data Collection"];

  const goodstuff = [
    {
      title: "Rooms & Friends",
      desc: "Chat with friends or join a room to connect in one place.",
      component: (
        <div className=" relative h-32 w-full flex items-center justify-center">
          <RoomItemMock
            name="Projects"
            id="4567"
            className="scale-110 w-[210px] absolute -top-3 left-[-3%] z-10"
          />
          <RoomItemMock
            name="Roooom"
            id="1345"
            className="scale-110 w-[210px] absolute -top-3 right-[-3%] z-10"
          />
          <FriendItemMock
            name="Pika"
            avatar="/assets/pi.png"
            message="You: pika pika!"
            className="scale-110 h-16 w-[210px] absolute top-24 left-1 z-20"
          />
          <FriendItemMock
            name="Charm"
            avatar="/assets/ch.png"
            message="im burning"
            className="scale-110 h-16 w-[210px] absolute top-24 right-1 z-20"
          />
        </div>
      ),
    },
    {
      title: "Calls",
      desc: "Start individual or group audio & video calls and switch between them seamlessly.",
      component: (
        <div className=" flex items-center justify-center">
          <ActiveCallMock className="w-[400px] h-[150px] pt-10 scale:150" />
        </div>
      ),
    },
    {
      title: "Notifications",
      desc: "Stay updated with real-time notifications and never miss a beat.",
      component: (
        <div className="flex flex-col scale-[1.2] items-center justify-center">
          <MessageNotificationMock
            name="Bulb"
            avatar="/assets/bu.png"
            message="Hi, what's up?"
            room="pokemon"
            stacked={true}
            className="w-96 mt-8"
          />
        </div>
      ),
    },
  ];

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
            speed={0.5}
            transparent
            edgeFade={0.1}
          />
        </div>

        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
            scrolled
              ? "bg-[#0a080b] border-b border-white/10 py-0 shadow-2xl"
              : "bg-transparent border-transparent py-2"
          }`}
        >
          <div className="flex justify-between items-center px-6 py-4 max-w-6xl w-[90%] mx-auto">
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl text-white ${galindo.className} font-medium tracking-wide`}
              >
                Portal
              </span>
            </div>
            <Show when="signed-out">
              <SignInButton>
                <button className="flex items-center justify-center px-4 py-2 text-sm rounded-lg bg-white text-black hover:bg-gray-200">
                  Sign in with Google
                  <Image
                    className="ml-2"
                    src="/assets/google-logo.png"
                    alt="Google"
                    width={18}
                    height={18}
                  ></Image>
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <SignOutButton>
                  <button className="px-3 py-2 text-sm rounded-lg transition-all border border-white/5 text-gray-300 hover:text-white">
                    Sign Out
                  </button>
                </SignOutButton>
                {scrolled && (
                  <button
                    onClick={handleEnter}
                    className="px-4 py-2 text-sm rounded-lg transition-all bg-white text-black hover:bg-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
                  >
                    Enter
                  </button>
                )}
              </div>
            </Show>
          </div>
        </motion.div>

        <section className="relative min-h-screen mt-12 p-6 text-white flex flex-col items-center">
          <div className="text-center relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className=" text-gray-300 text-6xl mt-36"
            >
              Realtime Conversation
              <br />
              Without Friction
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={handleEnter}
              className="cursor-pointer mt-8 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-black rounded-xl  text-sm "
            >
              Enter
            </motion.button>
          </div>

          <div
            ref={dashboardRef}
            className="relative w-full flex justify-center mt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-[80%] rounded-5xl overflow-hidden"
            >
              <Image
                src="/assets/ss1.png"
                alt="ss"
                width={1000}
                height={600}
                className="w-full h-full object-contain rounded-[10px]"
              />
            </motion.div>
          </div>
        </section>
      </div>
      <section className="relative mt-48 text-white overflow-hidden">
        <h2 className="text-center text-5xl md:text-6xl font-semibold flex justify-center gap-4">
          <motion.span
            initial={{ opacity: 0, x: 100, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.8,
            }}
            viewport={{ once: true }}
          >
            Privacy
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 100, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              duration: 0.8,
              delay: 0.2,
            }}
            viewport={{ once: true }}
          >
            First
          </motion.span>
        </h2>

        <div className="mt-20 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {privacy.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              viewport={{ once: true }}
              className="relative h-64 w-82 bg-[#0a0a0d] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] rounded-3xl flex items-center justify-center text-center px-12"
            >
              <span className="text-xl md:text-xl  text-white leading-snug max-w-[160px]">
                {text}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
      <section className=" text-white px-6 mt-[200px]">
        <div className="max-w-6xl mx-auto flex">
          <div className="w-1/2">
            <div className="sticky top-48">
              <h2 className="text-5xl md:text-6xl font-semibold leading-tight">
                The Good <br /> Stuff
              </h2>
            </div>
          </div>

          <div className="w-1/2 py-0">
            <div className="relative rounded-[40px] bg-white/[0.01] p-3">
              <div
                className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent, black, transparent)",
                  maskImage:
                    "linear-gradient(to bottom, transparent, black, transparent)",
                }}
              />

              <div className="flex flex-col gap-3">
                {goodstuff.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      delay: i * 0.1,
                    }}
                    viewport={{ once: true }}
                    className="relative rounded-[32px] bg-[#0a0a0d]"
                  >
                    <div
                      className="absolute inset-0 rounded-[32px] border border-white/10 pointer-events-none"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent, black, transparent)",
                        maskImage:
                          "linear-gradient(to bottom, transparent, black, transparent)",
                      }}
                    />

                    <div className="overflow-hidden relative p-12 min-h-[350px] flex flex-col">
                      <div className="flex flex-col justify-start">
                        <h3 className="text-2xl font-medium text-white tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-4 text-lg text-[#888] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center w-full">
                        {item.component}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative mt-36 h-screen text-white overflow-hidden flex items-center justify-center">
        <div
          className=" relative w-full max-w-5xl h-screen flex items-center justify-center"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle, black 35%, transparent 85%)",
            maskImage: "radial-gradient(circle, black 35%, transparent 85%)",
          }}
        >
          <div className="select-none w-[224px] absolute top-[32%] left-[18%] z-0 hidden md:block">
            <RoomItemMock />
          </div>
          <div className="select-none absolute top-[30%] -right-[12%] z-0 hidden md:block">
            <FriendItemMock />
          </div>
          <div className="select-none absolute top-[17%] -left-[5%] z-0 hidden md:block">
            <PendingRequestMock />
          </div>
          <div className="select-none absolute top-[54%] -left-[8%] z-0 hidden md:block">
            <CallWidgetMock />
          </div>
          <div className="select-none absolute top-[29%] right-[11%] -translate-y-1/2 z-0 hidden md:block">
            <RoomMembersMock />
          </div>

          <div className="select-none absolute top-[24%] left-[18%] z-0 hidden md:block">
            <ProfileButtonMock />
          </div>
          <div className="select-none absolute top-[41%] -left-[12%] z-0 hidden md:block">
            <MessageNotificationMock />
          </div>
          <div className="select-none absolute top-[41%] -right-[12%] z-0 hidden md:block">
            <CallEndedNotificationMock />
          </div>
          <div className="select-none absolute bottom-[25%] left-1/2 -translate-x-1/2 z-0 hidden md:block">
            <ChatInputBarMock bg="bg-white" />
          </div>

          <div className="select-none absolute top-[59%] right-[4%] z-0 hidden lg:block">
            <UserProfilePopupMock />
          </div>
          <div className="select-none absolute top-[15%] left-[41%] z-0 hidden lg:block">
            <RecentCallItemMock />
          </div>

          <div className="select-none absolute top-[53%] left-[17%] z-0 hidden md:block">
            <AvatarStatusMock />
          </div>

          <div className="select-none absolute top-[61%] left-[6%] z-0 hidden md:block">
            <div className="mt-2">
              <div className="mt-2 flex py-2.5 px-6 justify-center w-full bg-[#242424] relative items-center gap-2 rounded-lg text-xs">
                <StatusIndicator
                  className="relative w-2 h-2"
                  isOnline={true}
                  isAway={false}
                />
                <span className="text-green-500">Online</span>
              </div>
            </div>
          </div>

          <div className="absolute top-[17%] left-[19%] z-0 text-4xl select-none hidden md:block">
            👀
          </div>
          <div className="absolute top-[17%] left-[23%] z-0 text-4xl select-none hidden md:block">
            😁
          </div>

          <span className="selection:bg-white/10 text-5xl md:text-7xl font-semibold leading-tight text-center relative z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            Beautifully Crafted
            <br />
            Interface
          </span>
        </div>
      </section>
      <section className="relative py-24 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-semibold text-center mb-6 tracking-tight">
            Basics Covered
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 min-h-[500px]">
            <div className="md:col-span-2 row-span-2 bg-[#0f0f0f] rounded-[24px] p-8 md:p-12 overflow-hidden justify-center items-end flex flex-col relative group">
              <div
                className="absolute inset-0 rounded-[24px] border border-white/10 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                }}
              />

              <div className="relative z-10">
                <h3 className="text-xl font-medium text-white text-end">
                  Flawless On
                  <br /> Mobile Too
                </h3>
              </div>

              <div className="absolute -bottom-[350px] left-6 rounded-xl">
                <Image
                  src="/assets/m1.png"
                  alt="Mobile ss 1"
                  width={300}
                  height={200}
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-[470px] left-6 rounded-xl">
                <Image
                  src="/assets/m2.png"
                  alt="Mobile ss 2"
                  width={300}
                  height={200}
                  className="object-contain rounded-xl"
                />
              </div>
            </div>
            <div className="md:col-span-2 row-span-1 bg-[#0f0f0f] rounded-[24px] p-8 flex flex-col group overflow-hidden relative">
              <div
                className="absolute inset-0 rounded-[24px] border border-white/10 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                }}
              />
              <div className="space-y-4 mb-6 relative z-10">
                <h3 className="text-xl font-medium text-white">Mentions</h3>
              </div>
              <div className="flex flex-col items-center justify-start relative h-32">
                <div className="flex items-center mb-4 text-sm gap-2">
                  {" "}
                  <span className="bg-[#ff9800] text-black rounded-sm px-1">
                    @Chip
                  </span>
                  <span className="bg-[#7ee0d3] text-black rounded-sm px-1">
                    @Squir
                  </span>
                  <span className="bg-[#f0e150] text-black rounded-sm px-1">
                    @Pika
                  </span>
                </div>
                <MentionsAutocompleteMock className="scale-110 z-20" />
              </div>
            </div>

            <div className="flex-1 bg-[#0f0f0f] rounded-[24px] p-8 flex flex-col justify-between group relative overflow-hidden">
              <div
                className="absolute inset-0 rounded-[24px] border border-white/10 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                }}
              />
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl font-medium text-white">
                  Typing Indicators
                </h3>
              </div>
              <div className="">
                <div className="absolute top-[38%] left-[60px] scale-110 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-[12px] border border-[#2a2a2a] overflow-hidden flex-shrink-0">
                    <Image
                      src="/assets/sq.png"
                      width={40}
                      height={40}
                      alt="Chip"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px]  text-gray-400">Chip</span>
                    <span className="text-xs text-white/90">
                      What you doing?
                    </span>
                  </div>
                </div>

                <TypingIndicatorMock
                  name="Pika"
                  avatar="/assets/pi.png"
                  className="absolute top-[64%] left-[60px] scale-110"
                />
              </div>
            </div>

            <div className="flex-1 bg-[#0f0f0f] rounded-[24px] p-8 flex flex-col justify-between group relative overflow-hidden">
              <div
                className="absolute inset-0 rounded-[24px] border border-white/10 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                  maskImage:
                    "linear-gradient(to bottom, black 0%, transparent 15%)",
                }}
              />
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl font-medium text-white">
                  Realtime Presence
                </h3>
                <div className="select-none absolute top-[61%] left-[6%] z-0 hidden md:block">
                  <div className="mt-2"></div>
                </div>
                <div className="flex flex-col scale-110 items-center justify-center pt-4">
                  <div className="mt-2 flex py-2.5 px-6 justify-center w-[80%] bg-[#242424] relative items-center gap-2 rounded-lg text-xs">
                    <StatusIndicator
                      className="relative w-2 h-2"
                      isOnline={true}
                      isAway={false}
                    />
                    <span className="text-green-500">Online</span>
                  </div>
                  <div className="mt-2 flex py-2.5 px-6 justify-center w-[80%] bg-[#242424] relative items-center gap-2 rounded-lg text-xs">
                    <StatusIndicator
                      className="relative w-2 h-2"
                      isOnline={false}
                      isAway={true}
                    />
                    <span className="text-yellow-400">Away</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-3xl mb-6 flex flex-col ">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight leading-[1.05]">
                Theme As You Wish
              </h2>
              <p className="text-[#888] text-xs max-w-md mx-auto leading-relaxed">
                except light theme, to protect your eyes :)
              </p>
              <div className="mt-8 flex flex-col items-center">
                <div
                  onClick={() => setColorDialog((v) => !v)}
                  className="flex items-center gap-4 bg-white/5 py-2.5 px-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <span className="text-gray-300 text-sm select-none group-hover:text-white transition-colors">
                    Choose Accent Color
                  </span>
                  <div className="w-6 h-6 rounded-lg shadow-lg border bg-theme-accent border-white/20"></div>
                </div>
                {colorDialog &&
                  createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setColorDialog(false)}
                      />
                      <div
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] p-4 bg-[#0a080b] border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HexColorPicker color={color} onChange={setColor} />
                        <button
                          onClick={() => setColorDialog(false)}
                          className="w-full mt-4 py-2 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </>,
                    document.body,
                  )}
              </div>
            </div>

            <div className="w-full relative group">
              <div className="relative flex items-center justify-center">
                <FullAppMock className="scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-[1] origin-center" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="h-96 w-full bg-white relative">
        <div className="absolute inset-0 z-[1000] overflow-hidden">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#000000"
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.3}
            transparent
            edgeFade={0.25}
          />
        </div>
      </section>
    </div>
  );
}
