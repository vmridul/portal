"use client";

import { useState } from "react";
import { SidebarLayout, SidebarHeader } from "@/components/ui/sidebar";
import { MediaLightbox } from "@/components/shared/MediaLightbox";
import { useUIStore } from "@/store/uiStore";
import { MediaItem } from "@/components/ui/media";

interface SidebarMediaProps {
  mediaFiles: any[];
  isLoading: boolean;
  onClose: () => void;
}

export function SidebarMedia({ mediaFiles, isLoading, onClose }: SidebarMediaProps) {
  const { openLightbox } = useUIStore();
  const [mediaTab, setMediaTab] = useState<"images" | "videos" | "files">("images");

  const images = mediaFiles?.filter((m) => m.type?.startsWith("image/")) || [];
  const videos = mediaFiles?.filter((m) => m.type?.startsWith("video/")) || [];
  const files = mediaFiles?.filter((m) => !m.type?.startsWith("image/") && !m.type?.startsWith("video/")) || [];

  const handleImageClick = (media: any) => {
    const mediaItems = images.map((m: any) => ({
      file_url: m.file_url,
      type: m.type,
      file_name: m.file_name
    }));
    const index = images.findIndex((m: any) => m._id === media._id);
    openLightbox(mediaItems, index >= 0 ? index : 0);
  };

  const handleVideoClick = (media: any) => {
    const mediaItems = videos.map((m: any) => ({
      file_url: m.file_url,
      type: m.type,
      file_name: m.file_name
    }));
    const index = videos.findIndex((m: any) => m._id === media._id);
    openLightbox(mediaItems, index >= 0 ? index : 0);
  };

  const activeMedia = mediaTab === "images" ? images : mediaTab === "videos" ? videos : files;
  const handleClick = mediaTab === "images" ? handleImageClick : mediaTab === "videos" ? handleVideoClick : undefined;

  return (
    <SidebarLayout>
      <SidebarHeader title="Media Gallery" onClose={onClose} />
      <MediaLightbox />
      
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

      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {activeMedia.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-xs">No {mediaTab} yet</p>
          </div>
        ) : mediaTab === "files" ? (
          <div className="flex flex-col gap-2">
            {activeMedia.map((media: any) => (
              <MediaItem
                key={media._id}
                fileUrl={media.file_url}
                fileName={media.file_name}
                fileSize={media.file_size}
                type={media.type}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activeMedia.map((media: any) => (
              <MediaItem
                key={media._id}
                fileUrl={media.file_url}
                fileName={media.file_name}
                fileSize={media.file_size}
                type={media.type}
                onClick={() => handleClick?.(media)}
              />
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}