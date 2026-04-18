# Calls Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a calls sidebar to display ongoing and recent audio calls. Users can start, join, and leave group audio calls directly from the sidebar.

**Architecture:** Add "calls" tab to existing sidebar system. Create new sidebar components for active call panel and recent calls list. Extend UI store for call state. Add Convex schema and API functions for call management. Use Convex reactive queries for real-time updates.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, Convex, Lucide React

---

## File Inventory

| Action | File | Purpose |
|--------|------|---------|
| Modify | `store/uiStore.tsx` | Add `calls` sidebar tab + active call state |
| Modify | `components/layout/TopBar.tsx` | Add call button |
| Modify | `components/shared/DetailsSidebar.tsx` | Wire up calls tab |
| Create | `components/shared/sidebar/CallSidebar.tsx` | Main call sidebar container |
| Create | `components/shared/sidebar/ActiveCallPanel.tsx` | Active call display |
| Create | `components/shared/sidebar/RecentCallsList.tsx` | Call history list |
| Create | `convex/calls.ts` | Convex API for calls |
| Create | `convex/schema.ts` (or existing) | Add calls table |
| Create | `hooks/useCalls.ts` | Hook for call operations |

---

## Task 1: Update UI Store

**Files:**
- Modify: `store/uiStore.tsx:1-108`

- [ ] **Step 1: Update sidebarTab type to include "calls"**

```typescript
// Line 40: Change
sidebarTab: "info" | "media";
// To
sidebarTab: "info" | "media" | "calls";
```

- [ ] **Step 2: Update setSidebarTab and toggleSidebar to accept "calls"**

```typescript
// Line 42: Change
setSidebarTab: (v: "info" | "media") => void;
// To
setSidebarTab: (v: "info" | "media" | "calls") => void;

// Line 43: Change  
toggleSidebar: (tab?: "info" | "media") => void;
// To
toggleSidebar: (tab?: "info" | "media" | "calls") => void;
```

- [ ] **Step 3: Add active call state**

```typescript
// Add after line 43 (in type definition):
activeCall: {
  callId: string;
  isMuted: boolean;
} | null;
setActiveCall: (call: { callId: string; isMuted: boolean } | null) => void;

// Add after line 84 (in implementation):
activeCall: null,
setActiveCall: (call) => set({ activeCall: call }),
```

- [ ] **Step 4: Commit**

```bash
git add store/uiStore.tsx
git commit -m "feat: add calls tab to UI store"
```

---

## Task 2: Add Convex Schema & API

**Files:**
- Explore: Find schema file location (`convex/schema.ts` or similar)
- Create: `convex/calls.ts`
- Modify: Add calls table to schema

- [ ] **Step 1: Find and read convex schema file**

Run: `ls convex/` to find schema
Read: The schema file to understand pattern

- [ ] **Step 2: Add calls table to schema**

```typescript
// Add after tables definition (pattern follows existing tables):
calls: defineSchema({
  table: "calls",
  schema: {
    roomId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    participants: v.array(v.string()), // user IDs
    initiatorId: v.string(),
    isActive: v.boolean(),
  }
})
```

- [ ] **Step 3: Create calls.ts API**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const startCall = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const callId = await ctx.db.insert("calls", {
      roomId: args.roomId,
      startedAt: Date.now(),
      participants: [identity.subject],
      initiatorId: identity.subject,
      isActive: true,
    });
    return callId;
  },
});

export const joinCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const call = await ctx.db.get(args.callId);
    if (!call) throw new Error("Call not found");
    if (!call.participants.includes(identity.subject)) {
      await ctx.db.patch(args.callId, {
        participants: [...call.participants, identity.subject],
      });
    }
  },
});

export const leaveCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const call = await ctx.db.get(args.callId);
    if (!call) return;

    const newParticipants = call.participants.filter((p) => p !== identity.subject);
    if (newParticipants.length === 0) {
      await ctx.db.patch(args.callId, {
        isActive: false,
        endedAt: Date.now(),
        participants: [],
      });
    } else {
      await ctx.db.patch(args.callId, { participants: newParticipants });
    }
  },
});

