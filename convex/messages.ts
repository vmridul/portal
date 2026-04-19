import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';
import { 
  extractFriendId, 
  findFriendshipPair, 
  findMembership, 
  toPreview, 
  updateConversationMetadata 
} from './lib/conversations';
import { pruneOldNotifications } from './chatNotifications';

export const getMessagesPaginated = query({
  args: {
    conversation_id: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const messagesPage = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversation_id', args.conversation_id)
      )
      .order('desc')
      .paginate(args.paginationOpts);

    const result = await Promise.all(
      messagesPage.page.map(async (msg) => {
        let finalUrl = msg.file_url;
        if (msg.file_storage_id) {
          finalUrl = await ctx.storage.getUrl(msg.file_storage_id);
        }

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message_id", (q) => q.eq("message_id", msg._id))
          .collect();

        return {
          ...msg,
          file_url: finalUrl,
          sender: {
            user_id: msg.sender_id,
            username: msg.sender_username || "Unknown",
            avatar: msg.sender_avatar,
          },
          reactions: reactions.map((r) => ({
            _id: r._id,
            user_id: r.user_id,
            emoji: r.emoji,
          })),
        };
      })
    );

    return {
      ...messagesPage,
      page: result,
    };
  },
});

export const clearUnreadCount = mutation({
  args: { conversation_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const now = Date.now();

    // Try room membership first (O(1) compound index)
    const member = await findMembership(ctx.db, identity.subject, args.conversation_id);
    if (member) {
      await ctx.db.patch(member._id, { unread_count: 0, last_read_time: now });
      return;
    }

    // Try direct conversation
    const friendId = extractFriendId(args.conversation_id, identity.subject);
    if (friendId) {
      const { mine } = await findFriendshipPair(ctx.db, identity.subject, friendId);
      if (mine) {
        await ctx.db.patch(mine._id, { unread_count: 0, last_read_time: now });
      }
    }
  },
});

export const searchMessages = query({
  args: { conversation_id: v.string(), query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];

    const messages = await ctx.db
      .query('messages')
      .withSearchIndex('search_content', (q) =>
        q.search('content', args.query).eq('conversation_id', args.conversation_id)
      )
      .take(20);

    const result = messages.map((msg) => ({
      ...msg,
      sender: {
        user_id: msg.sender_id,
        username: msg.sender_username || 'Unknown',
        avatar: msg.sender_avatar,
      },
    }));

    return result;
  },
});

export const sendMessage = mutation({
  args: {
    conversation_id: v.string(),
    conversation_type: v.union(v.literal('room'), v.literal('direct')),
    msg: v.union(v.string(), v.null()),
    file_storage_id: v.optional(v.id('_storage')),
    file_type: v.union(v.string(), v.null()),
    file_name: v.union(v.string(), v.null()),
    file_size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const sender = await ctx.db
      .query('users')
      .withIndex('by_user_id', (q) => q.eq('user_id', identity.subject))
      .first();

    const notificationMessage =
      args.msg || (args.file_name ? `Attachment: ${args.file_name}` : 'Attachment');

    const insertedMessageId = await ctx.db.insert('messages', {
      conversation_id: args.conversation_id,
      conversation_type: args.conversation_type,
      sender_id: identity.subject,
      sender_username: sender?.username || "Unknown",
      sender_avatar: sender?.avatar,
      content: args.msg || null,
      file_storage_id: args.file_storage_id,
      file_url: null,
      type: args.file_type || null,
      file_name: args.file_name || null,
      file_size: args.file_size,
    });

    const now = Date.now();
    const preview = toPreview(args.msg, args.file_name);

    await updateConversationMetadata(
      ctx.db,
      args.conversation_id,
      args.conversation_type,
      identity.subject,
      preview,
      now,
      { incrementUnread: true }
    );

    if (args.conversation_type === 'room') {
      const room = await ctx.db
        .query('rooms')
        .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
        .first();

      const members = await ctx.db
        .query('roomMembers')
        .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
        .collect();

      for (const member of members) {
        if (member.user_id !== identity.subject) {
          await ctx.db.insert('chatNotifications', {
            user_id: member.user_id,
            message_id: insertedMessageId,
            source_type: 'room',
            source_id: args.conversation_id,
            conversation_id: args.conversation_id,
            source_name: room?.room_name || args.conversation_id,
            sender_id: identity.subject,
            sender_name: sender?.username || 'Unknown user',
            sender_avatar: sender?.avatar || '',
            message: notificationMessage,
            notification_type: 'message',
          });
        }
      }
    } else {
      const friendId = extractFriendId(args.conversation_id, identity.subject);
      if (friendId) {
        await ctx.db.insert('chatNotifications', {
          user_id: friendId,
          message_id: insertedMessageId,
          source_type: 'direct',
          source_id: identity.subject,
          conversation_id: args.conversation_id,
          source_name: sender?.username || 'Unknown user',
          sender_id: identity.subject,
          sender_name: sender?.username || 'Unknown user',
          sender_avatar: sender?.avatar || '',
          message: notificationMessage,
          notification_type: 'message',
        });
        await pruneOldNotifications(ctx, friendId);
      }
    }
  },
});

