import { useAuth, useUser } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/skeleton"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {!isSignedIn ? <LandingPage /> : <Dashboard />}
    </div>
  )
}

function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 dot-grid-subtle opacity-20" />

      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 border border-[var(--border-visible)] px-3 py-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              AI-POWERED VOCABULARY BUILDING
            </span>
          </div>

          <h1 className="font-sans text-5xl font-medium leading-tight tracking-tight text-[var(--text-display)] md:text-6xl lg:text-7xl">
            Build a vocabulary that
            <br />
            <span className="text-[var(--text-primary)]">actually sticks</span>
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)]">
            LexiKing combines AI-powered word enrichment with spaced repetition to
            help you learn and retain new words effortlessly.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg">
              START LEARNING FREE
            </Button>
            <Button variant="secondary" size="lg">
              SEE HOW IT WORKS
            </Button>
          </div>
        </div>

        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <FeatureCard
            label="AI ENRICHMENT"
            title="Smart Definitions"
            description="Add any word and let AI fill in definitions, examples, etymology, synonyms, and more."
          />
          <FeatureCard
            label="SPACED REPETITION"
            title="SM-2 Algorithm"
            description="Our algorithm schedules reviews at optimal intervals for maximum retention."
          />
          <FeatureCard
            label="ANALYTICS"
            title="Track Progress"
            description="Visualize your learning journey with detailed analytics on retention and mastery."
          />
        </div>

        <div className="mt-32">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              YOUR LIBRARY
            </span>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                PREVIEW
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <WordPreview
                word="ephemeral"
                partOfSpeech="adj"
                definition="Lasting for a very short time; transitory."
              />
              <WordPreview
                word="serendipity"
                partOfSpeech="noun"
                definition="The occurrence of events by chance in a happy way."
              />
              <WordPreview
                word="ubiquitous"
                partOfSpeech="adj"
                definition="Present, appearing, or found everywhere."
              />
            </div>
          </div>
        </div>

        <div className="mt-32 text-center">
          <div className="grid gap-16 text-left md:grid-cols-3">
            <div className="relative">
              <span className="font-mono text-5xl font-medium text-[var(--text-display)]">
                01
              </span>
              <h3 className="mt-4 font-sans text-lg font-medium text-[var(--text-primary)]">
                Add a Word
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter any word and let AI enrich it with definitions, examples,
                synonyms, and more.
              </p>
            </div>
            <div className="relative">
              <span className="font-mono text-5xl font-medium text-[var(--text-display)]">
                02
              </span>
              <h3 className="mt-4 font-sans text-lg font-medium text-[var(--text-primary)]">
                Review Daily
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Take short quizzes on words due for review. Rate how well you
                knew each one.
              </p>
            </div>
            <div className="relative">
              <span className="font-mono text-5xl font-medium text-[var(--text-display)]">
                03
              </span>
              <h3 className="mt-4 font-sans text-lg font-medium text-[var(--text-primary)]">
                Master Over Time
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Watch your retention improve as the algorithm optimizes your
                review schedule.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-32 text-center">
          <h2 className="font-sans text-3xl font-medium text-[var(--text-display)]">
            Ready to expand your vocabulary?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
            Join thousands of learners building their personal dictionaries.
          </p>
          <div className="mt-8">
            <Button size="lg">
              GET STARTED — FREE
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        {label}
      </span>
      <h3 className="mt-4 font-sans text-lg font-medium text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  )
}

function WordPreview({
  word,
  partOfSpeech,
  definition,
}: {
  word: string
  partOfSpeech: string
  definition: string
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[var(--surface-raised)]">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-medium capitalize text-[var(--text-display)]">
            {word}
          </span>
          <span className="tag">
            {partOfSpeech}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
          {definition}
        </p>
      </div>
      <svg
        className="h-4 w-4 flex-shrink-0 text-[var(--text-disabled)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  )
}

function Dashboard() {
  const { user } = useUser()
  const dueToday = useQuery(api.words.dueToday, {})
  const allWords = useQuery(api.words.list, {})
  const stats = useQuery(api.reviews.stats, { days: 30 })

  const dueCount = dueToday?.length ?? 0
  const totalCount = allWords?.length ?? 0
  const retentionRate = stats?.retentionRate ?? 0

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          DASHBOARD
        </span>
        <h1 className="mt-2 font-sans text-4xl font-medium text-[var(--text-display)]">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {dueCount > 0 ? (
            <>
              You have{" "}
              <span className="font-mono font-bold text-[var(--text-display)]">{dueCount}</span>{" "}
              {dueCount === 1 ? "word" : "words"} due for review today.
            </>
          ) : totalCount === 0 ? (
            "Start building your vocabulary by adding your first word."
          ) : (
            "No words due for review today. Great job!"
          )}
        </p>
      </div>

      {dueCount > 0 && (
        <div className="mb-12 border border-[var(--accent)] bg-[var(--accent-subtle)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]">
                READY FOR REVIEW
              </span>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Complete your daily practice to maintain your streak
              </p>
            </div>
            <Link to="/quiz">
              <Button>
                START QUIZ
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="WORDS DUE TODAY"
          value={dueCount}
        />
        <StatCard
          label="TOTAL WORDS"
          value={totalCount}
        />
        <StatCard
          label="RETENTION RATE"
          value={`${Math.round(retentionRate * 100)}%`}
        />
      </div>

      {totalCount === 0 && (
        <div className="mt-12 text-center py-24">
          <div className="border border-[var(--border-visible)] px-8 py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center border border-[var(--border-visible)] bg-[var(--surface)] mx-auto">
              <svg className="h-6 w-6 text-[var(--text-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-medium text-[var(--text-secondary)]">
              Add your first word
            </h3>
            <p className="mt-2 text-sm text-[var(--text-disabled)]">
              Start building your personal dictionary with AI-powered enrichment.
            </p>
            <Link to="/add">
              <Button className="mt-6">
                ADD WORD
              </Button>
            </Link>
          </div>
        </div>
      )}

      {allWords && allWords.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              RECENT WORDS
            </span>
            <Link to="/library">
              <Button variant="ghost" size="sm">
                VIEW ALL
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
            {allWords.slice(0, 5).map((word) => (
              <Link
                key={word._id}
                to="/word/$id"
                params={{ id: word._id }}
              >
                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--surface-raised)]">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium capitalize text-[var(--text-display)]">
                        {word.word}
                      </span>
                      {word.part_of_speech && (
                        <span className="tag">
                          {word.part_of_speech}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
                      {word.definition}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-[var(--text-disabled)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
        {label}
      </span>
      <p className="mt-2 font-mono text-3xl font-bold text-[var(--text-display)]">
        {value}
      </p>
    </div>
  )
}