import { loadOlderMessages } from "@/app/actions/loadOlderMsgs";
import { formatToIST } from "@/app/actions/formatToIST";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useDropzone } from "react-dropzone";
import { shouldShowMeta } from "@/app/actions/shouldShowMeta";
import { sendMessage } from "@/app/actions/sendMessage";
import { Send, Plus, BadgeX, X, ArrowDown } from "lucide-react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { fetchMessages } from "@/app/actions/fetchMessages";
import { haptic } from "@/app/actions/haptic";
export const ChatUI = ({
  type,
  messages,
  setMessages,
  room_id,
  user,
  color,
  setMessageToDelete,
  setDeleteDialogOpen,
  onLoad,
}: {
  type: "room" | "friend";
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  room_id: string;
  user: any;
  color: string;
  setMessageToDelete: (message: any) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  onLoad: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState<string>("");
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const PAGE_SIZE = 200;
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const THRESHOLD = 80;

    const onScroll = () => {
      const isScrolledUp =
        el.scrollTop + el.clientHeight < el.scrollHeight - THRESHOLD;

      setShowScrollDown(isScrolledUp);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!window.visualViewport) return;

    const viewport = window.visualViewport;

    const handleResize = () => {
      const keyboardHeight =
        window.innerHeight - viewport.height - viewport.offsetTop;

      document.documentElement.style.setProperty(
        "--keyboard-offset",
        `${Math.max(keyboardHeight, 0)}px`
      );
    };

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    handleResize();

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  //jump for search
  useEffect(() => {
    const onJump = async (e: Event) => {
      const event = e as CustomEvent<{ id: string; sent_at: string }>;
      const { id, sent_at } = event.detail;

      let el = document.getElementById(`msg-${id}`);
      if (el) {
        const originalBg = window.getComputedStyle(el).backgroundColor;
        el.classList.remove("bg-blue-500", "bg-gray-900", "bg-transparent");
        el.style.backgroundColor = "#FF00004A";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          el.style.backgroundColor = originalBg;
        }, 2500);
        return;
      }

      //for older msgs
      if (type === "room") {
        const { data } = await supabase
          .from("Messages")
          .select("*")
          .eq("room_id", room_id)
          .lte("sent_at", sent_at)
          .order("sent_at", { ascending: false })
          .limit(50);

        if (!data || data.length === 0) return;
        setMessages((prev) => [...data.reverse(), ...prev]);
      } else {
        const { data } = await supabase
          .from("FriendMessages")
          .select("*")
          .or(`receiver_id.eq.${room_id},sender_id.eq.${room_id}`)
          .lte("sent_at", sent_at)
          .order("sent_at", { ascending: false })
          .limit(50);

        if (!data || data.length === 0) return;
        setMessages((prev) => [...data.reverse(), ...prev]);
      }

      requestAnimationFrame(() => {
        const el = document.getElementById(`msg-${id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };
    window.addEventListener("jump-to-msg", onJump);
    return () => window.removeEventListener("jump-to-msg", onJump);
  }, [room_id]);

  useEffect(() => {
    fetchMessages({
      type: type,
      room_id,
      setMessages,
      setOldestCursor,
      PAGE_SIZE,
    });
    onLoad?.();
  }, [room_id]);

  // for realtime message changes
  useEffect(() => {
    if (!room_id || !user?.user_id) return;

    const insertChannelName = type === "room"
      ? `room-insert:${room_id}`
      : `friend-insert:${[user.user_id, room_id].sort().join('-')}`;

    const deleteChannelName = type === "room"
      ? `room-delete:${room_id}`
      : `friend-delete:${[user.user_id, room_id].sort().join('-')}`;


    const insertChannel = supabase
      .channel(insertChannelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: type === "room" ? "Messages" : "FriendMessages",
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from("Users")
            .select("user_id, avatar, username")
            .eq("user_id", payload.new.sender_id)
            .single();

          setShouldScrollToBottom(true);
          setMessages((prev) => [
            ...prev,
            { ...payload.new, sender: senderData },
          ]);
        }
      )
      .subscribe();

    const deleteChannel = supabase
      .channel(deleteChannelName)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: type === "room" ? "Messages" : "FriendMessages",
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    const presenceChannelName = type === "room"
      ? `presence-room:${room_id}`
      : `presence-friend:${[user.user_id, room_id].sort().join('-')}`;

    const presenceChannel = supabase
      .channel(presenceChannelName)
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const typing = new Set<string>();

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.typing && presence.user_id !== user?.user_id) {
              typing.add(presence.username);
            }
          });
        });

        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data } = await supabase
            .from("Users")
            .select("username")
            .eq("user_id", user?.user_id)
            .single();

          setUsername(data?.username || "Anonymous");
          channelRef.current = presenceChannel;
        }
      });

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(deleteChannel);
      if (channelRef.current) {
        channelRef.current.untrack();
      }
      supabase.removeChannel(presenceChannel);
      channelRef.current = null;
    };
  }, [room_id, user?.user_id, type]);

  useEffect(() => {
    if (loadingOlder || !shouldScrollToBottom) return;

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
  }, [messages, loadingOlder, shouldScrollToBottom, isMobile]);


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      //if already focused on input
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
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

  const handleTyping = () => {
    if (!channelRef.current || !username) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // then track typing
    channelRef.current.track({
      user_id: user?.user_id,
      username,
      typing: true,
    });

    // set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.track({
          user_id: user?.user_id,
          username,
          typing: false,
        });
      }
    }, 1500);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      if (files[0]) setSelectedFile(files[0]);
    },
  });

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className={`flex flex-col items-center ${type === "friend" ? "h-[calc(100dvh-55px)]" : "h-[calc(100dvh-40px)]"} relative overflow-hidden`}>
      {showScrollDown && (
        <button
          onClick={() => { scrollToBottom(); haptic("light") }}
          className="absolute z-[9999] bottom-[90px] left-[50%] translate-x-[-50%] rounded-[10px] p-1 text-white/50 hover:text-white/70 border border-[#313131] border-opacity-90  bg-[#080f17] bg-opacity-80 backdrop-blur-md transition-all duration-200 ease-out"
        >
          <ArrowDown className="h-6 w-6" />
        </button>
      )}
      {previewImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 transition-opacity duration-200 ease-out flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-[95vw] max-h-[95vh] md:max-w-[85vw] md:max-h-[85vh] touch-pan-y touch-pinch-zoom object-contain"
            onClick={(e) => e.stopPropagation()}
          />
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
        onScroll={(e) => {
          if (e.currentTarget.scrollTop <= 0) {
            loadOlderMessages({
              type,
              oldestCursor,
              loadingOlder,
              containerRef,
              setMessages,
              setOldestCursor,
              PAGE_SIZE,
              setLoadingOlder,
              setShouldScrollToBottom,
              room_id,
            });
          }
        }}
        className="flex-1 w-full px-4 md:px-10 overscroll-contain overflow-y-auto flex flex-col gap-2"
        style={{ paddingBottom: '100px' }}
      >
        {loadingOlder && (
          <div className="flex justify-center py-2">
            <div className="h-4 w-32 rounded opacity-50 animate-pulse bg-[#313131]" />
          </div>
        )}
        {messages.map((message, index) => {
          if (message.type === "join") {
            return (
              <div
                key={message.id}
                className="px-3 py-1 md:scale-100 scale-[90%] mx-auto rounded-[6px] items-center text-white/70 text-xs flex justify-center my-2"
              >
                <span className="font-medium">{message.sender?.username}</span>
                <span className="ml-2">joined the room</span>
                <span className="ml-4">{formatToIST(message.sent_at)}</span>
              </div>
            );
          }
          if (message.type === "leave") {
            return (
              <div
                key={message.id}
                className="px-3 py-1 md:scale-100 scale-[90%] mx-auto rounded-[6px] items-center text-white/70 text-xs flex  justify-center my-2"
              >
                <span className="font-medium">{message.sender?.username}</span>
                <span className="ml-2">left the room</span>
                <span className="ml-4">{formatToIST(message.sent_at)}</span>
              </div>
            );
          }
          const showMeta = shouldShowMeta(index, messages);
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${showMeta ? "mt-2" : "my-0"} ${message.sender_id === user?.user_id
                ? "flex-row-reverse"
                : "flex-row"
                }`}
            >
              {/* Avatar */}
              {showMeta ? (
                <Image
                  src={
                    type === "room"
                      ? message.sender?.user_id == user?.user_id
                        ? user?.avatar
                        : message.sender?.avatar
                      : message.sender_id == user?.user_id
                        ? user?.avatar
                        : message.receiver?.avatar
                  }
                  width={40}
                  height={40}
                  unoptimized
                  alt={message.sender?.username || "User"}
                  className="w-8 h-8 rounded-[8px] flex-shrink-0 border border-[#313131]"
                />
              ) : (
                <div className="w-8 h-8" />
              )}

              {/* Message bubble */}
              <div
                className={`flex flex-col max-w-[60%] ${message.sender_id === user?.user_id
                  ? "items-end"
                  : "items-start"
                  }`}
              >
                {showMeta && (
                  <div
                    className={`flex items-center mb-1 gap-2 px-2 ${message.sender_id === user?.user_id
                      ? "flex-row-reverse"
                      : "flex-row"
                      }`}
                  >
                    <span
                      className={`text-xs truncate min-w-0 max-w-[140px] text-gray-400 ${message.sender_id === user?.user_id
                        ? "text-right"
                        : "text-left"
                        }`}
                    >
                      {message.sender_id === user?.user_id
                        ? "You"
                        : type === "room" ? message.sender?.username : message?.receiver?.username}
                    </span>
                    <span className="text-xs truncate min-w-0 max-w-[150px] text-gray-600">
                      {formatToIST(message.sent_at)}
                    </span>
                  </div>
                )}
                <div
                  id={`msg-${message.id}`}
                  style={{
                    borderRadius:
                      message.sender_id === user?.user_id
                        ? "8px 8px 0px 8px"
                        : "8px 8px 8px 0px",
                    backgroundColor: message.type?.startsWith("image/")
                      ? "transparent"
                      : message.sender_id === user?.user_id
                        ? color
                        : `${color}3A`,
                  }}
                  className={`relative group py-2 px-3 hover:opacity-90 md:hover:scale-100 hover:scale-105 transition-all duration-200 ease-in-out rounded-[6px] ${message.type?.startsWith("image/")
                    ? "bg-transparent"
                    : message.sender_id === user?.user_id
                      ? "text-white"
                      : " text-white/80"
                    }`}
                >
                  {message.sender_id === user?.user_id && (
                    <button
                      onClick={() => {
                        setMessageToDelete(message.id);
                        setDeleteDialogOpen(true);
                      }}
                      className={`absolute ${message.type?.startsWith("image/") ? "top-0" : "top-0"
                        } -left-2 rounded-[8px] flex items-center justify-center duration-400 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <BadgeX className="w-4 h-4 text-white/60 hover:text-white/40" />
                    </button>
                  )}

                  {/* Show image if type is image */}
                  {message.file_url && message.type?.startsWith("image/") && (
                    <img
                      src={message.file_url}
                      alt="uploaded"
                      className="md:max-w-[500px] md:max-h-[500px] max-w-[200px] max-h-[200px] cursor-pointer rounded-[8px] mb-2"
                      onLoad={() => {
                        if (shouldScrollToBottom && !isMobile) {
                          bottomRef.current?.scrollIntoView({
                            behavior: "auto",
                          });
                        } else if (shouldScrollToBottom && isMobile) {
                          const container = containerRef.current;
                          if (!container) return;
                          container.scrollTop = container.scrollHeight;
                        }
                      }}
                      onClick={() => setPreviewImage(message.file_url)}
                    />
                  )}

                  {/* Show file download for non-image files */}
                  {message.file_url && !message.type?.startsWith("image/") && (
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline block mb-2 hover:opacity-80"
                    >
                      {message.file_name}
                    </a>
                  )}

                  {/* Show text content */}
                  {message.content && <div>{message.content}</div>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        {...getRootProps()}
        className="flex items-center gap-2 absolute bottom-4 md:px-3 px-2 py-1 md:py-3 rounded-2xl bg-[#080f17] focus-within:border-[#393939] bg-opacity-90 border border-[#313131] border-opacity-90 backdrop-blur-md"
        style={
          isMobile
            ? {
              transform: "translateY(calc(-1 * var(--keyboard-offset)))",
              transition: "transform 0.2s ease-out"
            }
            : undefined
        }
      >
        {/* File preview */}
        {selectedFile && (
          <div
            className={`absolute bottom-full w-full left-1/2 -translate-x-1/2 mb-2 bg-[#171717] px-3 py-2 rounded text-white/80 text-xs ${typingUsers.size > 0 && "mb-8"
              }`}
          >
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

        {typingUsers.size > 0 && (
          <div className="absolute w-full left-1/2 -translate-x-1/2 bottom-full text-xs text-gray-400 bg-[#171717] px-3 py-1.5 rounded-[10px] rounded-b-none border border-[#323232] border-b-0 backdrop-blur-sm">
            {Array.from(typingUsers).join(", ")}{" "}
            {typingUsers.size === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* File input (hidden) */}
        <input
          {...getInputProps()}
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
        />
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#211f25] py-2 px-3 rounded-2xl text-white hover:bg-[#2d2737] disabled:opacity-50"
          disabled={uploading}
        >
          <Plus className="text-[#a89691] w-7 h-8" />
        </button>

        <input
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
            if (e.target.value.length > 0) {
              handleTyping();
            }
          }}
          value={msg}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage({
                type: type,
                msg,
                selectedFile,
                setUploading,
                channelRef,
                user,
                username,
                room_id,
                setMsg,
                setSelectedFile,
                fileInputRef,
              });
            }
          }}
          className="rounded-[8px] bg-transparent bg-[#121212] text-white/80 outline-none py-4 md:py-2 px-3 w-fit md:w-80 placeholder-[#777581]"
          type="text"
          placeholder="Press / to focus"
          disabled={uploading}
          onClick={() => haptic("light")}
        />
        <button
          onClick={() =>
            sendMessage({
              type: type,
              msg,
              selectedFile,
              setUploading,
              channelRef,
              user,
              username,
              room_id,
              setMsg,
              setSelectedFile,
              fileInputRef,
            })
          }
          style={{ backgroundColor: color }}
          className="py-2 px-3 rounded-2xl ease-in-out disabled:opacity-50"
          disabled={uploading}
        >
          <Send
            className="text-white/70 mr-0.5 hover:text-white/60 transition-transform duration-150
    hover:scale-105 ease-in-out w-6 h-7"
          />
        </button>
        {isDragActive && (
          <div className="z-[9999] flex justify-center border border-dashed border-white/50 items-center absolute top-0 left-0 rounded-[10px] w-[462px] h-[72px] bg-opacity-80 bg-[#313131]">
            <span className="text-white/50 tracking-wider text-xl">
              DROP HERE
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
