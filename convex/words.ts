import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthenticatedUserId } from "./auth"
import { getDefaultSM2State } from "./lib/sm2"

/**
 * List all words for the authenticated user.
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)

    const results = await ctx.db
      .query("words")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect()

    // Filter by archived status (default: show non-archived)
    let filtered = results.filter((w) =>
      args.archived !== undefined
        ? w.is_archived === args.archived
        : !w.is_archived
    )

    // Filter by search term
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.word.toLowerCase().includes(searchLower) ||
          w.definition.toLowerCase().includes(searchLower)
      )
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.created_at - a.created_at)
  },
})

/**
 * Get a single word by ID.
 */
export const get = query({
  args: { id: v.id("words") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const word = await ctx.db.get(args.id)

    if (!word || word.user_id !== userId) {
      return null
    }

    return word
  },
})

/**
 * Get words due for review today.
 */
export const dueToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx)
    const now = Date.now()

    const words = await ctx.db
      .query("words")
      .withIndex("by_user_next_review", (q) =>
        q.eq("user_id", userId).lte("next_review_at", now)
      )
      .filter((q) => q.eq(q.field("is_archived"), false))
      .collect()

    return words.sort((a, b) => a.next_review_at - b.next_review_at)
  },
})

/**
 * Save a new word or update an existing one.
 */
export const save = mutation({
  args: {
    word: v.string(),
    definition: v.string(),
    part_of_speech: v.optional(v.string()),
    pronunciation: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    synonyms: v.optional(v.array(v.string())),
    antonyms: v.optional(v.array(v.string())),
    etymology: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const now = Date.now()
    const normalizedWord = args.word.trim().toLowerCase()

    const existing = await ctx.db
      .query("words")
      .withIndex("by_user_word", (q) =>
        q.eq("user_id", userId).eq("word", normalizedWord)
      )
      .first()

    if (existing) {
      const updates: Record<string, unknown> = {
        definition: args.definition,
        updated_at: now,
        is_archived: false,
      }
      if (args.part_of_speech !== undefined)
        updates.part_of_speech = args.part_of_speech
      if (args.pronunciation !== undefined)
        updates.pronunciation = args.pronunciation
      if (args.examples !== undefined) updates.examples = args.examples
      if (args.synonyms !== undefined) updates.synonyms = args.synonyms
      if (args.antonyms !== undefined) updates.antonyms = args.antonyms
      if (args.etymology !== undefined) updates.etymology = args.etymology
      if (args.notes !== undefined) updates.notes = args.notes
      if (args.source !== undefined) updates.source = args.source

      await ctx.db.patch(existing._id, updates)
      return existing._id
    }

    const sm2State = getDefaultSM2State()

    const wordId = await ctx.db.insert("words", {
      user_id: userId,
      word: normalizedWord,
      definition: args.definition,
      part_of_speech: args.part_of_speech,
      pronunciation: args.pronunciation,
      examples: args.examples,
      synonyms: args.synonyms,
      antonyms: args.antonyms,
      etymology: args.etymology,
      notes: args.notes,
      ease_factor: sm2State.easeFactor,
      interval: sm2State.interval,
      repetitions: sm2State.repetitions,
      next_review_at: sm2State.nextReviewAt,
      source: args.source ?? "manual",
      is_archived: false,
      created_at: now,
      updated_at: now,
    })

    return wordId
  },
})

/**
 * Update an existing word.
 */
export const update = mutation({
  args: {
    id: v.id("words"),
    definition: v.optional(v.string()),
    part_of_speech: v.optional(v.string()),
    pronunciation: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    synonyms: v.optional(v.array(v.string())),
    antonyms: v.optional(v.array(v.string())),
    etymology: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const word = await ctx.db.get(args.id)

    if (!word || word.user_id !== userId) {
      throw new Error("Word not found")
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    })
  },
})

/**
 * Archive or unarchive a word (soft delete).
 */
export const archive = mutation({
  args: {
    id: v.id("words"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const word = await ctx.db.get(args.id)

    if (!word || word.user_id !== userId) {
      throw new Error("Word not found")
    }

    await ctx.db.patch(args.id, {
      is_archived: args.archived,
      updated_at: Date.now(),
    })
  },
})

/**
 * Permanently delete a word.
 */
export const remove = mutation({
  args: { id: v.id("words") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const word = await ctx.db.get(args.id)

    if (!word || word.user_id !== userId) {
      throw new Error("Word not found")
    }

    await ctx.db.delete(args.id)
  },
})
