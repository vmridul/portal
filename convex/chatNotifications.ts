import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const getMessageNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const notifications = await ctx.db
      .query("chatNotifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .order("desc")
      .take(100);

    // Fetch all relevant read watermarks to determine isRead status
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .collect();
    
    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .collect();

    const readStateMap: Record<string, number> = {};
    for (const m of memberships) readStateMap[m.room_id] = m.last_read_time ?? 0;
    for (const f of friendships) readStateMap[f.friend_id] = f.last_read_time ?? 0;

    return await Promise.all(
      notifications.map(async (notification) => {
        const call = notification.call_id
          ? await ctx.db.get(notification.call_id)
          : null;

        const lastRead = readStateMap[notification.source_id] ?? 0;
        const isRead = notification._creationTime <= lastRead;

        return {
          id: notification._id,
          messageId: notification.message_id,
          sourceType: notification.source_type,
          sourceId: notification.source_id,
          conversationId: notification.conversation_id ?? notification.source_id,
          sourceName: notification.source_name,
          senderId: notification.sender_id,
          senderName: notification.sender_name,
          senderAvatar: notification.sender_avatar || "",
          message: notification.message,
          notificationType: notification.notification_type ?? "message",
          callId: notification.call_id ?? null,
          callStatus: notification.call_status ?? null,
          participantIds:
            notification.notification_type === "call"
              ? call?.allParticipants || call?.participants || []
              : [],
          createdAt: notification._creationTime,
          isRead,
        };
      }),
    );
  },
});

export async function pruneOldNotifications(ctx: MutationCtx, userId: string) {
  const notifications = await ctx.db
    .query("chatNotifications")
    .withIndex("by_user_id", (q) => q.eq("user_id", userId))
    .order("desc")
    .collect();

  if (notifications.length > 100) {
    const toDelete = notifications.slice(100);
    for (const notification of toDelete) {
      await ctx.db.delete(notification._id);
    }
  }
}


export const removeNotification = mutation({
  args: { notification_id: v.id("chatNotifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const notification = await ctx.db.get(args.notification_id);
    if (!notification) return;
    if (notification.user_id !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.delete(args.notification_id);
  },
});

export const clearAllNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const notifications = await ctx.db
      .query("chatNotifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .collect();

    await Promise.all(notifications.map((notification) => ctx.db.delete(notification._id)));
  },
});

export const cleanup = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const oldNotifications = await ctx.db
      .query("chatNotifications")
      .filter((q) => q.lt(q.field("_creationTime"), cutoff))
      .collect();

    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }
  },
});
