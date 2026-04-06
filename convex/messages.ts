import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRoomMessages = query({
  args: { room_id: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("messages")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .order("desc");

    const rawMessages = await (args.limit ? q.take(args.limit) : q.collect());
    const messages = rawMessages.reverse();

    const result = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", msg.sender_id))
          .first();

        let finalUrl = msg.file_url;
        if (msg.file_storage_id) {
          finalUrl = await ctx.storage.getUrl(msg.file_storage_id);
        }

        return {
          ...msg,
          file_url: finalUrl,
          sender,
        };
      }),
    );
    return result;
  },
});

export const getUnreadCount = query({
  args: { room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const member = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    return member?.unread_count || 0;
  },
});

export const clearUnreadCount = mutation({
  args: { room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const member = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    if (member) {
      await ctx.db.patch(member._id, { unread_count: 0 });
    }
  },
});

export const getFriendUnreadCount = query({
  args: { friend_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("friend_id"), args.friend_id))
      .first();

    return friendship?.unread_count || 0;
  },
});

export const clearFriendUnreadCount = mutation({
  args: { friend_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("friend_id"), args.friend_id))
      .first();

    if (friendship) {
      await ctx.db.patch(friendship._id, { unread_count: 0 });
    }
  },
});

export const searchMessages = query({
  args: { room_id: v.string(), query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .order("desc")
      .take(100);

    let filtered = messages.filter(
      (m) =>
        m.type !== "system" &&
        m.content &&
        m.content.toLowerCase().includes(args.query.toLowerCase()),
    );

    if (filtered.length > 20) {
      filtered = filtered.slice(0, 20);
    }

    const result = await Promise.all(
      filtered.map(async (msg) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", msg.sender_id))
          .first();

        return {
          ...msg,
          sender,
        };
      }),
    );

    return result;
  },
});

export const getFriendMessages = query({
  args: { friend_id: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const myId = identity.subject;

    const msgs1 = await ctx.db
      .query("friendMessages")
      .withIndex("by_receiver_id", (q) => q.eq("receiver_id", args.friend_id))
      .filter((q) => q.eq(q.field("sender_id"), myId))
      .collect();

    const msgs2 = await ctx.db
      .query("friendMessages")
      .withIndex("by_receiver_id", (q) => q.eq("receiver_id", myId))
      .filter((q) => q.eq(q.field("sender_id"), args.friend_id))
      .collect();

    let allMessages = [...msgs1, ...msgs2];

    allMessages.sort((a, b) => a._creationTime - b._creationTime);

    if (args.limit && args.limit < allMessages.length) {
      allMessages = allMessages.slice(-args.limit);
    }

    const result = await Promise.all(
      allMessages.map(async (msg) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("user_id", msg.sender_id))
          .first();

        let finalUrl = msg.file_url;
        if (msg.file_storage_id) {
          finalUrl = await ctx.storage.getUrl(msg.file_storage_id);
        }

        return {
          ...msg,
          file_url: finalUrl,
          sender,
        };
      }),
    );

    return result;
  },
});

export const sendMessage = mutation({
  args: {
    type: v.union(v.literal("room"), v.literal("friend")),
    room_id: v.string(),
    msg: v.union(v.string(), v.null()),
    file_storage_id: v.optional(v.id("_storage")),
    file_type: v.union(v.string(), v.null()),
    file_name: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    if (args.type === "room") {
      await ctx.db.insert("messages", {
        room_id: args.room_id,
        sender_id: identity.subject,
        content: args.msg || null,
        file_storage_id: args.file_storage_id,
        file_url: null,
        type: args.file_type || null,
        file_name: args.file_name || null,
      });

      const members = await ctx.db
        .query("roomMembers")
        .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
        .collect();

      for (const member of members) {
        if (member.user_id !== identity.subject) {
          await ctx.db.patch(member._id, {
            unread_count: (member.unread_count || 0) + 1,
          });
        }
      }
    } else {
      await ctx.db.insert("friendMessages", {
        receiver_id: args.room_id,
        sender_id: identity.subject,
        content: args.msg || null,
        file_storage_id: args.file_storage_id,
        file_url: null,
        type: args.file_type || null,
        file_name: args.file_name || null,
      });

      const friendship1 = await ctx.db
        .query("friends")
        .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
        .filter((q) => q.eq(q.field("friend_id"), args.room_id))
        .first();

      const friendship2 = await ctx.db
        .query("friends")
        .withIndex("by_user_id", (q) => q.eq("user_id", args.room_id))
        .filter((q) => q.eq(q.field("friend_id"), identity.subject))
        .first();

      if (friendship1) {
        await ctx.db.patch(friendship1._id, {
          last_msg: args.msg || "Attachment",
          updated_at: new Date().toISOString(),
        });
      }

      if (friendship2) {
        await ctx.db.patch(friendship2._id, {
          last_msg: args.msg || "Attachment",
          updated_at: new Date().toISOString(),
          unread_count: (friendship2.unread_count || 0) + 1,
        });
      }
    }
  },
});

export const deleteMessage = mutation({
  args: {
    msg_id: v.union(v.id("messages"), v.id("friendMessages")),
    type: v.union(v.literal("messages"), v.literal("friendMessages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const msg = await ctx.db.get(args.msg_id);
    if (!msg) throw new Error("Message not found");

    if (msg.sender_id !== identity.subject) {
      throw new Error("Unauthorized to delete message");
    }

    await ctx.db.delete(args.msg_id);
    if (msg.file_storage_id) {
      await ctx.storage.delete(msg.file_storage_id);
    }
  },
});

export const getMedia = query({
  args: {
    room_id: v.string(),
    type: v.union(v.literal("room"), v.literal("friend")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let messages = [];

    if (args.type === "room") {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
        .filter((q) => q.neq(q.field("file_storage_id"), undefined))
        .order("desc")
        .collect();
    } else {
      const myId = identity.subject;

      const msgs1 = await ctx.db
        .query("friendMessages")
        .withIndex("by_receiver_id", (q) => q.eq("receiver_id", args.room_id))
        .filter((q) => q.eq(q.field("sender_id"), myId))
        .filter((q) => q.neq(q.field("file_storage_id"), undefined))
        .collect();

      const msgs2 = await ctx.db
        .query("friendMessages")
        .withIndex("by_receiver_id", (q) => q.eq("receiver_id", myId))
        .filter((q) => q.eq(q.field("sender_id"), args.room_id))
        .filter((q) => q.neq(q.field("file_storage_id"), undefined))
        .collect();

      messages = [...msgs1, ...msgs2].sort(
        (a, b) => b._creationTime - a._creationTime,
      );
    }

    const result = await Promise.all(
      messages.map(async (msg) => {
        let finalUrl = msg.file_url;
        if (msg.file_storage_id) {
          finalUrl = await ctx.storage.getUrl(msg.file_storage_id);
        }
        return {
          ...msg,
          file_url: finalUrl,
        };
      }),
    );

    return result.filter((m) => m.file_url && m.type);
  },
});
