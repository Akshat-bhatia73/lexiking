import { useAuth, useUser } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, BookOpen, Brain, Sparkles, TrendingUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse bg-muted" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {!isSignedIn ? <LandingPage /> : <Dashboard />}
    </div>
  )
}

function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e4e1_1px,transparent_1px),linear-gradient(to_bottom,#e5e4e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-border bg-secondary/50 px-3 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">
              AI-powered vocabulary building
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Build a vocabulary that{" "}
            <span className="text-primary">actually sticks</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
            LexiKing combines AI-powered word enrichment with spaced repetition to
            help you learn and retain new words effortlessly. Your personal
            dictionary that grows with you.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2">
              Start Learning Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              See How It Works
            </Button>
          </div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Enrichment"
            description="Add any word and let AI fill in definitions, examples, etymology, synonyms, and more."
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6" />}
            title="Smart Spaced Repetition"
            description="Our SM-2 algorithm schedules reviews at optimal intervals for maximum retention."
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Track Progress"
            description="Visualize your learning journey with detailed analytics on retention and mastery."
          />
        </div>

        <div className="mt-24 text-center">
          <h2 className="font-display text-3xl font-bold">
            Your words, beautifully organized
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every word in your library becomes a rich learning resource with
            definitions, pronunciations, examples, and more.
          </p>

          <div className="mt-12 overflow-hidden border border-border bg-card">
            <div className="bg-secondary/50 px-6 py-4 text-left">
              <span className="text-sm text-muted-foreground">
                Your Library
              </span>
            </div>
            <div className="divide-y divide-border">
              <WordPreview
                word="ephemeral"
                partOfSpeech="adjective"
                definition="Lasting for a very short time; transitory."
              />
              <WordPreview
                word="serendipity"
                partOfSpeech="noun"
                definition="The occurrence of events by chance in a happy way."
              />
              <WordPreview
                word="ubiquitous"
                partOfSpeech="adjective"
                definition="Present, appearing, or found everywhere."
              />
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="font-display text-3xl font-bold">How it works</h2>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="grid gap-8 text-left md:grid-cols-3">
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 font-display text-4xl font-bold text-accent">
                  1
                </span>
                <h3 className="font-semibold">Add a Word</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter any word and let AI enrich it with definitions, examples,
                  synonyms, and more.
                </p>
              </div>
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 font-display text-4xl font-bold text-accent">
                  2
                </span>
                <h3 className="font-semibold">Review Daily</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Take short quizzes on words due for review. Rate how well you
                  knew each one.
                </p>
              </div>
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 font-display text-4xl font-bold text-accent">
                  3
                </span>
                <h3 className="font-semibold">Master Over Time</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Watch your retention improve as the algorithm optimizes your
                  review schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="font-display text-3xl font-bold">
            Ready to expand your vocabulary?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of learners building their personal dictionaries.
          </p>
          <div className="mt-8">
            <Button size="lg" className="gap-2">
              Get Started — It's Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border border-border bg-card p-6 text-left">
      <div className="mb-4 inline-flex items-center justify-center border border-border bg-secondary p-3 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
    <div className="flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-secondary/50">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-medium capitalize">
            {word}
          </span>
          <span className="border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
            {partOfSpeech}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {definition}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
        <h1 className="font-display text-3xl font-bold">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dueCount > 0? (
            <>
              You have{" "}
              <span className="font-semibold text-foreground">{dueCount}</span>{" "}
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
        <div className="mb-12 border border-primary bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Ready for review</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your daily practice to maintain your streak
              </p>
            </div>
            <Link to="/quiz">
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Words Due Today"
          value={dueCount}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Total Words"
          value={totalCount}
          icon={<Sparkles className="h-5 w-5" />}
        />
        <StatCard
          label="Retention Rate"
          value={`${Math.round(retentionRate * 100)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {totalCount === 0 && (
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-md border border-dashed border-border p-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Add your first word</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start building your personal dictionary with AI-powered enrichment.
            </p>
            <Link to="/add">
              <Button className="mt-6">
                <Sparkles className="mr-2 h-4 w-4" />
                Add Word
              </Button>
            </Link>
          </div>
        </div>
      )}

      {allWords && allWords.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent Words</h2>
            <Link to="/library">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border border border-border bg-card">
            {allWords.slice(0, 5).map((word) => (
              <Link
                key={word._id}
                to="/word/$id"
                params={{ id: word._id }}
              >
                <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-medium capitalize">
                        {word.word}
                      </span>
                      {word.part_of_speech && (
                        <span className="border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                          {word.part_of_speech}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {word.definition}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
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
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-border bg-secondary text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}