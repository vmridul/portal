import { formatTimeOnly, formatDateFull } from "@/lib/utils/date";
import { shouldShowMeta, shouldShowDateDivider } from "@/lib/utils/message";
import { getSenderAvatar, getDisplayName } from "@/lib/utils/avatar";
import Image from "next/image";
import { BadgeX, FileText } from "lucide-react";
import { VideoMessage } from "./videoMessage";
import type { User, MessageWithSender } from "@/lib/types";
import React from "react";

interface MessageItemProps {
  message: MessageWithSender;
  prevMessage: MessageWithSender | null;
  user: User | null;
  isCurrentUser: boolean;
  color: string;
  textColor: string;
  pinnedDate?: string | null;
  onSetRef?: (el: HTMLDivElement | null, id: string) => void;
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
  onSetRef,
  onPreviewImage,
  onDeleteRequest,
}: MessageItemProps) => {
  const isImage = message.type?.startsWith("image/");
  const isVideo = message.type?.startsWith("video/");
  const isFile = message.file_url && !isImage && !isVideo;
  const isSystem = message.type === "system";
  const messageDate = formatDateFull(message._creationTime);
  const showDateDivider = shouldShowDateDivider(message, prevMessage);

  if (isSystem) {
    return (
      <>
        {showDateDivider && pinnedDate !== messageDate && (
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 rounded-full bg-theme-base text-xs text-gray-400 border border-theme-border">
              {messageDate}
            </span>
          </div>
        )}
        <div
          data-msg-id={message._id}
          className="px-3 py-1 mx-auto rounded-[6px] items-center text-gray-400 text-xs flex justify-center my-2"
        >
          <span className="font-medium">{message.sender?.username}</span>
          <span className="ml-2 whitespace-pre-wrap">{message.content}</span>
          <span className="ml-2">
            {formatTimeOnly(message._creationTime)}
          </span>
        </div>
      </>
    );
  }

  const showMeta = shouldShowMeta(message, prevMessage);

  return (
    <>
      {showDateDivider && pinnedDate !== messageDate && (
        <div className="flex items-center justify-center my-4">
          <span className="px-3 py-1 rounded-full bg-theme-surface text-xs text-gray-400 border border-theme-border">
            {messageDate}
          </span>
        </div>
      )}
      <div
        ref={(el) => {
          if (onSetRef) onSetRef(el, message._id as string);
        }}
        data-msg-id={message._id}
        className={`flex gap-2 rounded-[6px] ${showMeta ? "mt-2" : "my-0"} ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
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
          className={`flex flex-col max-w-[60%] ${isCurrentUser ? "items-end" : "items-start"}`}
        >
          {showMeta && (
            <div
              className={`flex items-center mb-1 gap-2 px-1 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <span
                className={`text-xs truncate min-w-0 max-w-[140px] text-gray-400 ${isCurrentUser ? "text-right" : "text-left"}`}
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
              borderRadius: isCurrentUser
                ? "8px 8px 0px 8px"
                : "8px 8px 8px 0px",
              backgroundColor:
                isImage || isVideo || isFile
                  ? "transparent"
                  : isCurrentUser
                    ? color
                    : `${color}3A`,
              color:
                isImage || isVideo || isFile
                  ? undefined
                  : isCurrentUser
                    ? textColor
                    : `${textColor}A`,
            }}
            className={`relative group ${isFile ? "px-0 py-1" : "px-2 py-1.5"} ${!isVideo ? "md:hover:scale-100 hover:scale-105" : ""} transition-colors duration-200 ease-in-out rounded-[6px] ${isImage || isVideo ? "bg-transparent" : isCurrentUser ? "" : " text-white/80"}`}
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
              <Image
                src={message.file_url}
                alt="uploaded"
                width={500}
                height={500}
                className="w-auto h-auto max-w-[200px] max-h-[200px] md:max-w-[500px] md:max-h-[500px] cursor-pointer rounded-[8px] mb-2"
                onClick={() => onPreviewImage(message.file_url as string)}
              />
            )}

            {isVideo && message.file_url && (
              <VideoMessage src={message.file_url} />
            )}

            {isFile && message.file_url && (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-white/5 transition mb-2"
                style={{
                  borderRadius: isCurrentUser
                    ? "8px 8px 0px 8px"
                    : "8px 8px 8px 0px",
                }}
              >
                <div className="w-9 h-9 rounded-[8px] bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white/50" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {message.file_name}
                  </span>
                  <span className="text-xs text-white/60">
                    Click to download
                  </span>
                </div>
              </a>
            )}

            {message.content && (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

MessageItem.displayName = "MessageItem";
