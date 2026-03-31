# LexiKing

An AI-powered vocabulary tracker with spaced repetition. Build your vocabulary intelligently with automatic enrichment, spaced review, and progress analytics.

## Tech Stack

- **Frontend:** TanStack Start · React 19 · TypeScript · Tailwind CSS 4
- **Backend:** Convex (reactive database)
- **AI:** Google Gemini Flash
- **Auth:** Clerk (with anonymous session support)

## Features

- **Smart Word Capture** - Add words manually or paste text to auto-extract vocabulary
- **AI Enrichment** - Automatic definitions, pronunciations, examples, synonyms, antonyms, and etymology
- **Spaced Repetition** - SM-2 algorithm schedules optimal review times
- **Quiz Mode** - Review words with rating buttons (again/hard/good/easy)
- **Analytics** - Track retention rate, learning streaks, and identify weakest words
- **Guest Mode** - Start learning instantly without an account, upgrade anytime

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 20 (for tooling compatibility)
- [Convex Account](https://www.convex.dev/) - Free tier available
- [Clerk Account](https://clerk.com/) - Free tier available
- [Google AI Studio API Key](https://aistudio.google.com/) - For Gemini Flash

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd lexiking
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for details.

### 4. Set up Convex

```bash
# Start local Convex backend (or it will use cloud)
bunx convex dev

# Set Gemini API key for AI enrichment (production)
bunx convex env set GEMINI_API_KEY your-gemini-api-key --prod

# Set Gemini API key for AI enrichment (development)
bunx convex env set GEMINI_API_KEY your-gemini-api-key
```

### 5. Run the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory:

| Variable                     | Description                          | Required       |
| ---------------------------- | ------------------------------------ | -------------- |
| `CONVEX_DEPLOYMENT`          | Convex deployment name               | Auto-generated |
| `VITE_CONVEX_URL`            | Convex cloud URL                     | Auto-generated |
| `VITE_CONVEX_SITE_URL`       | Convex site URL for server functions | Auto-generated |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend API key               | Yes            |
| `CLERK_SECRET_KEY`           | Clerk backend secret key             | Yes            |
| `CLERK_JWT_ISSUER_DOMAIN`    | Clerk JWT issuer domain              | Yes            |

### Getting Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing
3. Navigate to **API Keys**
4. Copy the values:
   - `VITE_CLERK_PUBLISHABLE_KEY` = "Publishable Key"
   - `CLERK_SECRET_KEY` = "Secret Key"
   - `CLERK_JWT_ISSUER_DOMAIN` = "JWT Issuer" (e.g., `https://xxx.clerk.accounts.dev`)

### Getting Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Set it in Convex: `bunx convex env set GEMINI_API_KEY your-key`

## Available Scripts

```bash
# Development
bun run dev              # Start dev server on port 3000

# Build
bun run build            # Build for production
bun run preview          # Preview production build

# Testing
bun run test             # Run all tests
bun run test path/to/test.test.ts  # Run single test file
bun run test --watch     # Run tests in watch mode

# Code Quality
bun run typecheck        # Type check with TypeScript
bun run lint             # Lint with ESLint
bun run format           # Format with Prettier

# Convex
bunx convex dev          # Start Convex development
bunx convex deploy       # Deploy to production
bunx convex env set VAR value --prod  # Set env var in production
```

## Project Structure

```
lexiking/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   ├── auth.config.ts      # Clerk configuration
│   ├── words.ts            # Words CRUD + enrichment
│   ├── reviews.ts          # Review history
│   ├── ai.ts               # Gemini AI actions
│   ├── analytics.ts        # Stats queries
│   └── lib/sm2.ts          # SM-2 algorithm
├── app/                    # Frontend routes
│   ├── routes/             # TanStack Router pages
│   ├── components/         # React components
│   │   └── ui/             # shadcn/ui components
│   └── lib/                 # Utilities
├── public/                 # Static assets
└── tests/                  # Test files
```

## Routes

| Path         | Description                                  |
| ------------ | -------------------------------------------- |
| `/`          | Dashboard with streak and words due today    |
| `/library`   | Full word list with search/filter            |
| `/add`       | Add words (manual input or paste-to-extract) |
| `/quiz`      | Quiz session with spaced repetition          |
| `/analytics` | Progress charts and statistics               |
| `/word/$id`  | Word detail and review history               |

## Data Model

### Words Table

Core vocabulary entity with SM-2 spaced repetition fields:

- `word`, `definition`, `part_of_speech`, `pronunciation`
- `examples[]`, `synonyms[]`, `antonyms[]`, `etymology`, `notes`
- `ease_factor`, `interval`, `repetitions`, `next_review_at`
- `user_id`, `source`, `is_archived`, `created_at`, `updated_at`

### Reviews Table

Immutable event log for analytics:

- `user_id`, `word_id`, `rating`, `reviewed_at`
- `ease_factor_before/after`, `interval_before/after`

## Spaced Repetition (SM-2)

Rating options: **Again** (0), **Hard** (2), **Good** (4), **Easy** (5)

1. Quality < 3: Reset to day 1
2. Quality ≥ 3: Increment repetitions, calculate interval
3. Update ease factor (minimum 1.3)
4. Schedule next review = now + interval days

## Contributing

1. Install dependencies: `bun install`
2. Start dev server: `bun run dev`
3. Make changes
4. Run checks: `bun run typecheck && bun run lint`
5. Submit a pull request

## License

MIT
