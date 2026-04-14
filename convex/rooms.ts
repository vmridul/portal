import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const joinRoom = mutation({
  args: { room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const sender = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .first();

    if (!room) throw new Error("Room does not exist");

    const existingMember = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    if (existingMember) {
      throw new Error("You are already in this room");
    }

    await ctx.db.insert("roomMembers", {
      room_id: args.room_id,
      user_id: identity.subject,
      username: sender?.username,
      avatar: sender?.avatar,
      role: "member",
    });

    await ctx.db.insert("messages", {
      conversation_id: args.room_id,
      conversation_type: "room",
      sender_id: identity.subject,
      sender_username: sender?.username || "Unknown",
      sender_avatar: sender?.avatar,
      content: "joined the room",
      type: "system",
      file_url: null,
      file_name: null,
    });
  },
});

export const createRoom = mutation({
  args: { room_name: v.string(), room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const sender = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    const roomId = await ctx.db.insert("rooms", {
      room_name: args.room_name,
      room_id: args.room_id,
      is_group: true,
    });

    await ctx.db.insert("roomMembers", {
      room_id: args.room_id,
      user_id: identity.subject,
      username: sender?.username,
      avatar: sender?.avatar,
      role: "owner",
    });

    return roomId;
  },
});

export const renameRoom = mutation({
  args: { room_id: v.string(), new_name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .first();

    if (!room) throw new Error("Room not found");

    const existingMember = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    if (!existingMember || existingMember.role !== "owner") {
      throw new Error("unauthorized");
    }

    await ctx.db.patch(room._id, { room_name: args.new_name });
  },
});

export const leaveRoom = mutation({
  args: { room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const sender = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .first();

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    if (!membership) throw new Error("Not a member");

    if (membership.role === "owner") {
      throw new Error(
        "Owner cannot leave room, must delete or transfer ownership",
      );
    }

    await ctx.db.delete(membership._id);

    await ctx.db.insert("messages", {
      conversation_id: args.room_id,
      conversation_type: "room",
      sender_id: identity.subject,
      sender_username: sender?.username || "Unknown",
      sender_avatar: sender?.avatar,
      content: "left the room",
      type: "system",
      file_url: null,
      file_name: null,
    });
  },
});

export const deleteRoom = mutation({
  args: { room_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .filter((q) => q.eq(q.field("user_id"), identity.subject))
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("unauthorized");
    }

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .first();

    if (room) {
      await ctx.db.delete(room._id);
    }

    const allMembers = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_id", (q) => q.eq("room_id", args.room_id))
      .collect();

    for (const m of allMembers) {
      await ctx.db.delete(m._id);
    }
  },
});
