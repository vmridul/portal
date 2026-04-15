import { useEffect, useState, useRef } from "react";
import { Search, Image as ImageIcon, Info } from "lucide-react";
import { formatToIST } from "@/lib/utils/date";
import { useColor } from "@/contexts/colorContext";
import { useRoom, useRoomMembers } from "@/hooks";
import { useSearchMessages } from "@/hooks";
import { useUserStore } from "@/store/useUserStore";
import { useOutsideClick } from "@/hooks/ui/useOutsideClick";

import { useUIStore } from "@/store/uiStore";

interface SearchResult {
  _id: string;
  sender?: { username?: string };
  content?: string;
  _creationTime: number;
}

export default function TopBar({ room_id }: { room_id: string }) {
  const { room } = useRoom(room_id);
  const members = useRoomMembers(room_id);
  const [query, setQuery] = useState("");
  const { results: searchResults, isLoading } = useSearchMessages({ conversationId: room_id, query });
  const user = useUserStore((s) => s.user);
  const searchRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar, isSidebarOpen, sidebarTab, setJumpedMessageId } = useUIStore();

  const [selectedResult, setSelectedResult] = useState(0);
  const { color } = useColor();

  useOutsideClick(searchRef, () => {
    setQuery("");
  });

  const owner = members?.find((m) => m.role === "owner");
  const ownerId = owner?.user_id ?? "";
  const ownerName = owner?.Users?.username ?? "";

  const handleSearchClick = (index: number, id: string, sent_at: number) => {
    setSelectedResult(index);
    setJumpedMessageId(id);
    window.dispatchEvent(
      new CustomEvent("jump-to-msg", { detail: { id, sent_at } }),
    );
  };

  useEffect(() => {
    document.getElementById(`result-${selectedResult}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedResult]);

  return (
    <div className="h-12">
      <div className="z-[2000] relative text-white/60 text-sm px-10 md:px-3 w-full justify-between flex items-center gap-2 bg-theme-base h-12 border-theme-border border-b">
        <div ref={searchRef} className="relative flex-1 md:max-w-[50%] min-w-0">
          <div
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedResult((prev) =>
                  Math.min(prev + 1, searchResults.length - 1),
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedResult((prev) => Math.max(prev - 1, 0));
              }
              if (e.key === "Enter" && searchResults.length > 0) {
                e.preventDefault();
                const result = searchResults[selectedResult];
                handleSearchClick(
                  selectedResult,
                  result._id,
                  result._creationTime,
                );
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex px-3 py-1 items-center text-gray-400 rounded-[6px] bg-theme-surface overflow-hidden"
          >
            <Search className="flex-none w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-2 py-1 min-w-0 w-full bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          {searchResults.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="select-none absolute top-10 left-0 max-h-[200px] overflow-scroll text-sm w-full bg-theme-base rounded-[8px] p-2 z-[3000] border border-theme-border shadow-xl"
            >
              {searchResults.map((result, index) => (
                <div
                  key={result._id}
                  id={`result-${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearchClick(index, result._id, result._creationTime);
                  }}
                  className={`hover:bg-[white/10] ${selectedResult == index ? "bg-theme-hover" : ""
                    } flex items-center hover:bg-theme-hover justify-between rounded-[6px] px-4 p-2 cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">
                      {result.sender?.username}:
                    </span>
                    <span className="text-white/60 max-w-[260px] font-medium">
                      {result.content}
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">
                    {formatToIST(result._creationTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center flex-none gap-2 ml-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar("media");
            }}
            className={`flex-none w-8 select-none h-8 p-2 cursor-pointer rounded-xl flex items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === "media" ? "bg-theme-hover" : "hover:bg-theme-hover"
              }`}
          >
            <ImageIcon className={`w-4 h-4 transition-colors ${isSidebarOpen && sidebarTab === "media" ? "text-white" : "text-white/60"}`} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar("info");
            }}
            className={`flex-none w-8 select-none h-8 p-2 cursor-pointer rounded-xl flex items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === "info" ? "bg-theme-hover" : "hover:bg-theme-hover"
              }`}
          >
            <Info className={`w-4 h-4 transition-colors ${isSidebarOpen && sidebarTab === "info" ? "text-white" : "text-white/60"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}