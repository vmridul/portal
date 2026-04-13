import { useEffect, useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import { formatToIST } from "@/lib/utils/date";
import { useColor } from "@/contexts/colorContext";
import { MediaDialog } from "./mediaDialog";
import { useRoom } from "@/src/hooks";
import { useSearchMessages } from "@/src/hooks";

interface SearchResult {
  _id: string;
  sender?: { username?: string };
  content?: string;
  _creationTime: number;
}

export default function TopBar({ room_id }: { room_id: string }) {
  const { room } = useRoom(room_id);
  const [query, setQuery] = useState("");
  const { results: searchResults, isLoading } = useSearchMessages({ roomId: room_id, query });

  const [selectedResult, setSelectedResult] = useState(0);
  const { color } = useColor();
  const [mediaDialog, setMediaDialog] = useState(false);

  useEffect(() => {
    const close = () => {
      setQuery("");
      setMediaDialog(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleSearchClick = (index: number, id: string, sent_at: number) => {
    setSelectedResult(index);
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
          className="flex px-3 min-w-0 md:max-w-[50%] flex-1 py-1 items-center text-white/60 rounded-[6px] bg-theme-surface overflow-hidden"
        >
          <Search className="flex-none w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search messages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-2 py-1 min-w-0 w-full bg-transparent outline-none placeholder-white/40"
          />
        </div>
        {searchResults.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="select-none absolute top-12 md:left-2 left-0 max-h-[200px] overflow-scroll text-sm w-full md:w-[49%] bg-theme-base rounded-[8px] p-2"
          >
            {searchResults.map((result, index) => (
              <div
                key={result._id}
                id={`result-${index}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSearchClick(index, result._id, result._creationTime);
                }}
                className={`hover:bg-[white/10] ${
                  selectedResult == index ? "bg-theme-hover" : ""
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
        <div className="flex items-center flex-none gap-2 ml-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setMediaDialog(true);
            }}
            className="flex-none w-8 select-none h-8 p-2 cursor-pointer rounded-xl flex items-center justify-center hover:bg-theme-hover"
          >
            <ImageIcon className="w-4 h-4 text-white" />
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
    </div>
  );
}