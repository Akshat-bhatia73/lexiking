# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

LexiKing is an AI-powered vocabulary tracker with spaced repetition. The entire backend lives in Convex — a reactive database where frontend queries auto-update when data changes. TanStack Start handles routing and type-safe data fetching.

**Tech Stack:** TanStack Start · TypeScript · Convex · Gemini Flash · Clerk (Auth)

## Authentication & User Model

**Auth Provider:** Clerk with anonymous session support for guests

### User Identifiers

| Mode      | user_id Source              | Behavior                         |
| --------- | --------------------------- | -------------------------------- |
| Guest     | Clerk anonymous session ID  | Data stored locally, upgradeable |
| Logged-in | Clerk authenticated user ID | Data synced across devices       |

### Data Isolation

- All tables include `user_id` field
- All queries filter by `user_id` (server-side security)
- Guest-to-user migration handled automatically by Clerk

### Word Uniqueness

- Each `word` is unique per `user_id`
- Index: `by_user_word` enables duplicate check on save

### Auth Helper Function

```typescript
// In convex/auth.ts
import type { QueryCtx } from "./_generated/server"

export async function getAuthenticatedUserId(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Not authenticated")
  }
  return identity.subject // Clerk user ID
}
```

### Environment Variables

```bash
# Clerk (get from https://dashboard.clerk.com/last-active?path=api-keys)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://xxx.clerk.accounts.dev
```

## Build/Lint/Test Commands

```bash
# Development
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Tests
bun run test                    # Run all tests
bun run test path/to/test.test.ts   # Run single test file
bun run test --watch            # Run tests in watch mode

# Type checking and linting
bun run typecheck
bun run lint

# Format code
bun run format

# Convex
bunx convex dev                 # Start local Convex backend
bunx convex deploy               # Deploy to production
bunx convex env set GEMINI_API_KEY sk-... --prod   # Set env var
```

## Convex Architecture

Convex has no REST endpoints. Write functions in `convex/` folder:

- **Queries** — Read data. Reactive: components auto-re-render when data changes.
- **Mutations** — Write data. Transactional and type-safe.
- **Actions** — Call external APIs (Gemini). Cannot write to DB directly — must call a mutation.

**Golden Rule:** Actions call Gemini → get result → call Mutation to save.

## Convex Files Structure

```
convex/
├── schema.ts           # Database schema (tables, indexes)
├── auth.config.ts      # Clerk authentication configuration
├── auth.ts             # Auth helper functions
├── words.ts            # Queries/mutations for words
├── reviews.ts          # Queries/mutations for review history
├── ai.ts               # Actions for Gemini integration
├── analytics.ts        # Queries for stats/charts
├── lib/
│   └── sm2.ts           # SM-2 algorithm implementation
└── _generated/          # Auto-generated types (never edit)
```

## Data Model

### Words Table

Core entity for vocabulary items. Includes SM-2 spaced repetition fields.

**Fields:**

- `word`, `definition`, `part_of_speech`, `pronunciation`
- `examples[]`, `synonyms[]`, `antonyms[]`, `etymology`, `notes`
- `ease_factor`, `interval`, `repetitions`, `next_review_at` (SM-2)
- `user_id`, `source`, `is_archived`, `created_at`, `updated_at`

**Indexes:**

- `by_user` - List all words for a user
- `by_user_word` - Enforce uniqueness (user + word)
- `by_user_next_review` - Query words due for review

### Reviews Table

Immutable event log of every review session.

**Purpose:**

- Calculate retention rates over time
- Identify weakest words (low success rate)
- Generate learning progress charts
- Debug interval calculations
- Enable future ML-based algorithms (FSRS)

**Fields:**

- `user_id`, `word_id`, `rating`, `reviewed_at`
- `ease_factor_before/after`, `interval_before/after`

**Indexes:**

- `by_user` - All reviews for a user
- `by_user_word` - Review history for specific word
- `by_user_reviewed_at` - Time-based analytics

## Code Style Guidelines

### Imports

Group imports in order:

1. External packages (React, TanStack, Convex)
2. Internal aliases (`@/components/...`, `@/lib/...`)
3. Relative imports (`./`, `../`)

```tsx
import { Button } from "@/components/ui/button"
import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { Id } from "convex/_generated/dataModel"
```

### Formatting

- Prettier config: no semicolons, double quotes, trailing commas (ES5)
- Print width: 80, Tab width: 2 spaces, Line ending: LF
- Use `cn()` utility for conditional class merging

### TypeScript

- Strict mode enabled, `noUnusedLocals`, `noUnusedParameters`
- Use `verbatimModuleSyntax: true` for type-only exports
- Never use `any` — use `unknown` or specific types
- Import types from `convex/_generated/dataModel` for Convex IDs

### React Components

- Function components only, PascalCase file names
- Export at end of file or inline with declaration
- Use `createFileRoute("/")({ component: MyComponent })` for routes

### Convex Patterns

```tsx
// Frontend query
const { data } = useSuspenseQuery(convexQuery(api.words.list, {}))

// Frontend mutation
const saveWord = useMutation(api.words.save)
await saveWord({ word, definition })

// IDs are typed: Id<"words">
```

## Routes

| Path         | Description                               |
| ------------ | ----------------------------------------- |
| `/`          | Dashboard: streak, words due today, stats |
| `/library`   | Full word list with search/filter         |
| `/add`       | Word capture: manual + paste-to-extract   |
| `/quiz`      | Quiz session: one word, rating buttons    |
| `/analytics` | Charts, retention rate, weakest words     |
| `/word/$id`  | Word detail + review history              |

## SM-2 Spaced Repetition

Rating map: `again=0`, `hard=2`, `good=4`, `easy=5`

1. If quality < 3: reset repetitions=0, interval=1
2. If quality >= 3: increment repetitions, calculate interval
3. Update ease_factor (clamp to minimum 1.3)
4. Set next_review_at = now + interval × 86400000ms

## Build Phases

All phases complete. Application is fully functional.

1. **Foundation:** ✅ Init TanStack Start, Convex schema, words.save/list, library page
2. **AI Enrichment:** ✅ ai.enrichWord action, auto-fill on word entry
3. **Paste-to-Extract:** ✅ ai.extractFromText action, bulk save extracted words
4. **Quiz Engine:** ✅ SM-2, dueToday query, quiz UI with rating buttons
5. **Analytics:** ✅ Summary queries, retention rate, rating breakdown, word status
6. **Polish:** ✅ Word detail page with review history, mobile-responsive, empty states

## Status

**Working perfectly.** All features implemented:

- Dashboard with streak, words due, stats
- Library with search/filter (list/grid views)
- Add word page with AI enrichment and paste-to-extract tabs
- Quiz with SM-2 rating buttons
- Analytics with retention rate, rating breakdown, word status
- Word detail with review history and learning progress
- Navigation header with all routes

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "React components and TanStack Start routing"
  load: "node_modules/@tanstack/react-start/skills/react-start/SKILL.md"
- task: "Data loading with loaders and React Query"
  load: "node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md"
- task: "Server functions and API routes"
  load: "node_modules/@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md"
- task: "SSR, head management, and SEO"
load: "node_modules/@tanstack/router-core/skills/router-core/ssr/SKILL.md"
<!-- intent-skills:end -->
