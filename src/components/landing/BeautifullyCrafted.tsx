"use client";

import { motion, MotionValue } from "framer-motion";
import { RefObject } from "react";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  RoomItemMock,
  FriendItemMock,
  PendingRequestMock,
  CallWidgetMock,
  RoomMembersMock,
  ProfileButtonMock,
  MessageNotificationMock,
  CallEndedNotificationMock,
  ChatInputBarMock,
  UserProfilePopupMock,
  RecentCallItemMock,
  CallControlsMock,
  AvatarStatusMock,
} from "@/components/mocks";

interface BeautifullyCraftedProps {
  beautifullyCraftedRef: RefObject<HTMLElement | null>;
  beautifullyCraftedOpacity: MotionValue<number>;
  beautifullyCraftedBlur: MotionValue<string>;
}

export function BeautifullyCrafted({
  beautifullyCraftedRef,
  beautifullyCraftedOpacity,
  beautifullyCraftedBlur,
}: BeautifullyCraftedProps) {
  return (
    <section
      ref={beautifullyCraftedRef}
      className="relative mt-36 h-screen text-white overflow-hidden flex items-center justify-center"
    >
      <div
        className=" relative w-full max-w-5xl h-screen flex items-center justify-center"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle, black 35%, transparent 85%)",
          maskImage: "radial-gradient(circle, black 35%, transparent 85%)",
        }}
      >
        <motion.div
          style={{
            opacity: beautifullyCraftedOpacity,
            filter: beautifullyCraftedBlur,
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div className="select-none w-[224px] absolute top-[32%] left-[18%] z-0 md:block">
            <RoomItemMock />
          </div>
          <div className="select-none absolute md:top-[30%] top-36 -right-[12%] md:right-[11%] z-0  md:block">
            <FriendItemMock />
          </div>
          <div className="select-none absolute md:top-[17%] top-[58%] -left-[5%] z-0 md:block">
            <PendingRequestMock />
          </div>
          <div className="select-none absolute md:top-[54%] bottom-[7%] -left-8 md:-left-[8%] z-0 md:block">
            <CallWidgetMock />
          </div>
          <div className="select-none absolute md:top-[29%] top-[134px] -left-[40%] md:right-[11%] -translate-y-1/2 z-0  md:block">
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

          <div className="select-none absolute top-16 md:top-[74%] left-[32%] md:-left-[2%] z-0 lg:block">
            <CallControlsMock className="scale-90" />
          </div>

          <div className="select-none absolute top-[53%] -right-[14%] md:left-[17%] z-0  md:block">
            <AvatarStatusMock />
          </div>

          <div className="select-none absolute bottom-[11%] md:top-[61%] -right-[6%] md:left-[5%] z-0 md:block">
            <div className="mt-2">
              <div className="mt-2 flex py-2.5 px-6 max-w-28 justify-center bg-[#242424] relative items-center gap-2 rounded-lg text-xs">
                <StatusIndicator
                  className="relative w-2 h-2"
                  isOnline={true}
                  isAway={false}
                />
                <span className="text-green-500">Online</span>
              </div>
              <div className="mt-2 flex py-2.5 px-6 max-w-28 justify-center bg-[#242424] relative items-center gap-2 rounded-lg text-xs">
                <StatusIndicator
                  className="relative w-2 h-2"
                  isOnline={false}
                  isAway={true}
                />
                <span className="text-yellow-400">Away</span>
              </div>
            </div>
          </div>

          <div className="absolute top-[17%] left-[19%] z-0 text-4xl select-none hidden md:block">
            👀
          </div>
          <div className="absolute top-[17%] left-[23%] z-0 text-4xl select-none hidden md:block">
            😁
          </div>
        </motion.div>

        <span className="selection:bg-white/10 text-2xl md:text-7xl font-semibold leading-tight text-center relative z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          Beautifully Crafted
          <br />
          Interface
        </span>
      </div>
    </section>
  );
}
