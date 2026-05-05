import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    user_id: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_username", ["username"]),

  friends: defineTable({
    user_id: v.string(),
    friend_id: v.string(),
    friend_username: v.optional(v.string()),
    friend_avatar: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    last_msg: v.optional(v.string()),
    last_msg_sender: v.optional(v.string()),
    updated_at: v.optional(v.number()),
    notificationPreference: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_friend_id", ["friend_id"])
    .index("by_user_id_status", ["user_id", "status"]),

  rooms: defineTable({
    room_id: v.string(),
    room_name: v.string(),
    is_group: v.boolean(),
  }).index("by_room_id", ["room_id"]),

  roomMembers: defineTable({
    room_id: v.string(),
    user_id: v.string(),
    username: v.optional(v.string()),
    avatar: v.optional(v.string()),
    role: v.optional(v.string()),
    notificationPreference: v.optional(v.string()),
  })
    .index("by_room_id", ["room_id"])
    .index("by_user_id", ["user_id"])
    .index("by_user_room", ["user_id", "room_id"]),

  messages: defineTable({
    conversation_id: v.string(),
    conversation_type: v.union(v.literal("room"), v.literal("direct")),
    sender_id: v.string(),
    sender_username: v.optional(v.string()),
    sender_avatar: v.optional(v.string()),
    content: v.union(v.string(), v.null()),
    file_storage_id: v.optional(v.id("_storage")),
    file_url: v.union(v.string(), v.null()),
    type: v.union(v.string(), v.null()),
    file_name: v.union(v.string(), v.null()),
    file_size: v.optional(v.number()),
    edited: v.optional(v.boolean()),
    mentions: v.optional(v.array(v.string())),
  })
    .index("by_conversation", ["conversation_id"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["conversation_id"],
    }),

  chatNotifications: defineTable({
    user_id: v.string(),
    message_id: v.string(),
    source_type: v.union(v.literal("room"), v.literal("direct")),
    source_id: v.string(),
    conversation_id: v.optional(v.string()),
    source_name: v.string(),
    sender_id: v.string(),
    sender_name: v.string(),
    sender_avatar: v.optional(v.string()),
    message: v.string(),
    notification_type: v.optional(
      v.union(v.literal("message"), v.literal("call")),
    ),
    call_id: v.optional(v.id("calls")),
    call_status: v.optional(v.union(v.literal("active"), v.literal("ended"))),
    read_at: v.optional(v.number()),
    hasMentions: v.optional(v.boolean()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_message_id", ["message_id"])
    .index("by_call_id", ["call_id"])
    .index("by_user_conversation", ["user_id", "conversation_id"]),

  unreadCounters: defineTable({
    user_id: v.string(),
    conversation_id: v.string(),
    source_type: v.union(v.literal("room"), v.literal("direct")),
    source_id: v.string(),
    unread_count: v.number(),
    updated_at: v.number(),
    has_unread_mentions: v.optional(v.boolean()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_conversation", ["user_id", "conversation_id"]),

  presence: defineTable({
    user_id: v.string(),
    status: v.union(v.literal("online"), v.literal("away")),
    updated_at: v.number(),
  }).index("by_user_id", ["user_id"]),

  typingIndicators: defineTable({
    room_id: v.string(),
    user_id: v.string(),
    updated_at: v.number(),
  })
    .index("by_room_id", ["room_id"])
    .index("by_user_id", ["user_id"])
    .index("by_user_room", ["user_id", "room_id"]),

  reactions: defineTable({
    message_id: v.id("messages"),
    user_id: v.string(),
    emoji: v.string(),
  }).index("by_message_id", ["message_id"]),

  calls: defineTable({
    roomId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    participants: v.array(v.string()),
    allParticipants: v.array(v.string()),
    activePeerIds: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          peerId: v.string(),
        }),
      ),
    ),
    mediaStates: v.optional(
      v.array(
        v.object({
          userId: v.string(),
          isMuted: v.boolean(),
          isVideoOn: v.boolean(),
          isScreenSharing: v.optional(v.boolean()),
        }),
      ),
    ),
    initiatorId: v.string(),
    isActive: v.boolean(),
  })
    .index("by_room_id", ["roomId"])
    .index("by_active", ["roomId", "isActive"])
    .index("by_status", ["isActive"]),
});