export const deleteMessage = mutation({
  args: { msg_id: v.id('messages') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const msg = await ctx.db.get(args.msg_id);
    if (!msg) throw new Error('Message not found');

    if (msg.sender_id !== identity.subject) {
      throw new Error('Unauthorized to delete message');
    }

    await ctx.db.delete(args.msg_id);
    if (msg.file_storage_id) {
      await ctx.storage.delete(msg.file_storage_id);
    }

    // Update last_msg_preview to the previous message after deletion
    const latestMsg = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversation_id', msg.conversation_id))
      .order('desc')
      .first();

    const preview = toPreview(latestMsg?.content ?? null, latestMsg?.file_name ?? null);
    const timestamp = latestMsg?._creationTime || 0;

    await updateConversationMetadata(
      ctx.db,
      msg.conversation_id,
      msg.conversation_type,
      msg.sender_id,
      preview,
      timestamp,
      { incrementUnread: false }
    );
  },
});

export const updateMessage = mutation({
  args: {
    msg_id: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const msg = await ctx.db.get(args.msg_id);
    if (!msg) throw new Error('Message not found');

    if (msg.sender_id !== identity.subject) {
      throw new Error('Unauthorized to edit message');
    }

    await ctx.db.patch(args.msg_id, {
      content: args.content,
      edited: true,
    });

    // Update conversation metadata if this is the latest message
    const latestMsg = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversation_id', msg.conversation_id))
      .order('desc')
      .first();

    if (latestMsg?._id === args.msg_id) {
      const preview = toPreview(args.content, msg.file_name);
      await updateConversationMetadata(
        ctx.db,
        msg.conversation_id,
        msg.conversation_type,
        msg.sender_id,
        preview,
        latestMsg._creationTime,
        { incrementUnread: false }
      );
    }
  },
});

export const getMedia = query({
  args: { conversation_id: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const limit = args.limit ?? 100;

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) => q.eq('conversation_id', args.conversation_id))
      .filter((q) => q.neq(q.field('file_storage_id'), undefined))
      .order('desc')
      .take(limit);

    const result = await Promise.all(
      messages.map(async (msg) => {
        let finalUrl = msg.file_url;
        if (msg.file_storage_id) {
          finalUrl = await ctx.storage.getUrl(msg.file_storage_id);
        }
        return {
          ...msg,
          file_url: finalUrl,
          sender: {
            user_id: msg.sender_id,
            username: msg.sender_username || 'Unknown',
            avatar: msg.sender_avatar,
          },
        };
      })
    );

    return result.filter((m) => m.file_url && m.type);
  },
});
