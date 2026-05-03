import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const update = mutation({
  args: { status: v.union(v.literal("online"), v.literal("away")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        updated_at: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        user_id: identity.subject,
        status: args.status,
        updated_at: Date.now(),
      });
    }
  },
});

// Lightweight heartbeat — only touches updated_at, called every 3 minutes
export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { updated_at: Date.now() });
    }
  },
});

// Explicit offline — called on beforeunload/pagehide for instant cleanup
export const goOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Cron cleanup — deletes records that haven't heartbeated in >5 minutes
export const cleanupStalePresence = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allPresence = await ctx.db.query("presence").collect();
    for (const record of allPresence) {
      if (!record.updated_at || now - record.updated_at > STALE_THRESHOLD) {
        await ctx.db.delete(record._id);
      }
    }
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("presence").collect();
  },
});
