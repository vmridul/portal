import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    user_id: v.string(),
    username: v.string(),
    avatar: v.optional(v.string()),
  }).index("by_user_id", ["user_id"]),

  friends: defineTable({
    user_id: v.string(),
    friend_id: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    last_msg: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_friend_id", ["friend_id"]),

  rooms: defineTable({
    room_id: v.string(),
    room_name: v.string(),
    is_group: v.boolean(),
  }).index("by_room_id", ["room_id"]),

  roomMembers: defineTable({
    room_id: v.string(),
    user_id: v.string(),
    role: v.optional(v.string()),
  })
    .index("by_room_id", ["room_id"])
    .index("by_user_id", ["user_id"]),

  messages: defineTable({
    room_id: v.string(),
    sender_id: v.string(),
    content: v.union(v.string(), v.null()),
    file_storage_id: v.optional(v.id("_storage")),
    file_url: v.union(v.string(), v.null()),
    type: v.union(v.string(), v.null()),
    file_name: v.union(v.string(), v.null()),
  }).index("by_room_id", ["room_id"]),

  friendMessages: defineTable({
    receiver_id: v.string(),
    sender_id: v.string(),
    content: v.union(v.string(), v.null()),
    file_storage_id: v.optional(v.id("_storage")),
    file_url: v.union(v.string(), v.null()),
    type: v.union(v.string(), v.null()),
    file_name: v.union(v.string(), v.null()),
  })
    .index("by_receiver_id", ["receiver_id"])
    .index("by_sender_id", ["sender_id"]),

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
    .index("by_user_id", ["user_id"]),
});
