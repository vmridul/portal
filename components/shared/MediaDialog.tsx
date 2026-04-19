import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, File02Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useColor } from "@/contexts/colorContext";
import { useMediaFiles } from "@/hooks";
import { useUIStore } from "@/store/uiStore";

import { MediaLightbox } from "@/components/shared/MediaLightbox";

export function MediaDialog() {
  const { modalData, closeModal, openLightbox } = useUIStore();
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "files">("images");
  const { color, textColor } = useColor();

  const room_id = modalData?.room_id as string | undefined;

  const { mediaFiles, isLoading } = useMediaFiles({ conversationId: room_id || "" });

  const images = mediaFiles?.filter((m) => m.type?.startsWith("image/")) || [];
  const videos = mediaFiles?.filter((m) => m.type?.startsWith("video/")) || [];
  const files = mediaFiles?.filter((m) => !m.type?.startsWith("image/") && !m.type?.startsWith("video/")) || [];

  const activeData = activeTab === "images" ? images : activeTab === "videos" ? videos : files;

  const handlePreview = (index: number) => {
    const mediaItems = activeData.map((m: any) => ({
      file_url: m.file_url,
      type: m.type,
      file_name: m.file_name
    }));
    openLightbox(mediaItems, index);
  };

  if (!room_id) return null;

  return (
    <>
      <MediaLightbox />

      <div className="bg-theme-surface border border-theme-border w-full max-w-4xl h-[80vh] rounded-[8px] p-6 flex flex-col items-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row justify-between w-full items-start md:items-center mb-6 gap-4">
          <div className="flex space-x-2 bg-theme-base p-1 rounded-xl">
            {(["images", "videos", "files"] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={activeTab === tab ? { backgroundColor: color, color: textColor } : {}} 
                className={`px-4 py-1.5 rounded-[8px] text-sm transition-all ${activeTab === tab ? "shadow-md" : "text-white/50 hover:text-white/80"}`}
                disabled={isLoading}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={closeModal}><HugeiconsIcon icon={Cancel01Icon} className="w-6 h-6 text-white/50 hover:text-white" /></button>
        </div>

        <div className={`w-full flex-1 overflow-y-auto ${activeTab === "files" ? "flex flex-col gap-2" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[120px]"}`}>
          {isLoading ? null : activeData.length === 0 ? (
            <div className="col-span-full w-full flex h-[200px] items-center justify-center text-white/40 font-light">No {activeTab} shared yet.</div>
          ) : (
            activeData.map((media, index) => (
              activeTab === "files" ? (
                <a key={media._id} href={media.file_url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-theme-base hover:bg-theme-hover border border-white/5 transition-all w-full md:w-1/2">
                  <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center"><HugeiconsIcon icon={File02Icon} className="w-5 h-5 text-white/50" /></div>
                  <div className="flex flex-col overflow-hidden"><span className="text-sm text-white/90 font-medium truncate">{media.file_name || "Document"}</span><span className="text-xs text-white/40">Click to download</span></div>
                </a>
              ) : (
                <div key={media._id} onClick={() => handlePreview(index)} className="relative group cursor-pointer bg-theme-base rounded-xl overflow-hidden border-white/5 border hover:border-opacity-100 border-opacity-10 transition-all aspect-square h-full w-full">
                  {media.type?.startsWith("video/") ? <video src={media.file_url!} preload="metadata" className="w-full h-full object-cover" /> : <Image src={media.file_url!} alt="media" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover opacity-85 group-hover:opacity-100 transition-opacity" />}
                  {media.type?.startsWith("video/") && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><div className="w-8 h-8 rounded-full bg-black/50 flex items-center"><div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" /></div></div>}
                </div>
              )
            ))
          )}
        </div>
      </div>
    </>
  );
}