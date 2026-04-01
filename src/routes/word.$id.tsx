import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Archive, ArrowLeft, Calendar, Trash2, TrendingUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Again", color: "bg-red-100 text-red-800" },
  2: { label: "Hard", color: "bg-orange-100 text-orange-800" },
  4: { label: "Good", color: "bg-blue-100 text-blue-800" },
  5: { label: "Easy", color: "bg-green-100 text-green-800" },
}

export const Route = createFileRoute("/word/$id")({
  component: WordDetail,
})

function WordDetail() {
  const { id } = Route.useParams()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const word = useQuery(api.words.get, { id: id as any })
  const reviews = useQuery(api.reviews.byWord, { wordId: id as any })
  const archiveWord = useMutation(api.words.archive)
  const deleteWord = useMutation(api.words.remove)

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
        <p className="text-muted-foreground">Please sign in to view words</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  if (word === undefined) {
    return (
      <div className="min-h-svh p-6">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="mb-4 h-8 w-24" />
          <Skeleton className="mb-6 h-10 w-48" />
          <Skeleton className="mb-4 h-32 w-full" />
          <Skeleton className="mb-4 h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (word === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Word not found</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  const handleArchive = async () => {
    await archiveWord({ id: word._id, archived: !word.is_archived })
    navigate({ to: "/library" })
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this word?")) {
      await deleteWord({ id: word._id })
      navigate({ to: "/library" })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-svh p-6">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/library" })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl capitalize">
                  {word.word}
                </CardTitle>
                {word.part_of_speech && (
                  <Badge variant="secondary">{word.part_of_speech}</Badge>
                )}
                {word.is_archived && <Badge variant="outline">Archived</Badge>}
              </div>
            </div>
            {word.pronunciation && (
              <p className="text-muted-foreground">{word.pronunciation}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Definition</h3>
              <p>{word.definition}</p>
            </div>

            {word.examples && word.examples.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Examples</h3>
                <ul className="list-inside list-disc space-y-1">
                  {word.examples.map((example, index) => (
                    <li key={index} className="text-muted-foreground">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {((word.synonyms && word.synonyms.length > 0) ||
              (word.antonyms && word.antonyms.length > 0)) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {word.synonyms && word.synonyms.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((synonym, index) => (
                        <Badge key={index} variant="outline">
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {word.antonyms && word.antonyms.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-semibold">Antonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.map((antonym, index) => (
                        <Badge key={index} variant="outline">
                          {antonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {word.etymology && (
              <div>
                <h3 className="mb-2 font-semibold">Etymology</h3>
                <p className="text-muted-foreground">{word.etymology}</p>
              </div>
            )}

            {word.notes && (
              <div>
                <h3 className="mb-2 font-semibold">Notes</h3>
                <p className="text-muted-foreground">{word.notes}</p>
              </div>
            )}

            <div className="grid gap-4 border-t pt-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <span className="font-medium">Added:</span>{" "}
                {formatDate(word.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {formatDate(word.updated_at)}
              </div>
              <div>
                <span className="font-medium">Next Review:</span>{" "}
                {formatDate(word.next_review_at)}
              </div>
              <div>
                <span className="font-medium">Source:</span>{" "}
                {word.source || "manual"}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Learning Progress</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-xl font-bold">{word.repetitions}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Interval</p>
                  <p className="text-xl font-bold">{word.interval} days</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Ease Factor</p>
                  <p className="text-xl font-bold">
                    {word.ease_factor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {reviews && reviews.length > 0 && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Review History</h3>
                  <span className="text-sm text-muted-foreground">
                    {reviews.length} reviews
                  </span>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {reviews.slice(0, 10).map((review) => {
                    const rating = RATING_LABELS[review.rating]
                    return (
                      <div
                        key={review._id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${rating.color}`}
                          >
                            {rating.label}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>
                              EF: {review.ease_factor_before.toFixed(2)} →{" "}
                              {review.ease_factor_after.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground/50">|</span>
                            <span>
                              {review.interval_before}d →{" "}
                              {review.interval_after}d
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(review.reviewed_at)}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {reviews.length > 10 && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Showing last 10 of {reviews.length} reviews
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 border-t pt-4">
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {word.is_archived ? "Unarchive" : "Archive"}
              </Button>
              <Button
                variant="outline"
                className="hover:text-destructive-foreground text-destructive hover:bg-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
