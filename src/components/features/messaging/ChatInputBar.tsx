import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useKeyboardOffset } from "@/hooks/ui/useKeyboardOffset";
import { useDropzone } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { validateFile, formatFileSize } from "@/lib/utils/file";
import { getFileIcon } from "@/lib/utils/file-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Attachment01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  useMessageActions,
  useTypingIndicators,
} from "@/hooks/useMessageActions";
import { ProgressCircle } from "@/components/shared/ProgressCircle";
import Image from "next/image";
import { ChatEmojiPicker } from "./ChatEmojiPicker";
import { useUIStore } from "@/store/uiStore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";

interface ChatInputBarProps {
  room_id: string;
  type: "room" | "direct";
  color: string;
  textColor: string;
  scrollToBottom: () => void;
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  storageId: string | null;
}

const initialUploadState: UploadState = {
  file: null,
  isUploading: false,
  progress: 0,
  storageId: null,
};

export function ChatInputBar({
  room_id,
  type,
  color,
  textColor,
  scrollToBottom,
}: ChatInputBarProps) {
  const [msg, setMsg] = useState("");
  const [upload, setUpload] = useState<UploadState>(initialUploadState);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { setTyping, clearTyping } = useTypingIndicators(room_id);
  const { sendMessage, generateUploadUrl } = useMessageActions();
  const { editingMessage, setEditingMessage } = useUIStore();
  const updateMessage = useMutation(api.messages.updateMessage);

  useEffect(() => {
    if (editingMessage) {
      setMsg(editingMessage.content);
      inputRef.current?.focus();
    } else {
      setMsg("");
    }
  }, [editingMessage]);

  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    [],
  );

  useKeyboardOffset();

  const previewUrl = useMemo(() => {
    if (!upload.file) return null;
    if (upload.file.type.startsWith("image/")) {
      return URL.createObjectURL(upload.file);
    }
    return null;
  }, [upload.file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startUpload = useCallback(
    async (file: File) => {
      setUpload((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        storageId: null,
      }));

      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const uploadUrl = await generateUploadUrl();
        const storageId = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setUpload((prev) => ({
                ...prev,
                progress: (event.loaded / event.total) * 100,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText).storageId);
            } else {
              reject(new Error("Upload failed"));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.onabort = () => reject(new Error("Upload aborted"));
          xhr.send(file);

          abortControllerRef.current?.signal.addEventListener("abort", () =>
            xhr.abort(),
          );
        });

        setUpload((prev) => ({ ...prev, storageId }));
      } catch (error: any) {
        if (error.message !== "Upload aborted") {
          console.error(error);
          toast.error("File upload failed");
          setUpload(initialUploadState);
        }
      } finally {
        setUpload((prev) => ({ ...prev, isUploading: false }));
      }
    },
    [generateUploadUrl],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setUpload((prev) => ({ ...prev, file }));
      startUpload(file);
    },
    [startUpload],
  );

  const handleSendMessage = useCallback(async () => {
    if (!msg.trim() && !upload.file) return;

    if (editingMessage) {
      if (!msg.trim() || msg === editingMessage.content) {
        setEditingMessage(null);
        return;
      }
      try {
        await updateMessage({
          msg_id: editingMessage.id as Id<"messages">,
          content: msg,
        });
        setEditingMessage(null);
        setMsg("");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update message");
      }
      return;
    }

    let storageId = upload.storageId;

    if (upload.file && !storageId) {
      if (upload.isUploading) {
        toast.info("Waiting for upload to finish...");
        const waitForUpload = () =>
          new Promise<string | null>((resolve) => {
            const check = setInterval(() => {
              setUpload((prev) => {
                if (!prev.isUploading) {
                  clearInterval(check);
                  resolve(prev.storageId);
                }
                return prev;
              });
            }, 100);
          });
        storageId = await waitForUpload();
        if (!storageId) return;
      } else {
        await startUpload(upload.file);
        storageId = upload.storageId;
      }
    }

    try {
      await sendMessage({
        conversation_id: room_id,
        conversation_type: type,
        msg: msg || null,
        file_storage_id: storageId || undefined,
        file_type: upload.file?.type || null,
        file_name: upload.file?.name || null,
        file_size: upload.file?.size,
      });

      setMsg("");
      setUpload(initialUploadState);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
      await clearTyping();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  }, [
    msg,
    upload,
    room_id,
    type,
    sendMessage,
    startUpload,
    clearTyping,
    scrollToBottom,
    editingMessage,
    setEditingMessage,
    updateMessage,
  ]);

  const onEmojiClick = useCallback(
    (emojiData: any) => {
      const emoji = emojiData.emoji;
      const textarea = inputRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = msg;
      const newText = text.substring(0, start) + emoji + text.substring(end);

      setMsg(newText);

      const newCursorPos = start + emoji.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [msg],
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMsg(e.target.value);
      if (e.target.value.trim()) {
        setTyping();
      } else {
        clearTyping();
      }
    },
    [setTyping, clearTyping],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      const file = files[0];
      if (file) {
        const validation = validateFile(file);
        if (validation.valid) {
          setUpload((prev) => ({ ...prev, file }));
          startUpload(file);
        } else {
          toast.error(validation.error);
        }
      }
    },
    noClick: true,
  });

  const FileIcon = upload.file ? getFileIcon(upload.file.type) : null;

  return (
    <div
      {...getRootProps()}
      className="flex flex-col z-[99] md:w-[50%] md:min-w-[400px] w-[80%] relative md:px-3 px-2 py-1 md:py-3 rounded-xl bg-theme-surface border border-theme-border transition-all duration-300 ease-in-out"
      style={
        isMobile
          ? {
              transform: "translateY(calc(-1 * var(--keyboard-offset)))",
              transition: "transform 0.2s ease-out",
            }
          : undefined
      }
    >
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${upload.file ? "max-h-32 opacity-100 mb-2" : "max-h-0 opacity-0"}`}
      >
        {upload.file && (
          <div className="flex items-center gap-3 pb-1 bg-theme-surface/40 rounded-xl  relative group">
            <div className="relative w-12 h-12 flex-shrink-0">
              {previewUrl ? (
                <div className="w-full h-full rounded-lg overflow-hidden relative border border-theme-hover">
                  <Image
                    src={previewUrl}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-lg bg-theme-base flex items-center justify-center border border-theme-hover">
                  {FileIcon && (
                    <HugeiconsIcon
                      icon={FileIcon}
                      className="w-6 h-6 text-gray-400"
                    />
                  )}
                </div>
              )}

              {upload.isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
                  <ProgressCircle
                    progress={upload.progress}
                    size={32}
                    strokeWidth={2}
                    color={"white"}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <p className="text-sm text-gray-300 truncate font-medium">
                {upload.file.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formatFileSize(upload.file.size)}
              </p>
            </div>

            <button
              onClick={() => {
                abortControllerRef.current?.abort();
                setUpload(initialUploadState);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 p-2 hover:bg-theme-hover rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${editingMessage ? "max-h-20 opacity-100 mb-2" : "max-h-0 opacity-0"}`}
      >
        {editingMessage && (
          <div className="flex items-center rounded-xl relative text-gray-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg">
              <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <p className="text-sm">Editing</p>
            </div>
            <button
              onClick={() => setEditingMessage(null)}
              className="absolute top-2 right-2 p-1 hover:bg-theme-hover rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          {...getInputProps()}
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        <TextareaAutosize
          ref={inputRef}
          onPaste={(e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile();
                if (file) {
                  const validation = validateFile(file);
                  if (validation.valid) {
                    setUpload((prev) => ({ ...prev, file }));
                    startUpload(file);
                  } else toast.error(validation.error);
                  break;
                }
              }
            }
          }}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            } else if (e.key === "Escape" && editingMessage) {
              setEditingMessage(null);
            }
          }}
          value={msg}
          onBlur={() => clearTyping()}
          placeholder={
            editingMessage ? "Editing message..." : "Press / to focus"
          }
          minRows={1}
          maxRows={6}
          className="w-full rounded-[8px] text-sm bg-transparent text-gray-200 outline-none py-[10px] md:py-2 px-3   placeholder-[#58565f] resize-none overflow-y-auto break-words whitespace-pre-wrap"
        />
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-theme-border py-2 px-2 rounded-[12px] text-white hover:bg-theme-border disabled:opacity-50"
              disabled={upload.isUploading && !msg.trim()}
            >
              <HugeiconsIcon
                icon={Attachment01Icon}
                className="text-gray-400 w-4 h-4"
              />
            </button>
            <ChatEmojiPicker
              onEmojiSelect={onEmojiClick}
              disabled={upload.isUploading && !msg.trim()}
              inputRef={inputRef}
            />
          </div>
          <button
            onClick={handleSendMessage}
            style={{ backgroundColor: color, color: textColor }}
            className="py-3 px-3 rounded-[12px] disabled:opacity-50"
            disabled={!msg.trim() && !upload.file}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isDragActive && (
        <div className="z-[9999] flex justify-center border border-dashed border-white/50 items-center absolute top-0 left-0 rounded-2xl w-full h-full bg-[#1a1a1a] bg-opacity-90 backdrop-blur-sm">
          <span className="text-white/50 tracking-wider text-xl font-bold">
            DROP TO ATTACH
          </span>
        </div>
      )}
    </div>
  );
}
