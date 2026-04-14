import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X, FileText } from "lucide-react";
import Image from "next/image";
import { useColor } from "@/contexts/colorContext";
import { Skeleton } from "./skeleton";
import { useMediaFiles } from "@/src/hooks";

interface MediaDialogProps {
  room_id: string;
  type: 'room' | 'direct';
  setMediaDialog: (v: boolean) => void;
}

export function MediaDialog({ room_id, type, setMediaDialog }: MediaDialogProps) {
  const { mediaFiles, isLoading } = useMediaFiles({ conversationId: room_id });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "files">("images");
  const { color, textColor } = useColor();

  const images = mediaFiles?.filter((m) => m.type?.startsWith("image/")) || [];
  const videos = mediaFiles?.filter((m) => m.type?.startsWith("video/")) || [];
  const files = mediaFiles?.filter((m) => !m.type?.startsWith("image/") && !m.type?.startsWith("video/")) || [];

  const activeData = activeTab === "images" ? images : activeTab === "videos" ? videos : files;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedIndex !== null) setSelectedIndex(null);
        else setMediaDialog(false);
      }
      if (selectedIndex !== null && activeData) {
        if (e.key === "ArrowLeft") setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
        if (e.key === "ArrowRight") setSelectedIndex((prev) => (prev !== null && prev < activeData.length - 1 ? prev + 1 : prev));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, activeData, setMediaDialog]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={() => setMediaDialog(false)}>
        <div className="bg-theme-surface border border-theme-border w-full max-w-4xl h-[80vh] rounded-[8px] p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-[260px] rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/95 transition-opacity flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedIndex(null)}>
          {activeData[selectedIndex].type?.startsWith("video/") ? (
            <video src={activeData[selectedIndex].file_url!} controls autoPlay className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          ) : (
            <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center pointer-events-none">
              <Image src={activeData[selectedIndex].file_url!} alt="media preview" fill className="object-contain pointer-events-auto" sizes="100vw" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }} className="absolute top-6 right-6 text-white/60 hover:text-white/80 bg-black/50 rounded-full p-2">
            <X className="w-6 h-6" />
          </button>
          {selectedIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }} className="absolute left-6 hover:bg-theme-hover text-white p-2 rounded-[8px]">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {selectedIndex < activeData.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }} className="absolute right-6 hover:bg-theme-hover text-white p-2 rounded-[8px]">
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" onClick={() => setMediaDialog(false)}>
        <div className="bg-theme-surface border border-theme-border w-full max-w-4xl h-[80vh] rounded-[8px] p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-row justify-between w-full items-start md:items-center mb-6 gap-4">
            <div className="flex space-x-2 bg-theme-base p-1 rounded-xl">
              {(["images", "videos", "files"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={activeTab === tab ? { backgroundColor: color, color: textColor } : {}} className={`px-4 py-1.5 rounded-[8px] text-sm transition-all ${activeTab === tab ? "shadow-md" : "text-white/50 hover:text-white/80"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => setMediaDialog(false)}><X className="w-6 h-6 text-white/50 hover:text-white" /></button>
          </div>

          <div className={`z-[9999] w-full flex-1 overflow-y-auto ${activeTab === "files" ? "flex flex-col gap-2" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[120px]"}`}>
            {activeData.length === 0 ? (
              <div className="col-span-full w-full flex h-[200px] items-center justify-center text-white/40">No {activeTab} shared yet.</div>
            ) : (
              activeData.map((media, index) => (
                activeTab === "files" ? (
                  <a key={media._id} href={media.file_url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-theme-base hover:bg-theme-hover border border-white/5 transition-all w-full md:w-1/2">
                    <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center"><FileText className="w-5 h-5 text-white/50" /></div>
                    <div className="flex flex-col overflow-hidden"><span className="text-sm text-white/90 font-medium truncate">{media.file_name || "Document"}</span><span className="text-xs text-white/40">Click to download</span></div>
                  </a>
                ) : (
                  <div key={media._id} onClick={() => setSelectedIndex(index)} className="relative group cursor-pointer bg-theme-base rounded-xl overflow-hidden border-white/5 border hover:border-opacity-100 border-opacity-10 transition-all aspect-square h-full w-full">
                    {media.type?.startsWith("video/") ? <video src={media.file_url!} preload="metadata" className="w-full h-full object-cover" /> : <Image src={media.file_url!} alt="media" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover opacity-85 group-hover:opacity-100 transition-opacity" />}
                    {media.type?.startsWith("video/") && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-8 h-8 rounded-full bg-black/50 flex items-center"><div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" /></div></div>}
                  </div>
                )
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}