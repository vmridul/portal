import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Friends Queries
export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return Promise.all(
      friendships.map(async (f) => {
        const friend = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", f.friend_id))
          .first();
        return {
          id: f._id,
          friend,
          last_msg: f.last_msg,
          updated_at: f.updated_at,
          _creationTime: f._creationTime,
          unread_count: f.unread_count || 0,
        };
      }),
    );
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return Promise.all(
      requests.map(async (r) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", r.user_id))
          .first();
        return {
          id: r._id,
          _creationTime: r._creationTime,
          sender,
        };
      }),
    );
  },
});

export const getSentRequests = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return Promise.all(
      requests.map(async (r) => {
        const receiver = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", r.friend_id))
          .first();
        return {
          id: r._id,
          _creationTime: r._creationTime,
          receiver,
        };
      }),
    );
  },
});

export const sendRequest = mutation({
  args: { receiver_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    if (identity.subject === args.receiver_id) {
      throw new Error("Cannot add yourself");
    }

    const receiver = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.receiver_id))
      .first();

    if (!receiver) {
      throw new Error("User does not exist");
    }

    const existing1 = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("friend_id"), args.receiver_id))
      .first();

    const existing2 = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.receiver_id))
      .filter((q) => q.eq(q.field("friend_id"), identity.subject))
      .first();

    if (existing1 || existing2) {
      throw new Error("Friend request already exists or already friends");
    }

    await ctx.db.insert("friends", {
      user_id: identity.subject,
      friend_id: args.receiver_id,
      status: "pending",
      updated_at: new Date().toISOString(),
    });
  },
});

export const acceptRequest = mutation({
  args: { requestId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.friend_id !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.requestId, {
      status: "accepted",
      updated_at: new Date().toISOString(),
    });

    await ctx.db.insert("friends", {
      user_id: identity.subject,
      friend_id: request.user_id,
      status: "accepted",
      updated_at: new Date().toISOString(),
    });
  },
});

export const rejectRequest = mutation({
  args: { requestId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (
      request.friend_id !== identity.subject &&
      request.user_id !== identity.subject
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.requestId);
  },
});

export const removeFriend = mutation({
  args: { friend_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const link1 = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("friend_id"), args.friend_id))
      .first();

    const link2 = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.friend_id))
      .filter((q) => q.eq(q.field("friend_id"), identity.subject))
      .first();

    if (link1) await ctx.db.delete(link1._id);
    if (link2) await ctx.db.delete(link2._id);
  },
});
