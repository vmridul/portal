import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, FileText } from "lucide-react";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";
import { useColor } from "@/contexts/colorContext";
import { formatFileSize } from "@/lib/utils/file";
import { useUIStore } from "@/store/uiStore";
import { MediaLightbox } from "@/components/shared/MediaLightbox";

interface SidebarMediaViewProps {
  mediaFiles: any[];
  isLoading: boolean;
}

export function SidebarMediaView({ mediaFiles, isLoading }: SidebarMediaViewProps) {
  const { color } = useColor();
  const { openLightbox } = useUIStore();
  const [mediaTab, setMediaTab] = useState<"images" | "videos" | "files">("images");

  const images = mediaFiles?.filter((m) => m.type?.startsWith("image/")) || [];
  const videos = mediaFiles?.filter((m) => m.type?.startsWith("video/")) || [];
  const files = mediaFiles?.filter((m) => !m.type?.startsWith("image/") && !m.type?.startsWith("video/")) || [];

  const activeMedia = mediaTab === "images" ? images : mediaTab === "videos" ? videos : files;

  const handlePreview = (media: any) => {
    // Only for images and videos
    if (mediaTab === "files") return;

    const mediaItems = activeMedia.map((m: any) => ({
      file_url: m.file_url,
      type: m.type,
      file_name: m.file_name
    }));

    const index = activeMedia.findIndex((m: any) => m._id === media._id);
    openLightbox(mediaItems, index >= 0 ? index : 0);
  };

  return (
    <div className="flex flex-col h-full">
      <MediaLightbox />
      {/* Media Tabs */}
      <div className="p-4 pb-0">
        <div className="bg-theme-surface text-sm text-gray-200 h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
          {(["images", "videos", "files"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMediaTab(tab)}
              className={`px-3 py-1 rounded-[6px] ${mediaTab === tab ? "bg-theme-hover" : "hover:bg-theme-hover"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {activeMedia.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">

            <p className="text-xs">No {mediaTab} yet</p>
          </div>
        ) : mediaTab === "files" ? (
          <div className="flex flex-col gap-2">
            {activeMedia.map((media: any) => (
              <a
                key={media._id}
                href={media.file_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 hover:bg-theme-border rounded-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-theme-base flex items-center justify-center  border border-white/5">
                  <FileText className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm text-gray-300 truncate">{media.file_name}</span>
                  <span className="text-[10px] text-gray-400">{formatFileSize(media.file_size)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activeMedia.map((media: any) => (
              <div
                key={media._id}
                onClick={() => handlePreview(media)}
                className="aspect-square relative rounded-lg overflow-hidden bg-theme-surface group cursor-pointer border border-theme-border"
              >
                {media.type?.startsWith("video/") ? (
                  <video src={media.file_url!} className="w-full h-full object-cover" preload="metadata" />
                ) : (
                  <Image
                    src={media.file_url!}
                    alt="media"
                    fill
                    sizes="100px"
                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
