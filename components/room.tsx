"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import { UUID } from "crypto";
import { BadgeX, Delete, Plus, Send } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { formatToIST } from "@/app/actions/formatToIST";
import { useColor } from "@/contexts/colorContext";
import { useUserStore } from "@/store/useUserStore";
import { useDropzone } from "react-dropzone";
import React, { useCallback } from "react";

export default function Room({ room_id }: { room_id: string }) {
  const [msg, setMsg] = useState<string>("");
  const [messages, setMessages] = useState<Array<any>>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState<string>("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const [oldestCursor, setOldestCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const TIME_GAP_SECONDS = 20;
  const PAGE_SIZE = 200;
  const { color } = useColor();
  const user = useUserStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      if (files[0]) setSelectedFile(files[0]);
    },
  });

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
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const shouldShowMeta = (index: number) => {
    if (index === 0) return true;

    const curr = messages[index];
    const prev = messages[index - 1];

    if (curr.type !== prev.type) return true;
    if (curr.sender_id !== prev.sender_id) return true;

    const currTime = new Date(curr.sent_at).getTime();
    const prevTime = new Date(prev.sent_at).getTime();

    const diffSeconds = (currTime - prevTime) / 1000;

    return diffSeconds > TIME_GAP_SECONDS;
  };

  const handleDelete = async (messageId: UUID) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    const { error } = await supabase
      .from("Messages")
      .delete()
      .eq("id", messageToDelete)
      .eq("sender_id", user?.user_id);

    if (error) throw error;

    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleTyping = () => {
    if (!channelRef.current || !username) return;

    // Clear previous timeout FIRST
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Then track typing
    channelRef.current.track({
      user_id: user?.user_id,
      username,
      typing: true,
    });

    // Set new timeout
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

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("Messages")
        .select(
          `
      *,
      sender:Users!sender_id (
        user_id,
        avatar,
        username
      )
    `
        )
        .eq("room_id", room_id)
        .order("sent_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      if (!data || data.length === 0) return;
      setMessages(data.reverse());
      setOldestCursor(data[data.length - 1].sent_at);
    };

    fetchMessages();
  }, [room_id]);

  useEffect(() => {
    if (!room_id || !user?.user_id) return;

    const channel = supabase
      .channel(`room:${room_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `room_id=eq.${room_id}`,
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
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Messages",
          filter: `room_id=eq.${room_id}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      // Presence for typing indicator
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
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
          channelRef.current = channel;
        }
      });

    return () => {
      // Stop typing when component unmounts
      if (channelRef.current) {
        channelRef.current.untrack();
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room_id, user?.user_id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${room_id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-files").getPublicUrl(fileName);

    return { url: publicUrl, originalName: file.name };
  };

  const loadOlderMessages = async () => {
    if (!oldestCursor || loadingOlder || !containerRef.current) return;
    setLoadingOlder(true);
    setShouldScrollToBottom(false);
    const container = containerRef.current;
    const prevScrollHeight = container?.scrollHeight;
    const { data, error } = await supabase
      .from("Messages")
      .select(
        `
      *,
      sender:Users!sender_id (
        user_id,
        avatar,
        username
      )
    `
      )
      .eq("room_id", room_id)
      .lt("sent_at", oldestCursor)
      .order("sent_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error(error);
      setLoadingOlder(false);
      return;
    }

    if (!data || data.length === 0) {
      setLoadingOlder(false);
      return;
    }

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newMessages = data.reverse().filter((m) => !existingIds.has(m.id));

      return [...newMessages, ...prev];
    });
    setOldestCursor(data[data.length - 1].sent_at);

    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight;
    });

    setLoadingOlder(false);
  };

  useEffect(() => {
    if (!loadingOlder && shouldScrollToBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [messages, loadingOlder, shouldScrollToBottom]);

  const sendMessage = async () => {
    if (!msg && !selectedFile) return;
    setUploading(true);

    if (channelRef.current) {
      channelRef.current.track({
        user: user?.user_id,
        username,
        typing: false,
      });
    }
    try {
      let fileUrl = null;
      let fileType = null;
      let fileName = null;

      if (selectedFile) {
        const result = await uploadFile(selectedFile);
        fileUrl = result.url;
        fileType = selectedFile.type;
        fileName = result.originalName;
      }

      const { error: sendMsgError } = await supabase.from("Messages").insert({
        room_id: room_id,
        sender_id: user?.user_id,
        content: msg || null,
        file_url: fileUrl,
        type: fileType,
        file_name: fileName,
      });

      if (sendMsgError) throw sendMsgError;

      setMsg("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUploading(false);
    }
  };

  //jump for search
  useEffect(() => {
    const onJump = async (e: Event) => {
      const event = e as CustomEvent<{ id: string; sent_at: string }>;
      const { id, sent_at } = event.detail;

      let el = document.getElementById(`msg-${id}`);
      if (el) {
        const originalBg = window.getComputedStyle(el).backgroundColor;
        el.classList.remove("bg-blue-500", "bg-gray-900", "bg-transparent");
        el.style.backgroundColor = "#FF0000";
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          el.style.backgroundColor = originalBg;
        }, 2500);
        return;
      }

      //for older msgs
      const { data } = await supabase
        .from("Messages")
        .select("*")
        .eq("room_id", room_id)
        .lte("sent_at", sent_at)
        .order("sent_at", { ascending: false })
        .limit(50);

      if (!data || data.length === 0) return;

      setMessages((prev) => [...data.reverse(), ...prev]);
      requestAnimationFrame(() => {
        const el = document.getElementById(`msg-${id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };

    window.addEventListener("jump-to-msg", onJump);
    return () => window.removeEventListener("jump-to-msg", onJump);
  }, [room_id]);

  return (
    <>
      {deleteDialogOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-35 z-[9999] flex items-center justify-center transition-all duration-300`}
        >
          <div className="md:scale-100 scale-[80%] w-96 rounded-xl text-lg font-regular bg-[#111111] border-[#313131] border p-6 text-white">
            Are you sure you want to Delete this message?
            <div className="text-[#676767] mt-2 text-sm">
              You won't be able to revert this action.
            </div>
            <div className="flex justify-end gap-2 mt-6 text-sm">
              <button
                onClick={handleDeleteCancel}
                className="bg-[#111111] ease-in-out hover:bg-[#181818] hover:text-white/90 border border-[#313131] text-white py-2 px-6 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-white ease-in-out hover:bg-gray-100 hover:shadow-sm hover:shadow-white/30 text-black py-2 px-6 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-[100dvh] md:h-[92vh] flex-col relative overflow-hidden">
        {!user?.user_id || !messages ? (
          <Skeleton className="h-[780px] ml-2 w-[884px] bg-[#313131] absolute -top-[40px] rounded-[6px]" />
        ) : (
          <div
            ref={containerRef}
            onScroll={(e) => {
              if (e.currentTarget.scrollTop <= 0) {
                loadOlderMessages();
              }
            }}
            className="flex-1 w-full px-3 md:px-10 overscroll-contain overflow-y-auto pb-24 md:pb-28 flex flex-col gap-2"
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
                    <span className="font-medium">
                      {message.sender?.username}
                    </span>
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
                    <span className="font-medium">
                      {message.sender?.username}
                    </span>
                    <span className="ml-2">left the room</span>
                    <span className="ml-4">{formatToIST(message.sent_at)}</span>
                  </div>
                );
              }
              const showMeta = shouldShowMeta(index);
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${showMeta ? "mt-2" : "my-0"} ${
                    message.sender_id === user?.user_id
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {showMeta ? (
                    <Image
                      src={
                        message.sender?.user_id == user?.user_id
                          ? user?.avatar
                          : message.sender?.avatar
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
                    className={`flex flex-col max-w-[60%] ${
                      message.sender_id === user?.user_id
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {showMeta && (
                      <div
                        className={`flex items-center mb-1 gap-2 px-2 ${
                          message.sender_id === user?.user_id
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <span
                          className={`text-xs text-gray-400 ${
                            message.sender_id === user?.user_id
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {message.sender_id === user?.user_id
                            ? "You"
                            : message.sender?.username || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-600">
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
                      className={`relative group py-2 px-3 rounded-[6px] ${
                        message.type?.startsWith("image/")
                          ? "bg-transparent"
                          : message.sender_id === user?.user_id
                          ? "text-white"
                          : " text-white/80"
                      }`}
                    >
                      {message.sender_id === user?.user_id && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          className={`absolute ${
                            message.type?.startsWith("image/")
                              ? "top-0"
                              : "top-0"
                          } -left-2 rounded-[8px] flex items-center justify-center duration-400 opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          <BadgeX className="w-4 h-4 text-white/60 hover:text-white/40" />
                        </button>
                      )}

                      {/* Show image if type is image */}
                      {message.file_url &&
                        message.type?.startsWith("image/") && (
                          <img
                            src={message.file_url}
                            alt="uploaded"
                            className="md:max-w-[400px] md:max-h-[500px] rounded-lg mb-2"
                            onLoad={() => {
                              if (shouldScrollToBottom) {
                                bottomRef.current?.scrollIntoView({
                                  behavior: "auto",
                                });
                              }
                            }}
                          />
                        )}

                      {/* Show file download for non-image files */}
                      {message.file_url &&
                        !message.type?.startsWith("image/") && (
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
        )}
        {/* Input area */}
        {user?.user_id && messages && color && (
          <div
            {...getRootProps()}
            className="flex md:scale-100 scale-[70%] items-center gap-2 absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 px-3 py-3 rounded-2xl bg-[#080f17] focus-within:border-[#393939] bg-opacity-90 border border-[#313131] border-opacity-90 backdrop-blur-md"
          >
            {/* File preview */}
            {selectedFile && (
              <div
                className={`absolute bottom-full w-[450px] left-1/2 -translate-x-1/2 mb-2 bg-[#171717] px-3 py-2 rounded text-white/80 text-xs ${
                  typingUsers.size > 0 && "mb-8"
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
              <div className="absolute w-[450px] left-1/2 -translate-x-1/2 bottom-full text-xs text-gray-400 bg-[#171717] px-3 py-1.5 rounded-[10px] rounded-b-none border border-[#323232] border-b-0 backdrop-blur-sm">
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
                  sendMessage();
                }
              }}
              className="rounded-[8px] bg-transparent bg-[#121212] text-white/80 outline-none py-4 md:py-2 px-3 w-80 placeholder-[#777581]"
              type="text"
              placeholder="Press / to focus"
              disabled={uploading}
            />

            <button
              onClick={sendMessage}
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
        )}
      </div>
    </>
  );
}
