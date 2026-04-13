import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();
    if (!user) return null;
    return {
      ...user,
      email: user.email || identity.email,
    };
  },
});

export const createUser = mutation({
  args: {
    avatar: v.optional(v.string()),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createUser");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const userId = await ctx.db.insert("users", {
      user_id: identity.subject,
      avatar: args.avatar,
      username: args.username,
      email: identity.email,
    });

    return await ctx.db.get(userId);
  },
});

export const changeAvatar = mutation({
  args: { avatarUrl: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { avatar: args.avatarUrl });
  },
});

export const changeName = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { username: args.username });
  },
});
