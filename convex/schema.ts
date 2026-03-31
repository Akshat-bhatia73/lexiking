import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  words: defineTable({
    // User isolation
    user_id: v.string(),

    // Core word data
    word: v.string(),
    definition: v.string(),
    part_of_speech: v.optional(v.string()),
    pronunciation: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    synonyms: v.optional(v.array(v.string())),
    antonyms: v.optional(v.array(v.string())),
    etymology: v.optional(v.string()),
    notes: v.optional(v.string()),

    // SM-2 Spaced Repetition fields
    ease_factor: v.number(), // Default: 2.5
    interval: v.number(), // Days until next review, default: 0
    repetitions: v.number(), // Consecutive successful recalls, default: 0
    next_review_at: v.number(), // Timestamp (ms since epoch)

    // Metadata
    source: v.optional(v.string()), // "manual", "paste", "ai_extract"
    is_archived: v.boolean(), // Soft delete, default: false
    created_at: v.number(), // Timestamp
    updated_at: v.number(), // Timestamp
  })
    .index("by_user", ["user_id"])
    .index("by_user_word", ["user_id", "word"])
    .index("by_user_next_review", ["user_id", "next_review_at"]),

  reviews: defineTable({
    // User isolation
    user_id: v.string(),

    // Word reference
    word_id: v.id("words"),

    // Review data
    rating: v.number(), // 0 (Again), 2 (Hard), 4 (Good), 5 (Easy)
    reviewed_at: v.number(), // Timestamp

    // Snapshot of SM-2 state before/after
    ease_factor_before: v.number(),
    ease_factor_after: v.number(),
    interval_before: v.number(),
    interval_after: v.number(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_word", ["user_id", "word_id"])
    .index("by_user_reviewed_at", ["user_id", "reviewed_at"]),
})
