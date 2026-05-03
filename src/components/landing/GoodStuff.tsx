"use client";

import { motion } from "framer-motion";
import {
  RoomItemMock,
  FriendItemMock,
  ActiveCallMock,
  MessageNotificationMock,
} from "@/components/mocks";

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
    title: "Voice & Video Calls",
    desc: "Make individual or group calls and switch between them seamlessly.",
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

export function GoodStuff() {
  return (
    <section className=" text-white px-6 mt-[200px]">
      <div className="max-w-6xl mx-auto flex">
        <div className="w-1/2">
          <div className="sticky top-48">
            <h2 className="text-5xl md:text-6xl leading-tight">
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
  );
}
