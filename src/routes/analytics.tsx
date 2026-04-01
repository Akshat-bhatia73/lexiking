import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ArrowLeft, Award, BookOpen, Target, TrendingUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/analytics")({
  component: Analytics,
})

function Analytics() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState(7)

  const stats = useQuery(api.reviews.stats, { days: timeRange })
  const allWords = useQuery(api.words.list, {})
  const dueWords = useQuery(api.words.dueToday, {})

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
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
    <div className="min-h-svh p-6">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="mb-6 text-3xl font-bold">Analytics</h1>

        <div className="mb-6 flex gap-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Total Words
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{allWords.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Due Today
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{dueWords.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Reviews
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Retention
                    </span>
                  </div>
                  <p className="text-3xl font-bold">
                    {Math.round(stats.retentionRate * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Again</p>
                    <p className="text-2xl font-bold text-red-500">
                      {stats.breakdown.again}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Couldn't recall
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Hard</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {stats.breakdown.hard}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Significant difficulty
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Good</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {stats.breakdown.good}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Correct with hesitation
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Easy</p>
                    <p className="text-2xl font-bold text-green-500">
                      {stats.breakdown.easy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Perfect recall
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Reviews</span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Successful Reviews
                    </span>
                    <span className="font-semibold">{stats.successful}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Failed Reviews
                    </span>
                    <span className="font-semibold">{stats.failed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-semibold">
                      {stats.total > 0
                        ? Math.round((stats.successful / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {allWords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Words by Review Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        New (not reviewed)
                      </span>
                      <Badge variant="secondary">
                        {allWords.filter((w) => w.repetitions === 0).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Learning (1-2 reviews)
                      </span>
                      <Badge variant="secondary">
                        {
                          allWords.filter(
                            (w) => w.repetitions >= 1 && w.repetitions <= 2
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Mastered (3+ reviews)
                      </span>
                      <Badge variant="secondary">
                        {allWords.filter((w) => w.repetitions >= 3).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
