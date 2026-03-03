import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "./skeleton";
import { PaintRoller, Search, Image as ImageIcon } from "lucide-react";
import { formatToIST } from "@/app/actions/formatToIST";
import { useColor } from "@/contexts/colorContext";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";
import { MediaDialog } from "./mediaDialog";

export default function TopBar({ room_id }: { room_id: string }) {
  const roomDetails = useQuery(api.roomQueries.getRoomDetails, { room_id });
  const [query, setQuery] = useState("");
  const rawSearchResults = useQuery(api.messages.searchMessages, { room_id, query });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const { color, setColor } = useColor();
  const [colorDialog, setColorDialog] = useState(false);
  const [mediaDialog, setMediaDialog] = useState(false);

  useEffect(() => {
    if (query.trim() && rawSearchResults) {
      setSearchResults(rawSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [rawSearchResults, query]);

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

  const handleSearchClick = (index: number, id: string, sent_at: number) => {
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
        <Skeleton className="h-[32px] ml-2 md:w-[884px] w-full mt-2 rounded-[6px]" />
      ) : (
        <div className="z-[2000] relative overflow-visible text-white/60 text-sm px-10 md:px-2 w-full justify-between flex items-center bg-theme-base h-10 border-theme-border border-b">
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
                handleSearchClick(selectedResult, result._id, result._creationTime);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex px-3 shrink min-w-10 items-center text-white/60 rounded-[6px] bg-theme-surface"
          >
            <Search className="flex-none w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search messages"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-2 py-1 w-full max-w-[288px] min-w-0 bg-transparent outline-none placeholder-white/40"
            />
          </div>
          {searchResults.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="select-none absolute top-10 max-h-[200px] overflow-scroll text-sm left-2 w-[328px] bg-theme-base rounded-[8px] p-2"
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
                    <span className="text-white/60 font-medium">
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
          <div className="flex items-center flex-none gap-2 ml-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setColorDialog((v) => !v);
              }}
              className="flex-none w-7 select-none h-7 cursor-pointer rounded-full flex items-center justify-center hover:bg-[#313131]"
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
            <div
              onClick={(e) => {
                e.stopPropagation();
                setMediaDialog(true);
              }}
              className="flex-none w-7 select-none h-7 cursor-pointer rounded-full flex items-center justify-center hover:bg-[#313131]"
            >
              <ImageIcon className="w-4 h-4 text-white/60" />
            </div>
            {mediaDialog && (
              <MediaDialog
                room_id={room_id}
                type="room"
                setMediaDialog={setMediaDialog}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
