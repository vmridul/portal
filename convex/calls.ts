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
      allParticipants: [identity.subject],
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
    if (!call.isActive) {
      throw new Error("Call is no longer active");
    }

    const isNewHistorical = !call.allParticipants.includes(identity.subject);
    const isNewActive = !call.participants.includes(identity.subject);

    await ctx.db.patch(args.callId, {
      participants: isNewActive
        ? [...call.participants, identity.subject]
        : call.participants,
      allParticipants: isNewHistorical
        ? [...call.allParticipants, identity.subject]
        : call.allParticipants,
    });
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

export const endCall = mutation({
  args: { callId: v.id("calls") },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) return;
    if (!call.isActive && call.endedAt) return;

    await ctx.db.patch(args.callId, {
      isActive: false,
      endedAt: Date.now(),
      participants: [],
    });
  },
});

export const getActiveCalls = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_active", (q) => q.eq("roomId", args.roomId).eq("isActive", true))
      .collect();
  },
});

export const getRecentCalls = query({
  args: { roomId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const calls = await ctx.db
      .query("calls")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(args.limit ?? 20);
    return calls.filter((c) => !c.isActive || c.endedAt !== undefined);
  },
});
export const listAllActiveCalls = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_status", (q) => q.eq("isActive", true))
      .collect();
  },
});