export const getActiveCall = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .filter((q) => q.and(q.eq(q.field("roomId"), args.roomId), q.eq(q.field("isActive"), true))
      .first();
  },
});

export const getRecentCalls = query({
  args: { roomId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add convex/
git commit -m "feat: add calls API and schema"
```

---

## Task 3: Create useCalls Hook

**Files:**
- Create: `hooks/useCalls.ts`

- [ ] **Step 1: Create useCalls hook**

```typescript
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCalls(roomId: string) {
  const startCall = useMutation(api.calls.startCall);
  const joinCall = useMutation(api.calls.joinCall);
  const leaveCall = useMutation(api.calls.leaveCall);
  const activeCall = useQuery(api.calls.getActiveCall, { roomId });
  const recentCalls = useQuery(api.calls.getRecentCalls, { roomId, limit: 20 });

  return {
    startCall: () => startCall({ roomId }),
    joinCall: (callId: string) => joinCall({ callId }),
    leaveCall: (callId: string) => leaveCall({ callId }),
    activeCall,
    recentCalls: recentCalls ?? [],
    isLoading: activeCall === undefined || recentCalls === undefined,
  };
}
```

- [ ] **Step 2: Export from hooks index**

Check `hooks/index.ts` and add export

- [ ] **Step 3: Commit**

```bash
git add hooks/
git commit -m "feat: add useCalls hook"
```

---

## Task 4: Add Call Button to TopBar

**Files:**
- Modify: `components/layout/TopBar.tsx:143-173`

- [ ] **Step 1: Add Phone import**

```typescript
// Line 2: Change
import { Search, Image as ImageIcon, Info, Menu, Users } from "lucide-react";
// To
import { Search, Image as ImageIcon, Info, Menu, Users, Phone } from "lucide-react";
```

- [ ] **Step 2: Add Phone button after Info button (line 162)**

```typescript
// After the Info button closing </div>, add:
<div
  onClick={(e) => {
    e.stopPropagation();
    toggleSidebar("calls");
  }}
  className={`flex-none w-8 select-none h-8 p-2 cursor-pointer rounded-xl flex items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === "calls" ? "bg-theme-hover" : "hover:bg-theme-hover"
    }`}
>
  <Phone className={`w-4 h-4 transition-colors ${isSidebarOpen && sidebarTab === "calls" ? "text-white" : "text-gray-300"}`} />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/TopBar.tsx
git commit -m "feat: add call button to TopBar"
```

---

## Task 5: Create Call Sidebar Components

**Files:**
- Create: `components/shared/sidebar/CallSidebar.tsx`
- Create: `components/shared/sidebar/ActiveCallPanel.tsx`
- Create: `components/shared/sidebar/RecentCallsList.tsx`

- [ ] **Step 1: Create CallSidebar.tsx**

```typescript
import { useCalls } from "@/hooks";
import { useUIStore } from "@/store/uiStore";
import ActiveCallPanel from "./ActiveCallPanel";
import RecentCallsList from "./RecentCallsList";

interface CallSidebarProps {
  roomId: string;
}

export default function CallSidebar({ roomId }: CallSidebarProps) {
  const { activeCall, recentCalls, isLoading } = useCalls(roomId);
  const setActiveCall = useUIStore((s) => s.setActiveCall);

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {activeCall && (
        <ActiveCallPanel
          call={activeCall}
          onLeave={() => {
            setActiveCall(null);
          }}
        />
      )}
      <RecentCallsList roomId={roomId} calls={recentCalls} />
    </div>
  );
}
```

- [ ] **Step 2: Create ActiveCallPanel.tsx**

```typescript
import { useState, useEffect } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useCalls } from "@/hooks";
import { useUIStore } from "@/store/uiStore";

interface Call {
  _id: string;
  participants: string[];
  startedAt: number;
  roomId: string;
}

interface ActiveCallPanelProps {
  call: Call;
  onLeave: () => void;
}

function formatDuration(startMs: number): string {
  const seconds = Math.floor((Date.now() - startMs) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ActiveCallPanel({ call, onLeave }: ActiveCallPanelProps) {
  const { leaveCall } = useCalls(call.roomId);
  const activeCallState = useUIStore((s) => s.activeCall);
  const [isMuted, setIsMuted] = useState(activeCallState?.isMuted ?? false);
  const [duration, setDuration] = useState(formatDuration(call.startedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(call.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [call.startedAt]);

  const handleLeave = async () => {
    await leaveCall(call._id);
    onLeave();
  };

  return (
    <div className="p-3 border-b border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Active Call</span>
        </div>
        <span className="text-xs text-gray-400">{duration}</span>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        {call.participants.length} participant{call.participants.length !== 1 ? "s" : ""}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            isMuted ? "bg-red-500/20 text-red-400" : "bg-theme-hover text-white"
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
        </button>
        <button
          onClick={handleLeave}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="text-sm">Leave</span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create RecentCallsList.tsx**

```typescript
import { Phone } from "lucide-react";
import { useCalls } from "@/hooks";
import { useUIStore } from "@/store/uiStore";

interface Call {
  _id: string;
  participants: string[];
  startedAt: number;
  endedAt?: number;
  isActive: boolean;
}

function formatCallTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCallDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupCallsByDate(calls: Call[]): Record<string, Call[]> {
  const groups: Record<string, Call[]> = {};
  for (const call of calls) {
    const dateKey = formatCallDate(call.startedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(call);
  }
  return groups;
}

interface RecentCallsListProps {
  roomId: string;
  calls: Call[];
}

export default function RecentCallsList({ roomId, calls }: RecentCallsListProps) {
  const { startCall } = useCalls(roomId);
  const setActiveCall = useUIStore((s) => s.setActiveCall);
  const grouped = groupCallsByDate(calls);

  const handleStartNewCall = async () => {
    await startCall();
    setActiveCall({ callId: "", isMuted: false });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3">
        <button
          onClick={handleStartNewCall}
          className="w-full py-2 px-4 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Start New Call
        </button>
      </div>

      {Object.entries(grouped).map(([date, dateCalls]) => (
        <div key={date} className="border-t border-theme-border">
          <div className="px-3 py-2 text-xs text-gray-500 uppercase">{date}</div>
          {dateCalls.map((call) => (
            <div
              key={call._id}
              className="px-3 py-2 hover:bg-theme-hover cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-theme-base flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    {call.participants.length} participants
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCallTime(call.startedAt)}
                  </div>
                </div>
                {call.endedAt && (
                  <div className="text-xs text-gray-500">
                    {Math.round((call.endedAt - call.startedAt) / 60000)}m
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/shared/sidebar/
git commit -m "feat: add call sidebar components"
```

---

## Task 6: Wire Up in DetailsSidebar

**Files:**
- Modify: `components/shared/DetailsSidebar.tsx`

- [ ] **Step 1: Read and explore DetailsSidebar.tsx**

Find how it imports and switches between tabs

- [ ] **Step 2: Add CallSidebar import and switch case**

Pattern follows existing `info` and `media` tabs:

```typescript
import CallSidebar from "./sidebar/CallSidebar";

// In the switch/case for sidebarTab:
case "calls":
  return <CallSidebar roomId={conversationId} />;
```

- [ ] **Step 3: Commit**

```bash
git add components/shared/DetailsSidebar.tsx
git commit -m "feat: wire up calls sidebar"
```

---

## Task 7: Verify & Fix

**Files:**
- Verify entire flow

- [ ] **Step 1: Run type check**

Run: `npm run typecheck` (or check package.json for command)

- [ ] **Step 2: Run build**

Run: `npm run build`

- [ ] **Step 3: Fix any errors**

Address all issues before declaring complete

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete calls sidebar feature"
```

---

## Execution Option

**Plan complete and saved to `docs/superpowers/plans/2026-04-18-calls-sidebar.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**