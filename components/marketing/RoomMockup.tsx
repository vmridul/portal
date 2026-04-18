"use client";

import React from "react";
import {
  Users, Plus, UserPlus, HouseIcon, Menu, Search,
  Image as ImageIcon, Info, Send, Moon, Plus as PlusIcon,
  BadgeX, LogOut
} from "lucide-react";
import { Galindo, Lexend } from "next/font/google";
import Image from "next/image";

const galindo = Galindo({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
});

// Hardcoded colors for the mockup
const COLORS = {
  BASE: "#0b071a",
  SURFACE: "#07060f",
  HOVER: "#160c41",
  BORDER: "#1b1533",
  ACCENT: "#4a31b0",
  TEXT_MUTED: "#aaaaaa",
  MSG_TEXT: "#ffffff",
  MSG_NAME: "#9ca3af", // text-gray-400
  MSG_TIME: "#6b7280", // text-gray-500
};

// Mock data with bursting logic representation
const MOCK_MESSAGES = [
  {
    id: "1",
    sender: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content: "Hey team! How's the new UI coming along?",
    time: "10:30 AM",
    isCurrentUser: false,
    showMeta: true,
  },
  {
    id: "1-2",
    sender: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content: "I've been testing the latest build and the speed is incredible.",
    time: "10:30 AM",
    isCurrentUser: false,
    showMeta: false,
  },
  {
    id: "2",
    sender: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mridul",
    content: "It's looking great! Just finishing up the room layout.",
    time: "10:31 AM",
    isCurrentUser: true,
    showMeta: true,
  },
  {
    id: "2-2",
    sender: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mridul",
    content: "I've also fixed that hostname issue we were having with foreign avatars.",
    time: "10:31 AM",
    isCurrentUser: true,
    showMeta: false,
  },
  {
    id: "3",
    sender: "Sarah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "The performance is much better now with virtualization. I can scroll through thousands of messages without any lag.",
    time: "10:32 AM",
    isCurrentUser: false,
    showMeta: true,
  },
  {
    id: "4",
    sender: "Sarah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "I'll push the final assets by EOD. 🚀",
    time: "10:33 AM",
    isCurrentUser: false,
    showMeta: false,
  },
  {
    id: "7",
    sender: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mridul",
    content: "I'll do a final pass on the mobile responsiveness tonight.",
    time: "10:38 AM",
    isCurrentUser: true,
    showMeta: true,
  },
  {
    id: "8",
    sender: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    content: "Perfect. We're looking good for launch. 🚀",
    time: "10:40 AM",
    isCurrentUser: false,
    showMeta: true,
  },
];

const MOCK_ROOMS = [
  { id: "4821", name: "General", active: true },
  { id: "9231", name: "Design Updates", active: false },
  { id: "1054", name: "Engineering", active: false },
];

