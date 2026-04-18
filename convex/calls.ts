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
      .withIndex("by_active", (q) => q.eq("roomId", args.roomId).eq("isActive", true))
      .first();
  },
});

export const getRecentCalls = query({
  args: { roomId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_room_id", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(args.limit ?? 20);
  },
});
