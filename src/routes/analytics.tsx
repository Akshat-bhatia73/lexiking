import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Award, BookOpen, Target, TrendingUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/analytics")({
  component: Analytics,
})

function Analytics() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState(30)

  const stats = useQuery(api.reviews.stats, { days: timeRange })
  const allWords = useQuery(api.words.list, {})
  const dueWords = useQuery(api.words.dueToday, {})

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse bg-muted" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Please sign in to view analytics
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  const isLoading =
    stats === undefined || allWords === undefined || dueWords === undefined

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track your vocabulary learning progress
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setTimeRange(7)}
          className={`px-4 py-2 text-sm transition-colors ${
            timeRange === 7
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-secondary"
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange(30)}
          className={`px-4 py-2 text-sm transition-colors ${
            timeRange === 30
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-secondary"
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange(90)}
          className={`px-4 py-2 text-sm transition-colors ${
            timeRange === 90
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-secondary"
          }`}
        >
          90 Days
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border bg-card p-6">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Total Words"
              value={allWords.length}
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Due Today"
              value={dueWords.length}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Reviews"
              value={stats.total}
            />
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label="Retention"
              value={`${Math.round(stats.retentionRate * 100)}%`}
            />
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold">Rating Breakdown</h2>
              <p className="text-sm text-muted-foreground">
                How you've rated your recalls
              </p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-4">
              <RatingCard
                label="Again"
                count={stats.breakdown.again}
                color="border-red-500 bg-red-500/10"
                textColor="text-red-600"
                description="Couldn't recall"
              />
              <RatingCard
                label="Hard"
                count={stats.breakdown.hard}
                color="border-orange-500 bg-orange-500/10"
                textColor="text-orange-600"
                description="Significant difficulty"
              />
              <RatingCard
                label="Good"
                count={stats.breakdown.good}
                color="border-blue-500 bg-blue-500/10"
                textColor="text-blue-600"
                description="Correct with hesitation"
              />
              <RatingCard
                label="Easy"
                count={stats.breakdown.easy}
                color="border-green-500 bg-green-500/10"
                textColor="text-green-600"
                description="Perfect recall"
              />
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold">Summary</h2>
            </div>
            <div className="divide-y divide-border p-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground">
                  Successful Reviews
                </span>
                <span className="font-semibold">{stats.successful}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground">Failed Reviews</span>
                <span className="font-semibold">{stats.failed}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold">
                  {stats.total > 0
                    ? Math.round((stats.successful / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {allWords.length > 0 && (
            <div className="border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-semibold">Words by Status</h2>
                <p className="text-sm text-muted-foreground">
                  Learning progress distribution
                </p>
              </div>
              <div className="divide-y divide-border p-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    New <span className="text-xs">(not reviewed)</span>
                  </span>
                  <span className="border border-border bg-secondary px-3 py-1 text-sm">
                    {allWords.filter((w) => w.repetitions === 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-muted-foreground">
                    Learning <span className="text-xs">(1-2 reviews)</span>
                  </span>
                  <span className="border border-border bg-secondary px-3 py-1 text-sm">
                    {
                      allWords.filter(
                        (w) => w.repetitions >= 1 && w.repetitions <= 2
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-muted-foreground">
                    Mastered <span className="text-xs">(3+ reviews)</span>
                  </span>
                  <span className="border border-border bg-secondary px-3 py-1 text-sm">
                    {allWords.filter((w) => w.repetitions >= 3).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
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

function RatingCard({
  label,
  count,
  color,
  textColor,
  description,
}: {
  label: string
  count: number
  color: string
  textColor: string
  description: string
}) {
  return (
    <div className={`${color} border p-4`}>
      <p className={`text-sm ${textColor}`}>{label}</p>
      <p className={`font-display text-2xl font-bold ${textColor}`}>{count}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