const MOCK_MEMBERS = [
  { id: "u1", name: "Alex", role: "owner", status: "online", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  { id: "u2", name: "Sarah", role: "member", status: "away", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: "u3", name: "Mridul", role: "member", status: "online", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mridul" },
];

export function RoomMockup() {
  return (
    <div
      style={{ backgroundColor: COLORS.BASE, borderColor: COLORS.BORDER }}
      className="flex h-full w-full overflow-hidden rounded-[18px] border text-white shadow-2xl  relative"
    >
      {/* Left Sidebar */}
      <div
        style={{
          backgroundColor: COLORS.SURFACE,
          borderRightColor: COLORS.BORDER
        }}
        className="w-64 flex-shrink-0 border-r flex flex-col py-2 px-4 select-none lg:flex hidden relative"
      >
        <div className="flex flex-col gap-1 mt-2 text-sm items-center">
          <button
            className="ease-in-out text-white/90 hover:bg-[#160c41] duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </button>
          <button
            className="ease-in-out text-white/90 hover:bg-[#160c41] duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room</span>
          </button>
          <button
            className="ease-in-out text-white/90 hover:bg-[#160c41] duration-200 flex items-center px-3 gap-2 w-56 py-2 rounded-[8px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex justify-between items-center ml-3 text-[#aaaaaa]">
            <span className="text-xs">Rooms</span>
            <div
              className="bg-[#160c41] rounded-[8px] px-2 py-1 flex text-white/60 text-xs items-center gap-0.5"
            >
              <HouseIcon className="w-3 h-3" />
              3
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {MOCK_ROOMS.map(room => (
              <div
                key={room.id}
                className={`cursor-pointer flex items-center gap-3 mt-2 rounded-[8px] py-2 px-2 transition-all duration-200 ${room.active ? 'bg-[#160c41]' : 'hover:bg-[#160c41]'}`}
              >
                <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10 flex-shrink-0">
                  {room.name[0]}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate max-w-[100px] text-sm font-medium">{room.name}</span>
                  <span className="text-[#aaaaaa] text-[10px] truncate max-w-[150px]">ID: {room.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile part - MATCHED EXACTLY */}
        <div
          className="absolute bottom-2 left-2 flex justify-between items-center cursor-pointer hover:bg-[#160c41] ease-in-out rounded-xl w-60 px-2 py-2"
        >
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Image unoptimized src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mridul" alt="Me" width={40} height={40} className="rounded-[12px] w-10 h-10" />
              <div className="z-[9999] absolute right-0 bottom-0 w-[10px] h-[10px] opacity-90 bg-green-500 border border-[#59ab44] rounded-full" />
            </div>
            <div className="flex flex-col text-sm">
              <span className="truncate max-w-[120px]">Mridul</span>
              <span className="text-[#aaaaaa] font-extralight">vmridul...</span>
            </div>
          </div>
          <LogOut className="w-4 h-4 mr-1 text-white hover:text-gray-200 cursor-pointer" />
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{ backgroundColor: COLORS.BASE }}
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        {/* Top Bar */}
        <div
          style={{ backgroundColor: COLORS.SURFACE, borderBottomColor: COLORS.BORDER }}
          className="h-12 flex-none z-10 text-white/60 text-sm px-4 w-full justify-between flex items-center gap-2 border-b"
        >
          <div className="relative flex-1 max-w-[50%] min-w-0">
            <div
              style={{ backgroundColor: COLORS.BASE }}
              className="flex px-3 py-1 items-center text-gray-400 rounded-[6px] overflow-hidden"
            >
              <Search className="flex-none w-4 h-4 text-gray-400" />
              <input
                type="text"
                readOnly
                placeholder="Search messages"
                className="px-2 py-1 min-w-0 w-full bg-transparent outline-none placeholder-gray-400 cursor-default"
              />
            </div>
          </div>
          <div className="flex items-center flex-none gap-2 ml-2">
            <div
              className="w-8 h-8 p-2 hover:bg-[#160c41] cursor-pointer rounded-xl flex items-center justify-center transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </div>
            <div
              className="w-8 h-8 p-2 hover:bg-[#160c41] cursor-pointer rounded-xl flex items-center justify-center transition-colors"
            >
              <Info className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Chat UI */}
        <div className="flex-1 flex flex-col relative overflow-hidden h-[calc(100%-3rem)]">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto pt-4 space-y-0.5 no-scrollbar">
            {MOCK_MESSAGES.map((message) => (
              <div
                key={message.id}
                className="px-4 md:px-10 hover:bg-[#1b1533] group/row transition-colors duration-200"
              >
                <div className={`flex gap-3 ${message.showMeta ? "mt-4" : "mt-0"}`}>
                  {message.showMeta ? (
                    <Image
                      unoptimized
                      src={message.avatar}
                      alt={message.sender}
                      width={40}
                      height={40}
                      className="rounded-[12px] h-10 w-10 flex-none bg-theme-surface"
                    />
                  ) : (
                    <div className="w-10 flex-none" />
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    {message.showMeta && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ color: COLORS.MSG_NAME }} className="text-xs font-semibold">{message.sender}</span>
                        <span style={{ color: COLORS.MSG_TIME }} className="text-[10px]">{message.time}</span>
                      </div>
                    )}

                    <div className="relative group">
                      <div className="text-sm whitespace-pre-wrap text-white/90 leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <div className="px-4 md:px-10 mt-6 pb-6">
              <div className="flex items-center gap-2 pt-2">
                <div
                  style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER }}
                  className="w-8 h-8 rounded-[8px] border flex items-center justify-center"
                >
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce"></span>
                  </span>
                </div>
                <span className="text-xs text-white/50 italic font-light tracking-wide">Alex is typing...</span>
              </div>
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="px-4 py-6 bg-transparent mt-auto flex justify-center w-full">
            <div
              style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER }}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border w-full max-w-2xl shadow-xl"
            >
              <button className="p-2 rounded-xl hover:bg-[#160c41] transition-colors">
                <PlusIcon className="text-[#a89691] w-6 h-6" />
              </button>
              <div className="flex-1 px-3 py-2 text-white/40 text-sm italic">
                Press / to focus
              </div>
              <button
                style={{ backgroundColor: COLORS.ACCENT }}
                className="p-2 rounded-xl text-white hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{ backgroundColor: COLORS.SURFACE, borderLeftColor: COLORS.BORDER }}
        className="w-72 flex-shrink-0 border-l flex flex-col py-2 px-3 select-none xl:flex hidden"
      >
        <div className="relative flex items-center justify-between mt-2 rounded-[8px] py-1 px-2">
          <div className="flex gap-3 items-center">
            <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white w-10 h-10">
              G
            </div>
            <div className="flex flex-col">
              <span className="truncate max-w-[120px] font-medium">General</span>
              <span className="text-white/40 text-[10px]">ID: {MOCK_ROOMS[0].id}</span>
            </div>
          </div>
          <div className="w-8 h-8 flex items-center justify-center hover:bg-[#160c41] rounded-xl cursor-pointer">
            <Menu className="w-4 h-4 text-white/60" />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between px-2 mb-4">
            <span className="text-xs text-[#aaaaaa]">Members</span>
            <div
              className="bg-[#160c41] rounded-[8px] px-2 py-1 flex text-white/60 text-[10px] items-center gap-1"
            >
              <Users className="w-3 h-3" />
              3
            </div>
          </div>

          <div className="space-y-4 px-2">
            {MOCK_MEMBERS.map(member => (
              <div key={member.id} className="flex gap-3 items-center">
                <div className="relative">
                  <Image unoptimized src={member.avatar} alt={member.name} width={38} height={38} className="rounded-[12px] h-9 w-9" />
                  {member.status === 'online' ? (
                    <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-green-500 border border-[#59ab44] rounded-full" />
                  ) : member.status === 'away' ? (
                    <Moon fill="yellow" className="absolute text-yellow-400 right-0 bottom-0 w-[10px] h-[10px] opacity-90" />
                  ) : (
                    <div className="z-[9999] absolute right-0 bottom-0 w-2 h-2 bg-gray-500 border border-[#858585] rounded-full" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-[10px] text-[#aaaaaa] capitalize">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
