import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useKeyboardOffset } from "@/hooks/ui/useKeyboardOffset";
import { useDropzone } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { validateFile, formatFileSize } from "@/lib/utils/file";
import { getFileIcon } from "@/lib/utils/file-icons";
import { Send, Plus, X as CloseIcon, Paperclip, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useMessageActions, useTypingIndicators } from "@/hooks/useMessageActions";
import { ProgressCircle } from "@/components/shared/ProgressCircle";
import Image from "next/image";
import { ChatEmojiPicker } from "./ChatEmojiPicker";

interface ChatInputBarProps {
  room_id: string;
  type: "room" | "direct";
  color: string;
  textColor: string;
  scrollToBottom: () => void;
}

export function ChatInputBar({ room_id, type, color, textColor, scrollToBottom }: ChatInputBarProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedStorageId, setUploadedStorageId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const { setTyping, clearTyping } = useTypingIndicators(room_id);
  const { sendMessage, generateUploadUrl } = useMessageActions();

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  useKeyboardOffset();

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.type.startsWith("image/")) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  // Clean up ObjectURL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadedStorageId(null);

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
            setUploadProgress((event.loaded / event.total) * 100);
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

        abortControllerRef.current?.signal.addEventListener("abort", () => xhr.abort());
      });

      setUploadedStorageId(storageId);
    } catch (error: any) {
      if (error.message !== "Upload aborted") {
        console.error(error);
        toast.error("File upload failed");
        setSelectedFile(null);
      }
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setSelectedFile(file);
    startUpload(file);
  }, [startUpload]);

  const handleSendMessage = useCallback(async () => {
    if (!msg.trim() && !selectedFile) return;

    let storageId = uploadedStorageId;

    if (selectedFile && !storageId) {
      if (uploading) {
        // Wait for upload to catch up
        toast.info("Waiting for upload to finish...");
        const waitForUpload = () => new Promise<string | null>((resolve) => {
          const check = setInterval(() => {
            if (!uploading) {
              clearInterval(check);
              resolve(uploadedStorageId);
            }
          }, 100);
        });
        storageId = await waitForUpload();
        if (!storageId) return; // Upload failed during wait
      } else {
        await startUpload(selectedFile);
        storageId = uploadedStorageId;
      }
    }

    try {
      await sendMessage({
        conversation_id: room_id,
        conversation_type: type,
        msg: msg || null,
        file_storage_id: storageId || undefined,
        file_type: selectedFile?.type || null,
        file_name: selectedFile?.name || null,
        file_size: selectedFile?.size,
      });

      setMsg("");
      setSelectedFile(null);
      setUploadedStorageId(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
      await clearTyping();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  }, [msg, selectedFile, uploadedStorageId, uploading, room_id, type, sendMessage, startUpload, clearTyping, scrollToBottom]);

  const onEmojiClick = useCallback((emojiData: any) => {
    const emoji = emojiData.emoji;
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = msg;
    const newText = text.substring(0, start) + emoji + text.substring(end);

    setMsg(newText);

    // Set cursor position after emoji
    const newCursorPos = start + emoji.length;
    setCursorPosition(newCursorPos);

    // Auto-focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [msg]);

  // Keep focus and cursor position after state update
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition]);

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
          setSelectedFile(file);
          startUpload(file);
        } else {
          toast.error(validation.error);
        }
      }
    },
    noClick: true,
  });

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : null;

  return (
    <div
      {...getRootProps()}
      className="flex flex-col z-[1000] md:w-[50%] md:min-w-[400px] w-[80%] absolute bottom-4 md:px-3 px-2 py-1 md:py-3 rounded-xl bg-theme-surface border border-theme-border transition-all duration-300 ease-in-out"
      style={
        isMobile
          ? {
            transform: "translateY(calc(-1 * var(--keyboard-offset)))",
            transition: "transform 0.2s ease-out",
          }
          : undefined
      }
    >
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedFile ? "max-h-32 opacity-100 mb-2" : "max-h-0 opacity-0"}`}>
        {selectedFile && (
          <div className="flex items-center gap-3 pb-1 bg-theme-surface/40 rounded-xl  relative group">
            <div className="relative w-12 h-12 flex-shrink-0">
              {previewUrl ? (
                <div className="w-full h-full rounded-lg overflow-hidden relative border border-theme-hover">
                  <Image src={previewUrl} alt="preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-full rounded-lg bg-theme-base flex items-center justify-center border border-theme-hover">
                  {FileIcon && <FileIcon className="w-6 h-6 text-gray-400" />}
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
                  <ProgressCircle progress={uploadProgress} size={32} strokeWidth={2} color={"white"} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <p className="text-sm text-gray-300 truncate font-medium">{selectedFile.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              onClick={() => {
                abortControllerRef.current?.abort();
                setSelectedFile(null);
                setUploadedStorageId(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 p-2 hover:bg-theme-hover rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <CloseIcon className="w-4 h-4" />
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
                    setSelectedFile(file);
                    startUpload(file);
                  }
                  else toast.error(validation.error);
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
            }
          }}
          value={msg}
          onBlur={() => clearTyping()}
          placeholder="Press / to focus"
          minRows={1}
          maxRows={6}
          className="w-full rounded-[8px] text-sm bg-transparent text-gray-200 outline-none py-[10px] md:py-2 px-3   placeholder-[#58565f] resize-none overflow-y-auto break-words whitespace-pre-wrap"
        />
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border border-theme-border py-2 px-2 rounded-[12px] text-white hover:bg-theme-border disabled:opacity-50"
              disabled={uploading && !msg.trim()}
            >
              <Paperclip className="text-gray-400 w-4 h-4" />
            </button>
            <ChatEmojiPicker
              onEmojiSelect={onEmojiClick}
              disabled={uploading && !msg.trim()}
              inputRef={inputRef}
            />
          </div>
          <button
            onClick={handleSendMessage}
            style={{ backgroundColor: color, color: textColor }}
            className="py-3 px-3 rounded-[12px] disabled:opacity-50"
            disabled={(!msg.trim() && !selectedFile)}
          >
            <ArrowRight className="w-3 h-3" />
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
