import { DatabaseReader, DatabaseWriter } from '../_generated/server';

/** Max length for message preview text */
const PREVIEW_MAX_LENGTH = 100;

/** Build a deterministic direct conversation ID (sorted) */
export function buildDirectConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

/** Extract the other user's ID from a direct conversation ID */
export function extractFriendId(conversationId: string, currentUserId: string): string | null {
  if (!conversationId.startsWith('direct_')) return null;
  const parts = conversationId.slice('direct_'.length).split('_');
  return parts.find(id => id !== currentUserId) || null;
}

/** Truncate content to a preview string */
export function toPreview(content: string | null, fileName: string | null): string {
  return (content || fileName || 'Attachment').slice(0, PREVIEW_MAX_LENGTH);
}

/** Look up both directions of a friendship pair */
export async function findFriendshipPair(
  db: DatabaseReader,
  userId: string,
  friendId: string,
) {
  const [mine, theirs] = await Promise.all([
    db.query('friends')
      .withIndex('by_user_id', q => q.eq('user_id', userId))
      .filter(q => q.eq(q.field('friend_id'), friendId))
      .first(),
    db.query('friends')
      .withIndex('by_user_id', q => q.eq('user_id', friendId))
      .filter(q => q.eq(q.field('friend_id'), userId))
      .first(),
  ]);
  return { mine, theirs };
}

/** Look up a room membership using the compound index (O(1)) */
export async function findMembership(
  db: DatabaseReader,
  userId: string,
  roomId: string,
) {
  return db.query('roomMembers')
    .withIndex('by_user_room', q => q.eq('user_id', userId).eq('room_id', roomId))
    .first();
}

/** Update conversation metadata after a message changes (send or delete) */
export async function updateConversationMetadata(
  db: DatabaseWriter,
  conversationId: string,
  conversationType: 'room' | 'direct',
  senderId: string,
  preview: string,
  timestamp: number,
  opts: { incrementUnread: boolean },
) {
  if (conversationType === 'room') {
    const members = await db.query('roomMembers')
      .withIndex('by_room_id', q => q.eq('room_id', conversationId))
      .collect();

    for (const member of members) {
      const isRecipient = member.user_id !== senderId && opts.incrementUnread;
      await db.patch(member._id, {
        last_msg_preview: preview,
        last_msg_time: timestamp,
        ...(isRecipient ? { unread_count: (member.unread_count || 0) + 1 } : {}),
      });
    }
  } else {
    const friendId = extractFriendId(conversationId, senderId);
    if (!friendId) return;

    const { mine, theirs } = await findFriendshipPair(db, senderId, friendId);
    
    if (mine) {
      await db.patch(mine._id, { last_msg: preview, updated_at: timestamp });
    }
    if (theirs) {
      await db.patch(theirs._id, {
        last_msg: preview,
        updated_at: timestamp,
        ...(opts.incrementUnread ? { unread_count: (theirs.unread_count || 0) + 1 } : {}),
      });
    }
  }
}
