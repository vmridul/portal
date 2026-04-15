"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, FileText } from "lucide-react";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";
import { useColor } from "@/contexts/colorContext";

interface SidebarMediaViewProps {
  mediaFiles: any[];
  isLoading: boolean;
}

export function SidebarMediaView({ mediaFiles, isLoading }: SidebarMediaViewProps) {
  const { color } = useColor();
  const [mediaTab, setMediaTab] = useState<"images" | "videos" | "files">("images");

  const images = mediaFiles?.filter((m) => m.type?.startsWith("image/")) || [];
  const videos = mediaFiles?.filter((m) => m.type?.startsWith("video/")) || [];
  const files = mediaFiles?.filter((m) => !m.type?.startsWith("image/") && !m.type?.startsWith("video/")) || [];

  const activeMedia = mediaTab === "images" ? images : mediaTab === "videos" ? videos : files;

  return (
    <div className="flex flex-col h-full">
      {/* Media Tabs */}
      <div className="p-4 pb-0">
        <div className="bg-theme-surface text-sm text-white h-9 rounded-[8px] w-fit p-1 flex items-center gap-1">
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
        {activeMedia.length === 0 ? (
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
                className="flex items-center gap-3 p-3 rounded-xl bg-theme-surface/30 hover:bg-theme-surface border border-white/5 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-theme-base flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs text-white/80 font-medium truncate">{media.file_name}</span>
                  <span className="text-[10px] text-white/30">Download</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activeMedia.map((media: any) => (
              <div
                key={media._id}
                className="aspect-square relative rounded-lg overflow-hidden bg-theme-surface group cursor-pointer border border-white/5"
              >
                {media.type?.startsWith("video/") ? (
                  <video src={media.file_url!} className="w-full h-full object-cover" preload="metadata" />
                ) : (
                  <Image
                    src={media.file_url!}
                    alt="media"
                    fill
                    sizes="100px"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
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
