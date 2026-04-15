import React, { useState, useCallback, useRef, useEffect } from "react";
import { useKeyboardOffset } from "@/hooks/ui/useKeyboardOffset";
import { useDropzone } from "react-dropzone";
import TextareaAutosize from "react-textarea-autosize";
import { validateFile } from "@/lib/utils/file";
import { Send, Plus, BadgeX } from "lucide-react";
import { toast } from "sonner";
import { useMessageActions, useTypingIndicators } from "@/hooks/useMessageActions";

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
  const [msg, setMsg] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setTyping, clearTyping } = useTypingIndicators(room_id);
  const { sendMessage, generateUploadUrl } = useMessageActions();

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  useKeyboardOffset();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!msg.trim() && !selectedFile) return;
    setUploading(true);

    try {
      let storageId: string | undefined;
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
        const data = await result.json();
        storageId = data.storageId;
      }

      await sendMessage({
        conversation_id: room_id,
        conversation_type: type,
        msg: msg || null,
        file_storage_id: storageId,
        file_type: finalFileType,
        file_name: finalFileName,
      });

      setMsg("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
      await clearTyping();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setUploading(false);
    }
  }, [msg, selectedFile, type, room_id, sendMessage, generateUploadUrl, clearTyping, scrollToBottom]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if already focusing an input or textarea
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
      if (files[0]) {
        const validation = validateFile(files[0]);
        if (validation.valid) {
          setSelectedFile(files[0]);
        } else {
          toast.error(validation.error);
        }
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex items-center z-[1000] gap-2 absolute bottom-4 md:px-3 px-2 py-1 md:py-3 rounded-2xl bg-theme-base bg-opacity-90 border border-theme-border border-opacity-90 backdrop-blur-md"
      style={
        isMobile
          ? {
              transform: "translateY(calc(-1 * var(--keyboard-offset)))",
              transition: "transform 0.2s ease-out",
            }
          : undefined
      }
    >
      {selectedFile && (
        <div className="absolute bottom-full justify-between flex w-full left-1/2 -translate-x-1/2 mb-2 bg-theme-base px-3 py-2 rounded text-gray-300 text-xs shadow">
          <span>{selectedFile.name}</span>
          <BadgeX
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="ml-2 w-4 cursor-pointer h-4 text-gray-400"
          />
        </div>
      )}

      <input
        {...getInputProps()}
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-theme-surface/60 py-2 px-3 rounded-2xl text-white hover:bg-theme-surface disabled:opacity-50"
        disabled={uploading}
      >
        <Plus className="text-[#a89691] w-7 h-8" />
      </button>

      <TextareaAutosize
        ref={inputRef}
        onPaste={(e) => {
          const items = e.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                const validation = validateFile(file);
                if (validation.valid) setSelectedFile(file);
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
        disabled={uploading}
        minRows={1}
        maxRows={6}
        className="rounded-[8px] bg-transparent text-white/80 outline-none py-[10px] md:py-2 px-3 w-fit md:w-80 placeholder-[#58565f] resize-none overflow-y-auto break-words whitespace-pre-wrap"
      />
      <button
        onClick={handleSendMessage}
        style={{ backgroundColor: color, color: textColor }}
        className="py-2 px-3 rounded-2xl disabled:opacity-50"
        disabled={uploading || (!msg.trim() && !selectedFile)}
      >
        <Send className="w-6 h-7" />
      </button>
      {isDragActive && (
        <div className="z-[9999] flex justify-center border border-dashed border-white/50 items-center absolute top-0 left-0 rounded-[10px] w-full h-full bg-[#313131] bg-opacity-80">
          <span className="text-white/50 tracking-wider text-xl">
            DROP HERE
          </span>
        </div>
      )}
    </div>
  );
}
