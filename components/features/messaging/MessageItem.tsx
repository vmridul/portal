import { formatTimeOnly, formatDateFull } from "@/lib/utils/date";
import { formatFileSize } from "@/lib/utils/file";
import { shouldShowMeta, shouldShowDateDivider } from "@/lib/utils/message";
import { getSenderAvatar, getDisplayName } from "@/lib/utils/avatar";
import Image from "next/image";
import { BadgeX, FileText } from "lucide-react";
import { VideoMessage } from "./VideoMessage";
import type { User, MessageWithSender } from "@/lib/types";
import { useUIStore } from "@/store/uiStore";
import React, { useEffect, useState } from "react";

interface MessageItemProps {
  message: MessageWithSender;
  prevMessage: MessageWithSender | null;
  user: User | null;
  isCurrentUser: boolean;
  color: string;
  textColor: string;
  pinnedDate?: string | null;
  onPreviewImage: (url: string) => void;
  onDeleteRequest: (id: string) => void;
}

export const MessageItem = React.memo(({
  message,
  prevMessage,
  user,
  isCurrentUser,
  color,
  textColor,
  pinnedDate,
  onPreviewImage,
  onDeleteRequest,
}: MessageItemProps) => {
  const [highlight, setHighlight] = useState(false);
  const { jumpedMessageId, setJumpedMessageId } = useUIStore();
  const isImage = message.type?.startsWith("image/");
  const isVideo = message.type?.startsWith("video/");
  const isFile = message.file_url && !isImage && !isVideo;
  const isSystem = message.type === "system";
  const messageDate = formatDateFull(message._creationTime);
  const showDateDivider = shouldShowDateDivider(message, prevMessage);

  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.id === message._id) {
        setHighlight(true);
        setTimeout(() => setHighlight(false), 3000);
      }
    };
    window.addEventListener("jump-to-msg", handleJump);
    return () => window.removeEventListener("jump-to-msg", handleJump);
  }, [message._id]);

  useEffect(() => {
    if (jumpedMessageId === message._id) {
      setHighlight(true);
      // Clear it after a delay
      const timer = setTimeout(() => {
        setHighlight(false);
        setJumpedMessageId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [jumpedMessageId, message._id, setJumpedMessageId]);

  if (isSystem) {
    return (
      <div className="w-full">
        {showDateDivider && pinnedDate !== messageDate && (
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 rounded-full bg-theme-base text-xs text-gray-400 border border-theme-border">
              {messageDate}
            </span>
          </div>
        )}
        <div
          data-msg-id={message._id}
          className={`px-3 py-1 mx-auto rounded-[6px] items-center text-gray-400 text-xs flex justify-center my-2 transition-colors duration-500 ${highlight ? "bg-yellow-500/20" : ""}`}
        >
          <span className="font-medium">{message.sender?.username}</span>
          <span className="ml-2 whitespace-pre-wrap">{message.content}</span>
          <span className="ml-2">
            {formatTimeOnly(message._creationTime)}
          </span>
        </div>
      </div>
    );
  }

  const showMeta = shouldShowMeta(message, prevMessage);

  return (
    <div className="w-full">
      {showDateDivider && pinnedDate !== messageDate && (
        <div className="flex items-center justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-theme-surface text-xs text-gray-400 border border-theme-border">
            {messageDate}
          </span>
        </div>
      )}
      <div
        data-msg-id={message._id}
        className={`flex gap-2 rounded-[6px] transition-colors duration-500 ${highlight ? "bg-yellow-500/10" : ""} ${showMeta ? "mt-2" : "my-0"} flex-row`}
      >
        {showMeta ? (
          <Image
            src={getSenderAvatar(
              message.sender_id,
              user?.user_id,
              message.sender,
              user ?? undefined,
            )}
            width={40}
            height={40}
            unoptimized
            alt={message.sender?.username || "User"}
            className="w-8 h-8 rounded-[8px] flex-shrink-0 border border-theme-border"
          />
        ) : (
          <div className="w-8 h-8" />
        )}

        <div
          className="flex flex-col max-w-[60%] items-start"
        >
          {showMeta && (
            <div
              className="flex items-center mb-1 gap-2 px-1 flex-row"
            >
              <span
                className="text-xs truncate min-w-0 max-w-[140px] text-gray-400 text-left"
              >
                {getDisplayName(
                  message.sender_id,
                  user?.user_id,
                  message.sender,
                )}
              </span>
              <span className="text-xs truncate min-w-0 max-w-[150px] text-gray-600">
                {formatTimeOnly(message._creationTime)}
              </span>
            </div>
          )}
          <div
            id={`msg-${message._id}`}
            style={{
              borderRadius: "8px 8px 8px 0px",
              backgroundColor:
                isImage || isVideo
                  ? highlight ? "rgba(234, 179, 8, 0.2)" : "transparent"
                  : isCurrentUser
                    ? color
                    : `${color}3A`,
              color:
                isImage || isVideo
                  ? undefined
                  : isCurrentUser
                    ? textColor
                    : `${textColor}A`,
            }}
            className={`relative group ${isFile ? "px-0.5 py-0.5" : "px-2 py-1.5"} ${!isVideo ? "md:hover:scale-100 hover:scale-105" : ""} transition-all duration-500 ease-in-out rounded-[6px] ${isImage || isVideo ? "bg-transparent" : isCurrentUser ? "" : "text-white/90"}`}
          >
            {isCurrentUser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(message._id as string);
                }}
                className="absolute -top-3 -left-3 z-[60] w-6 h-6 rounded-full flex items-center justify-center duration-400 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/5 hover:scale-110"
              >
                <BadgeX className="w-4 h-4 text-white/50" />
              </button>
            )}

            {isImage && message.file_url && (
              <div className="flex flex-col gap-1 mb-2">
                <div className="relative min-h-[150px] min-w-[200px] bg-theme-surface/30 rounded-[8px] overflow-hidden">
                  <Image
                    src={message.file_url}
                    alt="uploaded"
                    width={500}
                    height={500}
                    className="w-auto h-auto max-w-[200px] max-h-[200px] md:max-w-[500px] md:max-h-[500px] cursor-pointer"
                    onClick={() => onPreviewImage(message.file_url as string)}
                  />
                </div>
                <div className="flex flex-col px-1">
                  <span
                    className="text-sm text-white break-words"
                  >
                    {message.file_name || "Attachment"}
                  </span>
                  {message.file_size && (
                    <span className="text-[10px] text-gray-400">
                      {formatFileSize(message.file_size)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {isVideo && message.file_url && (
              <div className="flex flex-col gap-1 mb-2">
                <div className="min-h-[150px] bg-theme-surface/30 rounded-[8px] overflow-hidden">
                  <VideoMessage src={message.file_url} />
                </div>
                <div className="flex flex-col px-1">
                  <span
                    className="text-sm text-white break-words"
                  >
                    {message.file_name || "Attachment"}
                  </span>
                  {message.file_size && (
                    <span className="text-[11px] text-gray-400">
                      {formatFileSize(message.file_size)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {isFile && message.file_url && (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-1 transition-colors duration-200 mb-1 group/file"
                style={{
                  borderRadius: "12px 12px 12px 4px",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-sm break-words opacity-90"
                  >
                    {message.file_name || "Attachment"}
                  </span>
                  {message.file_size && (
                    <span className="text-[11px] opacity-60">
                      {formatFileSize(message.file_size)}
                    </span>
                  )}
                </div>
              </a>
            )}

            {message.content && (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
