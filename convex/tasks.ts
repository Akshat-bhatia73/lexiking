import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect()
  },
})

export const put = mutation({
  args: {
    id: v.id("tasks"),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("tasks", args.id, { isCompleted: args.isCompleted })
  },
})
