import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { api } from "../../convex/_generated/api"
import { LoadingText } from "@/components/ui/skeleton"

export const Route = createFileRoute("/analytics")({
  component: Analytics,
})

function Analytics() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/" })
    }
  }, [isLoaded, isSignedIn, navigate])

  const stats = useQuery(api.reviews.stats, { days: timeRange })
  const allWords = useQuery(api.words.list, {})
  const dueWords = useQuery(api.words.dueToday, {})

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingText />
      </div>
    )
  }

  const isLoading =
    stats === undefined || allWords === undefined || dueWords === undefined

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          ANALYTICS
        </span>
        <h1 className="mt-1 font-sans text-4xl font-medium text-[var(--text-display)]">
          Learning Progress
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Track your vocabulary learning progress
        </p>
      </div>

      <div className="mb-8 segmented-control">
        <button
          onClick={() => setTimeRange(7)}
          className={`segment ${timeRange === 7 ? "segment-active" : ""}`}
        >
          7 DAYS
        </button>
        <button
          onClick={() => setTimeRange(30)}
          className={`segment ${timeRange === 30 ? "segment-active" : ""}`}
        >
          30 DAYS
        </button>
        <button
          onClick={() => setTimeRange(90)}
          className={`segment ${timeRange === 90 ? "segment-active" : ""}`}
        >
          90 DAYS
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <LoadingText>LOADING...</LoadingText>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="TOTAL WORDS"
              value={allWords.length}
            />
            <StatCard
              label="DUE TODAY"
              value={dueWords.length}
            />
            <StatCard
              label="REVIEWS"
              value={stats.total}
            />
            <StatCard
              label="RETENTION"
              value={`${Math.round(stats.retentionRate * 100)}%`}
            />
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                RATING BREAKDOWN
              </span>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                How you've rated your recalls
              </p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-4">
              <RatingCard
                label="AGAIN"
                count={stats.breakdown.again}
                description="Couldn't recall"
                className="border-[var(--accent)] bg-[var(--accent-subtle)]"
                textColor="text-[var(--accent)]"
              />
              <RatingCard
                label="HARD"
                count={stats.breakdown.hard}
                description="Significant difficulty"
                className="border-[var(--warning)] bg-[var(--warning)]/10"
                textColor="text-[var(--warning)]"
              />
              <RatingCard
                label="GOOD"
                count={stats.breakdown.good}
                description="Correct with hesitation"
                className="border-[var(--interactive)] bg-[var(--interactive)]/10"
                textColor="text-[var(--interactive)]"
              />
              <RatingCard
                label="EASY"
                count={stats.breakdown.easy}
                description="Perfect recall"
                className="border-[var(--success)] bg-[var(--success)]/10"
                textColor="text-[var(--success)]"
              />
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                SUMMARY
              </span>
            </div>
            <div className="divide-y divide-[var(--border)] p-6">
              <DataRow label="TOTAL REVIEWS" value={stats.total} />
              <DataRow label="SUCCESSFUL REVIEWS" value={stats.successful} />
              <DataRow label="FAILED REVIEWS" value={stats.failed} />
              <DataRow
                label="SUCCESS RATE"
                value={`${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%`}
              />
            </div>
          </div>

          {allWords.length > 0 && (
            <div className="border border-[var(--border)] bg-[var(--surface)]">
              <div className="border-b border-[var(--border)] px-6 py-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  WORDS BY STATUS
                </span>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Learning progress distribution
                </p>
              </div>
              <div className="divide-y divide-[var(--border)] p-6">
                <DataRow
                  label="NEW"
                  sublabel="(not reviewed)"
                  value={allWords.filter((w) => w.repetitions === 0).length}
                />
                <DataRow
                  label="LEARNING"
                  sublabel="(1-2 reviews)"
                  value={allWords.filter((w) => w.repetitions >= 1 && w.repetitions <= 2).length}
                />
                <DataRow
                  label="MASTERED"
                  sublabel="(3+ reviews)"
                  value={allWords.filter((w) => w.repetitions >= 3).length}
                />
              </div>
            </div>
          )}
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

function RatingCard({
  label,
  count,
  description,
  className,
  textColor,
}: {
  label: string
  count: number
  description: string
  className: string
  textColor: string
}) {
  return (
    <div className={`border p-4 ${className}`}>
      <p className={`font-mono text-[11px] uppercase tracking-[0.08em] ${textColor}`}>
        {label}
      </p>
      <p className={`font-mono text-2xl font-bold mt-1 ${textColor}`}>{count}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{description}</p>
    </div>
  )
}

function DataRow({
  label,
  sublabel,
  value,
}: {
  label: string
  sublabel?: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-[var(--text-disabled)]">{sublabel}</span>
        )}
      </div>
      <span className="font-mono text-lg font-medium text-[var(--text-display)]">
        {value}
      </span>
    </div>
  )
}