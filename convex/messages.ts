import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getMessagesPaginated = query({
  args: {
    conversation_id: v.string(),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const cursor = args.cursor;

    let q = ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversation_id', args.conversation_id)
      )
      .order('desc');

    if (cursor) {
      q = q.filter((q) => q.lt(q.field('_creationTime'), cursor));
    }

    const rawMessages = await q.take(limit + 1);
    const hasMore = rawMessages.length > limit;
    const messages = hasMore ? rawMessages.slice(0, -1).reverse() : rawMessages.reverse();
    const nextCursor = hasMore ? rawMessages[limit - 1]._creationTime : null;

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

    return {
      messages: result,
      nextCursor,
      hasMore,
    };
  },
});

export const getUnreadCount = query({
  args: { conversation_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const member = await ctx.db
      .query('roomMembers')
      .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
      .filter((q) => q.eq(q.field('user_id'), identity.subject))
      .first();
    if (member) {
      return member?.unread_count || 0;
    }

    const friendIdParts = args.conversation_id.replace('direct_', '').split('_');
      const friendId = friendIdParts.find(id => id !== identity.subject) ?? '';

      if (friendId) {
        const friendship = await ctx.db
          .query('friends')
          .withIndex('by_user_id', (q) => q.eq('user_id', identity.subject))
          .filter((q) => q.eq(q.field('friend_id'), friendId))
          .first();
        return friendship?.unread_count || 0;
      }

      return 0;
  },
});

export const clearUnreadCount = mutation({
  args: { conversation_id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const member = await ctx.db
      .query('roomMembers')
      .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
      .filter((q) => q.eq(q.field('user_id'), identity.subject))
      .first();
    if (member) {
      await ctx.db.patch(member._id, { unread_count: 0 });
      return;
    }

    const friendIdParts = args.conversation_id.replace('direct_', '').split('_');
    const friendId = friendIdParts.find(id => id !== identity.subject) ?? '';

    if (friendId) {
      const friendship = await ctx.db
        .query('friends')
        .withIndex('by_user_id', (q) => q.eq('user_id', identity.subject))
        .filter((q) => q.eq(q.field('friend_id'), friendId))
        .first();
      if (friendship) {
        await ctx.db.patch(friendship._id, { unread_count: 0 });
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
    });

    if (args.conversation_type === 'room') {
      const [members, room] = await Promise.all([
        ctx.db
          .query('roomMembers')
          .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
          .collect(),
        ctx.db
          .query('rooms')
          .withIndex('by_room_id', (q) => q.eq('room_id', args.conversation_id))
          .first(),
      ]);

      for (const member of members) {
        if (member.user_id !== identity.subject) {
          await ctx.db.patch(member._id, {
            unread_count: (member.unread_count || 0) + 1,
          });
          await ctx.db.insert('chatNotifications', {
            user_id: member.user_id,
            message_id: insertedMessageId,
            source_type: 'room',
            source_id: args.conversation_id,
            source_name: room?.room_name || args.conversation_id,
            sender_id: identity.subject,
            sender_name: sender?.username || 'Unknown user',
            sender_avatar: sender?.avatar || '',
            message: notificationMessage,
          });
        }
      }
    } else {
      const friendIdParts = args.conversation_id.replace('direct_', '').split('_');
      const friendId = friendIdParts.find(id => id !== identity.subject) ?? '';

      if (!friendId) return;

      const friendship1 = await ctx.db
        .query('friends')
        .withIndex('by_user_id', (q) => q.eq('user_id', identity.subject))
        .filter((q) => q.eq(q.field('friend_id'), friendId))
        .first();

      const friendship2 = await ctx.db
        .query('friends')
        .withIndex('by_user_id', (q) => q.eq('user_id', friendId))
        .filter((q) => q.eq(q.field('friend_id'), identity.subject))
        .first();

      if (friendship1) {
        await ctx.db.patch(friendship1._id, {
          last_msg: args.msg || 'Attachment',
          updated_at: new Date().toISOString(),
        });
      }

      if (friendship2) {
        await ctx.db.patch(friendship2._id, {
          last_msg: args.msg || 'Attachment',
          updated_at: new Date().toISOString(),
          unread_count: (friendship2.unread_count || 0) + 1,
        });
      }

      await ctx.db.insert('chatNotifications', {
        user_id: friendId!,
        message_id: insertedMessageId,
        source_type: 'direct',
        source_id: identity.subject,
        source_name: sender?.username || 'Unknown user',
        sender_id: identity.subject,
        sender_name: sender?.username || 'Unknown user',
        sender_avatar: sender?.avatar || '',
        message: notificationMessage,
      });
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