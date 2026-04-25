import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { 
  findMembership, 
  extractFriendId, 
  findFriendshipPair,
  buildDirectConversationId 
} from "./lib/conversations";

/**
 * markConversationRead — the ONLY mutation that updates read state.
 * Idempotent: calling it multiple times with the same timestamp is a no-op.
 */
export const markConversationRead = mutation({
  args: { 
    conversation_id: v.string(),
    read_until: v.number(), // _creationTime of the latest visible message
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Update the watermark (lastReadTime) — never decrement
    const member = await findMembership(ctx.db, identity.subject, args.conversation_id);
    if (member) {
      const currentReadTime = member.last_read_time ?? 0;
      if (args.read_until > currentReadTime) {
        await ctx.db.patch(member._id, { last_read_time: args.read_until });
      }
      return;
    }

    // Direct conversation fallback
    const friendId = extractFriendId(args.conversation_id, identity.subject);
    if (friendId) {
      const { mine } = await findFriendshipPair(ctx.db, identity.subject, friendId);
      if (mine) {
        const currentReadTime = mine.last_read_time ?? 0;
        if (args.read_until > currentReadTime) {
          await ctx.db.patch(mine._id, { last_read_time: args.read_until });
        }
      }
    }
  },
});

/**
 * getUnreadCounts — server-derived unread counts for the current user.
 * Counts messages with _creationTime > lastReadTime per conversation.
 */
export const getUnreadCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { rooms: {}, directs: {} };

    // Room unread counts
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .collect();

    const roomCounts: Record<string, number> = {};
    for (const m of memberships) {
      const lastRead = m.last_read_time ?? 0;
      // Count messages newer than lastReadTime
      const unread = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversation_id", m.room_id))
        .filter((q) => q.gt(q.field("_creationTime"), lastRead))
        .collect();
      // Exclude own messages
      roomCounts[m.room_id] = unread.filter(
        (msg) => msg.sender_id !== identity.subject
      ).length;
    }

    // Direct unread counts
    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const directCounts: Record<string, number> = {};
    for (const f of friendships) {
      const lastRead = f.last_read_time ?? 0;
      const conversationId = buildDirectConversationId(identity.subject, f.friend_id);
      const unread = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversation_id", conversationId))
        .filter((q) => q.gt(q.field("_creationTime"), lastRead))
        .collect();
      directCounts[f.friend_id] = unread.filter(
        (msg) => msg.sender_id !== identity.subject
      ).length;
    }

    return { rooms: roomCounts, directs: directCounts };
  },
});