import { formatToIST } from "@/app/actions/formatToIST";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { shouldShowMeta } from "@/app/actions/shouldShowMeta";
import { Send, Plus, BadgeX, X, ArrowDown, FileText } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { VideoMessage } from "./videoMessage";

export const ChatUI = ({
  type,
  room_id,
  user,
  color,
  textColor,
  setMessageToDelete,
  setDeleteDialogOpen,
  onLoad,
}: {
  type: "room" | "friend";
  room_id: string;
  user: any;
  color: string;
  textColor: string;
  setMessageToDelete: (message: any) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  onLoad: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [limit, setLimit] = useState(50);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const updateTyping = useMutation(api.typing.updateTyping);
  const removeTyping = useMutation(api.typing.removeTyping);

  const typingUsers = useQuery(api.typing.getTypingUsers, { room_id }) || [];

  const messages = useQuery(
    type === "room" ? api.messages.getRoomMessages : api.messages.getFriendMessages,
    type === "room" ? { room_id, limit } : { friend_id: room_id, limit }
  ) || [];

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  useEffect(() => {
    if (messages.length > 0) onLoad?.();
  }, [messages.length, onLoad]);

  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id } = customEvent.detail;
      const el = document.getElementById(`msg-${id}`);
      if (el) {
        setShouldScrollToBottom(false);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const oldBg = el.style.backgroundColor;
        el.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        setTimeout(() => {
          el.style.backgroundColor = oldBg;
        }, 1500);
      } else {
        setLimit((prev) => Math.max(prev, 150));
        setTimeout(() => {
          const retryEl = document.getElementById(`msg-${id}`);
          if (retryEl) {
            setShouldScrollToBottom(false);
            retryEl.scrollIntoView({ behavior: "smooth", block: "center" });
            const oldBg = retryEl.style.backgroundColor;
            retryEl.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            setTimeout(() => {
              retryEl.style.backgroundColor = oldBg;
            }, 1500);
          } else {
            toast.error("Message is too far back to jump to");
          }
        }, 800);
      }
    };
    window.addEventListener("jump-to-msg", handleJump);
    return () => window.removeEventListener("jump-to-msg", handleJump);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const THRESHOLD = 80;
    const onScroll = () => {
      const isScrolledUp = el.scrollTop + el.clientHeight < el.scrollHeight - THRESHOLD;
      setShowScrollDown(isScrolledUp);

      if (el.scrollTop <= 0 && messages.length >= limit) {
        setShouldScrollToBottom(false);
        setLimit((prev) => prev + 50);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages.length, limit]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      const offset = window.innerHeight - vv.height;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--keyboard-offset", `${Math.max(0, offset)}px`);
      });
    };
    vv.addEventListener("resize", handleResize);
    handleResize();
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!shouldScrollToBottom) return;
    if (isMobile) {
      const container = containerRef.current;
      if (!container) return;
      container.scrollTop = container.scrollHeight;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    return () => clearTimeout(timer);
  }, [messages, shouldScrollToBottom, isMobile]);

  //for scroll to bottom when typing users are added
  const [wasTyping, setWasTyping] = useState(false);
  useEffect(() => {
    const isTyping = typingUsers.length > 0;
    if (isTyping !== wasTyping) {
      setWasTyping(isTyping);
      if (!isMobile && containerRef.current && shouldScrollToBottom) {
        if (isTyping) {
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
      }
    }
  }, [typingUsers.length, wasTyping, shouldScrollToBottom, isMobile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      if (files[0]) setSelectedFile(files[0]);
    },
  });

  const scrollToBottom = () => {
    setShouldScrollToBottom(true);
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSendMessage = async () => {
    if (!msg && !selectedFile) return;
    setUploading(true);

    try {
      let storageId: import("@/convex/_generated/dataModel").Id<"_storage"> | undefined;
      let finalFileName: string | null = null;
      let finalFileType: string | null = null;

      if (selectedFile) {
        finalFileName = selectedFile.name;
        finalFileType = selectedFile.type;
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        if (!result.ok) throw new Error("Upload failed");
        const { storageId: returnedStorageId } = await result.json();
        storageId = returnedStorageId;
      }

      await sendMessageMutation({
        type,
        room_id,
        msg: msg || null,
        file_storage_id: storageId,
        file_type: finalFileType,
        file_name: finalFileName,
      });

      setMsg("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (inputRef.current) inputRef.current.style.height = "auto";
      setShouldScrollToBottom(true);
      removeTyping({ room_id }).catch(console.error);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${type === "friend" ? "h-[calc(100dvh-55px)]" : "h-[calc(100dvh-40px)]"} relative overflow-hidden`}>
      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="absolute z-[2000] bottom-[95px] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-white/50 hover:text-white/70 border border-theme-border border-opacity-90 bg-theme-base bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out"
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 transition-opacity duration-200 ease-out flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] pointer-events-none flex items-center justify-center">
            <Image
              src={previewImage}
              alt="preview"
              fill
              className="object-contain pointer-events-auto shadow-2xl touch-pan-y touch-pinch-zoom"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className={`absolute ${isMobile ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} top-6 right-6 text-white/60 hover:text-white/80 bg-black/50 rounded-full p-2`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 w-full px-4 md:px-10 overscroll-contain overflow-y-auto flex flex-col gap-2"
        style={{ paddingBottom: "100px" }}
      >
        {messages.map((message, index) => {
          const isImage = message.type?.startsWith("image/");
          const isVideo = message.type?.startsWith("video/");
          const isFile = message.file_url && !isImage && !isVideo;
          if (message.type === "system") {
            return (
              <div
                key={message._id}
                className="px-3 py-1 md:scale-100 scale-[90%] mx-auto rounded-[6px] items-center text-white/70 text-xs flex justify-center my-2"
              >
                <span className="font-medium">{message.sender?.username}</span>
                <span className="ml-2">{message.content}</span>
                <span className="ml-4">{formatToIST(message._creationTime as number)}</span>
              </div>
            );
          }
          const previousMsg = index > 0 ? messages[index - 1] : null;
          const showMeta = shouldShowMeta(message, previousMsg);
          return (
            <div
              key={message._id}
              className={`flex gap-2 ${showMeta ? "mt-2" : "my-0"} ${message.sender_id === user?.user_id ? "flex-row-reverse" : "flex-row"}`}
            >
              {showMeta ? (
                <Image
                  src={
                    type === "room"
                      ? (message.sender?.user_id == user?.user_id ? user?.avatar : message.sender?.avatar) || "/assets/default-avatar.png"
                      : (message.sender_id == user?.user_id ? user?.avatar : message.sender?.avatar) || "/assets/default-avatar.png"
                  }
                  width={40}
                  height={40}
                  unoptimized
                  alt={message.sender?.username || "User"}
                  className="w-8 h-8 rounded-[8px] flex-shrink-0 border border-theme-border"
                />
              ) : (
                <div className="w-8 h-8" />
              )}

              <div className={`flex flex-col max-w-[60%] ${message.sender_id === user?.user_id ? "items-end" : "items-start"}`}>
                {showMeta && (
                  <div className={`flex items-center mb-1 gap-2 px-2 ${message.sender_id === user?.user_id ? "flex-row-reverse" : "flex-row"}`}>
                    <span className={`text-xs truncate min-w-0 max-w-[140px] text-gray-400 ${message.sender_id === user?.user_id ? "text-right" : "text-left"}`}>
                      {message.sender_id === user?.user_id ? "You" : message.sender?.username}
                    </span>
                    <span className="text-xs truncate min-w-0 max-w-[150px] text-gray-600">
                      {formatToIST(message._creationTime as number)}
                    </span>
                  </div>
                )}
                <div
                  id={`msg-${message._id}`}
                  style={{
                    borderRadius: message.sender_id === user?.user_id ? "8px 8px 0px 8px" : "8px 8px 8px 0px",
                    backgroundColor: isImage || isVideo || isFile ? "transparent" : message.sender_id === user?.user_id ? color : `${color}3A`,
                    color: isImage || isVideo || isFile ? undefined : message.sender_id === user?.user_id ? textColor : `${textColor}A`
                  }}
                  className={`relative group ${isFile ? "px-0 py-1" : "px-2 py-1.5"} ${!isVideo ? "md:hover:scale-100 hover:scale-105" : ""} transition-all duration-200 ease-in-out rounded-[6px] ${isImage || isVideo ? "bg-transparent" : message.sender_id === user?.user_id ? "" : " text-white/80"}`}
                >
                  {message.sender_id === user?.user_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageToDelete(message._id);
                        setDeleteDialogOpen(true);
                      }}
                      className={`absolute -top-3 -left-3 z-[60] w-6 h-6 rounded-full flex items-center justify-center duration-400 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/5 hover:scale-110`}
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
                      onLoad={() => {
                        if (shouldScrollToBottom && !isMobile) {
                          bottomRef.current?.scrollIntoView({ behavior: "auto" });
                        } else if (shouldScrollToBottom && isMobile) {
                          const container = containerRef.current;
                          if (container) container.scrollTop = container.scrollHeight;
                        }
                      }}
                      onClick={() => setPreviewImage(message.file_url)}
                    />
                  )}

                  {isVideo && message.file_url && (
                    <VideoMessage
                      src={message.file_url}
                      onLoadedData={() => {
                        if (shouldScrollToBottom && !isMobile) {
                          bottomRef.current?.scrollIntoView({ behavior: "auto" });
                        } else if (shouldScrollToBottom && isMobile) {
                          const container = containerRef.current;
                          if (container) container.scrollTop = container.scrollHeight;
                        }
                      }}
                    />
                  )}

                  {isFile && message.file_url && (
                    <a
                      href={message.file_url}
                      target="_blank"
                      style={{ borderRadius: message.sender_id === user?.user_id ? "8px 8px 0px 8px" : "8px 8px 8px 0px", backgroundColor: message.sender_id === user?.user_id ? color : `${color}3A`, color: message.sender_id === user?.user_id ? textColor : "inherit" }}
                      rel="noopener noreferrer"
                      className={`
      flex items-center gap-2 
      px-3 py-2
      border border-white/5
      transition
      mb-2
    `}
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

                  {message.content && <div>{message.content}</div>}
                </div>
              </div>
            </div>
          );
        })}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 mt-6">
            <div className="w-8 h-8 rounded-[8px] flex-shrink-0 border border-[#2a2a2a] flex items-center justify-center bg-theme-surface">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce"></span>
              </span>
            </div>
            <span className="text-xs text-white/50 italic">
              {typingUsers.map((u: any) => u?.username).filter(Boolean).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        {...getRootProps()}
        className="flex items-center z-[1000] gap-2 absolute bottom-4 md:px-3 px-2 py-1 md:py-3 rounded-2xl bg-theme-base focus-within:border-[#393939] bg-opacity-90 border border-theme-border border-opacity-90 backdrop-blur-md"
        style={isMobile ? { transform: "translateY(calc(-1 * var(--keyboard-offset)))", transition: "transform 0.2s ease-out" } : undefined}
      >
        {selectedFile && (
          <div className={`absolute bottom-full w-full left-1/2 -translate-x-1/2 mb-2 bg-theme-base px-3 py-2 rounded text-white/80 text-xs`}>
            {selectedFile.name}
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="ml-2 text-white/80 hover:text-red-400 ease-in-out duration-300"
            >
              ✕
            </button>
          </div>
        )}

        <input {...getInputProps()} ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="bg-theme-surface/60 py-2 px-3 rounded-2xl text-white hover:bg-theme-surface disabled:opacity-50" disabled={uploading}>
          <Plus className="text-[#a89691] w-7 h-8" />
        </button>

        <textarea
          ref={inputRef}
          onPaste={(e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                  setSelectedFile(file);
                  break;
                }
              }
            }
          }}
          onChange={(e) => {
            setMsg(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            if (e.target.value.trim() !== "") {
              updateTyping({ room_id }).catch(console.error);
            } else {
              removeTyping({ room_id }).catch(console.error);
            }
          }}
          value={msg}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="rounded-[8px] bg-transparent text-white/80 outline-none py-[10px] md:py-2 px-3 w-fit md:w-80 placeholder-[#58565f] resize-none overflow-y-auto break-words whitespace-pre-wrap"
          onBlur={() => removeTyping({ room_id }).catch(console.error)}
          placeholder="Press / to focus"
          disabled={uploading}
          rows={1}
          style={{ minHeight: "40px", maxHeight: "150px" }}
        />
        <button onClick={handleSendMessage} style={{ backgroundColor: color, color: textColor }} className="py-2 px-3 rounded-2xl ease-in-out disabled:opacity-50" disabled={uploading}>
          <Send className="mr-0.5 opacity-80 hover:opacity-100 transition-transform duration-150 hover:scale-105 ease-in-out w-6 h-7" />
        </button>
        {isDragActive && (
          <div className="z-[9999] flex justify-center border border-dashed border-white/50 items-center absolute top-0 left-0 rounded-[10px] w-[462px] h-[72px] bg-opacity-80 bg-[#313131]">
            <span className="text-white/50 tracking-wider text-xl">DROP HERE</span>
          </div>
        )}
      </div>
    </div>
  );
};
