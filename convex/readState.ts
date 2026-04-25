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
        await ctx.db.patch(member._id, { 
          last_read_time: args.read_until,
          unread_count: 0 
        });
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
          await ctx.db.patch(mine._id, { 
            last_read_time: args.read_until,
            unread_count: 0
          });
        }
      }
    }
  },
});
