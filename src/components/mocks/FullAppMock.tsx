import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Add01Icon,
  UserAdd01Icon,
  Home01Icon,
  Menu01Icon,
  Search01Icon,
  Image01Icon,
  InformationCircleIcon,
  CallIcon,
} from "@hugeicons/core-free-icons";
import { RoomItemMock } from "./RoomItemMock";
import { ChatMessageMock } from "./ChatMessageMock";
import { ChatInputBarMock } from "./ChatInputBarMock";
import { CallWidgetMock } from "./CallWidgetMock";
import { RoomMembersMock } from "./RoomMembersMock";
import { ProfileButtonMock } from "./ProfileButtonMock";

export const FullAppMock = ({ className }: { className?: string }) => (
  <div
    className={`flex aspect-video w-[1200px] overflow-hidden bg-[#0a080b] rounded-2xl border border-white/10 ${className}`}
  >
    {/* Left Sidebar */}
    <div className="w-[240px] bg-theme-surface border-theme-border border-r select-none flex flex-col py-2 px-1 md:px-1 text-white items-center font-sans">
      <div className="flex flex-col gap-1 mt-2 text-sm items-center w-full">
        <div className="bg-theme-hover text-white ease-in-out duration-200 flex items-center px-3 gap-2 w-[224px] py-2 rounded-[8px] cursor-default">
          <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
          <span>Friends</span>
        </div>
        <div className="ease-in-out bg-theme-surface hover:bg-theme-hover text-gray-200 hover:text-white duration-200 flex items-center px-3 gap-2 w-[224px] py-2 rounded-[8px] cursor-default">
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
          <span>Create Room</span>
        </div>
        <div className="ease-in-out bg-theme-surface hover:bg-theme-hover text-gray-200 hover:text-white duration-200 flex items-center px-3 gap-2 w-[224px] py-2 rounded-[8px] cursor-default">
          <HugeiconsIcon icon={UserAdd01Icon} className="w-4 h-4" />
          <span>Join Room</span>
        </div>
      </div>

      <div className="mt-3 flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <div className="flex justify-between items-center px-3 text-[#aaaaaa] mb-2">
          <span className="text-xs font-medium">Rooms</span>
          <div className="bg-theme-hover rounded-[8px] px-2 py-1 flex text-white/60 text-[10px] items-center gap-1">
            <HugeiconsIcon icon={Home01Icon} className="w-3 h-3" />3
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 px-1">
          <RoomItemMock
            name="Projects"
            id="portal"
            className="w-full bg-theme-hover border-none shadow-none mt-1"
          />
          <RoomItemMock
            name="Design"
            id="design"
            className="w-full bg-transparent border-none shadow-none opacity-60 mt-1"
          />
          <RoomItemMock
            name="Engineering"
            id="eng"
            className="w-full bg-transparent border-none shadow-none opacity-60 mt-1"
          />
        </div>
      </div>

      <div className="mt-auto w-full flex flex-col p-1 bg-theme-surface/50">
        <CallWidgetMock
          name="Projects"
          className="w-full bg-theme-hover border-none shadow-none mb-2"
        />
        <ProfileButtonMock
          name="Mridul"
          avatar="/assets/sq.png"
          className="w-full"
        />
      </div>
    </div>

    {/* Main Area (Copied from production TopBar.tsx and ChatUI.tsx) */}
    <div className="flex-1 flex flex-col min-w-0 bg-theme-base">
      {/* Top Bar */}
      <div className="h-12 z-[60] relative text-white/60 text-sm px-3 w-full justify-between flex items-center gap-2 bg-theme-surface border-theme-border border-b">
        <div className="relative flex-1 max-w-[50%] min-w-0">
          <div className="flex px-3 py-1 items-center text-gray-400 rounded-[6px] bg-theme-base overflow-hidden">
            <HugeiconsIcon
              icon={Search01Icon}
              className="flex-none w-4 h-4 text-gray-400"
            />
            <div className="px-2 py-1 text-gray-400">Search messages</div>
          </div>
        </div>
        <div className="flex items-center flex-none gap-2 ml-2">
          <div className="w-8 h-8 p-2 cursor-default rounded-xl flex items-center justify-center hover:bg-theme-hover">
            <HugeiconsIcon
              icon={Image01Icon}
              className="w-4 h-4 text-gray-300"
            />
          </div>
          <div className="w-8 h-8 p-2 cursor-default rounded-xl flex items-center justify-center hover:bg-theme-hover relative">
            <HugeiconsIcon icon={CallIcon} className="w-4 h-4 text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="w-8 h-8 p-2 cursor-default rounded-xl flex items-center justify-center hover:bg-theme-hover">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="w-4 h-4 text-white"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-0 space-y-0 overflow-hidden">
        <ChatMessageMock
          name="Pika"
          avatar="/assets/pi.png"
        />
        <ChatMessageMock
          name="Charm"
          avatar="/assets/ch.png"
          showDate={false}
        />
        <ChatMessageMock
          name="Me"
          avatar="/assets/sq.png"
          showDate={false}
        />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 w-full flex justify-center pb-4 pt-0 px-4">
        <ChatInputBarMock />
      </div>
    </div>

    {/* Right Sidebar */}
    <div className="w-[280px] bg-theme-surface border-theme-border border-l flex flex-col overflow-hidden text-white select-none">
      <div className="relative w-[268px] flex-none flex items-center justify-between mt-2 rounded-[8px] py-2 px-3 mx-1">
        <div className="flex gap-3 items-center">
          <div className="rounded-[12px] font-medium text-lg text-[#585858] flex items-center justify-center bg-white opacity-90 w-10 h-10">
            P
          </div>
          <div className="flex flex-col items-start">
            <span className="truncate max-w-[120px] text-sm">Projects</span>
            <span className="text-white/40 text-[10px]">ID: 6543</span>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center hover:bg-theme-hover rounded-[12px]">
          <HugeiconsIcon icon={Menu01Icon} className="w-4 h-4 text-white/90" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-3 ">
          <div className="flex justify-between items-center  text-white/40 px-1"></div>
          <RoomMembersMock className="bg-transparent border-none p-0" />
        </div>
      </div>
    </div>
  </div>
);
