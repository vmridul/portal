"use client";

import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  FileCode,
  File as FileIcon,
} from "lucide-react";

export function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType.startsWith("video/")) return FileVideo;
  if (fileType.startsWith("audio/")) return FileAudio;

  const typeMap: Record<string, any> = {
    "application/pdf": FileText,
    "application/zip": FileArchive,
    "application/x-zip-compressed": FileArchive,
    "text/plain": FileText,
    "text/html": FileCode,
    "text/css": FileCode,
    "application/javascript": FileCode,
    "application/json": FileCode,
  };

  return typeMap[fileType] || FileIcon;
}
