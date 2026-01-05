"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "./skeleton";
import { PaintRoller, Search } from "lucide-react";
import { formatToIST } from "@/app/actions/formatToIST";
import { useColor } from "@/contexts/colorContext";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

export default function TopBar({ room_id }: { room_id: string }) {
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState(0);

  const { color, setColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const { data, error } = await supabase
      .from("Messages")
      .select("id, content, sent_at, sender:Users(username)")
      .eq("room_id", room_id)
      .ilike("content", `%${query}%`)
      .order("sent_at", { ascending: false })
      .or("type.is.null,type.eq.text")
      .limit(20);

    if (error) throw error;

    setSearchResults(data ?? []);
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [query, room_id]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      const { data, error } = await supabase
        .from("Rooms")
        .select("room_name")
        .eq("room_id", room_id)
        .maybeSingle();

      if (error) throw error;
      setRoomDetails(data);
    };
    fetchRoomDetails();
  }, [room_id]);

  useEffect(() => {
    const close = () => {
      setQuery("");
      setColorDialog(false);
      setSearchResults([]);
    };
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  const handleSearchClick = (index: number, id: string, sent_at: Date) => {
    setSelectedResult(index);
    window.dispatchEvent(
      new CustomEvent("jump-to-msg", { detail: { id, sent_at } })
    );
  };

  useEffect(() => {
    document.getElementById(`result-${selectedResult}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedResult]);

  return (
    <div className="">
      {!roomDetails ? (
        <Skeleton className="h-[32px] ml-2 w-[884px] mt-2 rounded-[6px]" />
      ) : (
        <div className="z-40 relative overflow-visible text-white/60 text-sm px-10 md:px-2 w-full justify-between flex items-center bg-[#080f17] h-10 border-[#322b45] border-b">
          <div
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedResult((prev) =>
                  Math.min(prev + 1, searchResults.length - 1)
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedResult((prev) => Math.max(prev - 1, 0));
              }
              if (e.key === "Enter" && searchResults.length > 0) {
                e.preventDefault();
                const result = searchResults[selectedResult];
                handleSearchClick(selectedResult, result.id, result.sent_at);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex px-3 items-center text-white/60 rounded-[6px] bg-[#151323]"
          >
            <Search className="w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search messages"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-2 py-1 w-48 md:w-72 bg-transparent outline-none placeholder-white/40"
            />
          </div>
          {searchResults.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="select-none absolute top-10 max-h-[200px] overflow-scroll text-sm left-2 w-[328px] bg-[#080f17] rounded-[8px] p-2"
            >
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  id={`result-${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearchClick(index, result.id, result.sent_at);
                  }}
                  className={`hover:bg-[white/10] ${selectedResult == index ? "bg-[#211f31]" : ""
                    } flex items-center hover:bg-[#211f31] justify-between rounded-[6px] px-4 p-2 cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">
                      {result.sender?.username}:
                    </span>
                    <span className="text-white/60 font-medium">
                      {result.content}
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">
                    {formatToIST(result.sent_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setColorDialog((v) => !v);
            }}
            className="w-7 select-none  h-7 px-1 cursor-pointer rounded-full flex items-center justify-center hover:bg-[#313131]"
          >
            <PaintRoller className="w-4 h-4 text-white/60" />
          </div>
          {colorDialog &&
            createPortal(
              <div
                className="absolute md:scale-100 scale-[80%] top-8 md:top-12 right-0 md:right-[290px] z-[9999]"
                onClick={(e) => e.stopPropagation()}
              >
                <HexColorPicker color={color} onChange={setColor} />
              </div>,
              document.body
            )}
        </div>
      )}
    </div>
  );
}
