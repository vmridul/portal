import React from "react";

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}
