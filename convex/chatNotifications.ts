import { mutation, query } from "./_generated/server";
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

    return notifications.map((notification) => ({
      id: notification._id,
      messageId: notification.message_id,
      sourceType: notification.source_type,
      sourceId: notification.source_id,
      sourceName: notification.source_name,
      senderName: notification.sender_name,
      senderAvatar: notification.sender_avatar || "",
      message: notification.message,
      createdAt: notification._creationTime,
    }));
  },
});

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
