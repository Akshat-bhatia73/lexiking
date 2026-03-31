import type { QueryCtx } from "./_generated/server"

export async function getAuthenticatedUserId(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Not authenticated")
  }
  return identity.subject
}
