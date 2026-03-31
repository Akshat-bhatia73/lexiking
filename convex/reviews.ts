import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthenticatedUserId } from "./auth"
import { calculateNextReview } from "./lib/sm2"

/**
 * Get review history for a specific word.
 */
export const byWord = query({
  args: { wordId: v.id("words") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_word", (q) =>
        q.eq("user_id", userId).eq("word_id", args.wordId)
      )
      .order("desc")
      .take(50)

    return reviews
  },
})

/**
 * Get all reviews for the authenticated user (for analytics).
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .order("desc")
      .take(args.limit ?? 100)

    return reviews
  },
})

/**
 * Record a review and update the word's SM-2 state.
 */
export const record = mutation({
  args: {
    wordId: v.id("words"),
    rating: v.number(), // 0, 2, 4, or 5
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const now = Date.now()

    // Get the word
    const word = await ctx.db.get(args.wordId)
    if (!word || word.user_id !== userId) {
      throw new Error("Word not found")
    }

    // Validate rating
    if (![0, 2, 4, 5].includes(args.rating)) {
      throw new Error("Invalid rating. Must be 0, 2, 4, or 5.")
    }

    // Calculate new SM-2 state
    const newState = calculateNextReview(
      {
        easeFactor: word.ease_factor,
        interval: word.interval,
        repetitions: word.repetitions,
      },
      args.rating,
      now
    )

    // Create review record
    const reviewId = await ctx.db.insert("reviews", {
      user_id: userId,
      word_id: args.wordId,
      rating: args.rating,
      reviewed_at: now,
      ease_factor_before: word.ease_factor,
      ease_factor_after: newState.easeFactor,
      interval_before: word.interval,
      interval_after: newState.interval,
    })

    // Update word with new SM-2 state
    await ctx.db.patch(args.wordId, {
      ease_factor: newState.easeFactor,
      interval: newState.interval,
      repetitions: newState.repetitions,
      next_review_at: newState.nextReviewAt,
      updated_at: now,
    })

    return reviewId
  },
})

/**
 * Get review statistics for the authenticated user.
 */
export const stats = query({
  args: {
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx)
    const days = args.days ?? 30
    const since = Date.now() - days * 24 * 60 * 60 * 1000

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user_reviewed_at", (q) =>
        q.eq("user_id", userId).gte("reviewed_at", since)
      )
      .collect()

    const total = reviews.length
    const successful = reviews.filter((r) => r.rating >= 3).length
    const again = reviews.filter((r) => r.rating === 0).length
    const hard = reviews.filter((r) => r.rating === 2).length
    const good = reviews.filter((r) => r.rating === 4).length
    const easy = reviews.filter((r) => r.rating === 5).length

    return {
      total,
      successful,
      failed: total - successful,
      retentionRate: total > 0 ? successful / total : 0,
      breakdown: {
        again,
        hard,
        good,
        easy,
      },
    }
  },
})
