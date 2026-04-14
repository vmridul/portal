import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 5 * 60 * 1000;

    const oldRecords = await ctx.db
      .query("presence")
      .filter((q) => q.lt(q.field("updated_at"), cutoff))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.delete(record._id);
    }
  },
});

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

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 2 * 60 * 1000;
    const active = await ctx.db
      .query("presence")
      .filter((q) => q.gte(q.field("updated_at"), threshold))
      .collect();

    return active;
  },
});
