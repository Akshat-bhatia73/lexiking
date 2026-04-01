import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Archive, ArrowLeft, Calendar, Trash2, TrendingUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Again", color: "border border-red-500 bg-red-500/10 text-red-600" },
  2: { label: "Hard", color: "border border-orange-500 bg-orange-500/10 text-orange-600" },
  4: { label: "Good", color: "border border-blue-500 bg-blue-500/10 text-blue-600" },
  5: { label: "Easy", color: "border border-green-500 bg-green-500/10 text-green-600" },
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse bg-muted" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please sign in to view words</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  if (word === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Skeleton className="mb-4 h-8 w-24" />
        <Skeleton className="mb-6 h-10 w-48" />
        <Skeleton className="mb-4 h-32 w-full" />
        <Skeleton className="mb-4 h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (word === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/library" })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Library
      </Button>

      <div className="border border-border bg-card">
        <div className="border-b border-border px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold capitalize">
              {word.word}
            </h1>
            {word.part_of_speech && (
              <span className="border border-border bg-secondary px-2 py-0.5 text-sm text-muted-foreground">
                {word.part_of_speech}
              </span>
            )}
            {word.is_archived && (
              <span className="border border-border bg-secondary px-2 py-0.5 text-sm text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          {word.pronunciation && (
            <p className="mt-2 text-muted-foreground">{word.pronunciation}</p>
          )}
        </div>

        <div className="space-y-6 px-8 py-6">
          <section>
            <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Definition
            </h3>
            <p className="text-lg leading-relaxed">{word.definition}</p>
          </section>

          {word.examples && word.examples.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Examples
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {word.examples.map((example, index) => (
                  <li key={index} className="text-muted-foreground">
                    {example}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {((word.synonyms && word.synonyms.length > 0) ||
            (word.antonyms && word.antonyms.length > 0)) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {word.synonyms && word.synonyms.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Synonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.map((synonym, index) => (
                      <span
                        key={index}
                        className="border border-border bg-secondary px-2 py-1 text-sm"
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms && word.antonyms.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Antonyms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((antonym, index) => (
                      <span
                        key={index}
                        className="border border-border bg-secondary px-2 py-1 text-sm"
                      >
                        {antonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {word.etymology && (
            <section>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Etymology
              </h3>
              <p className="text-muted-foreground">{word.etymology}</p>
            </section>
          )}

          {word.notes && (
            <section>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </h3>
              <p className="text-muted-foreground">{word.notes}</p>
            </section>
          )}

          <section className="border-t border-border pt-6">
            <h3 className="mb-4 font-semibold">Details</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Added:</span>
                <span>{formatDate(word.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next Review:</span>
                <span>{formatDate(word.next_review_at)}</span>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-6">
            <h3 className="mb-4 font-semibold">Learning Progress</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-border bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="font-display text-2xl font-bold">{word.repetitions}</p>
              </div>
              <div className="border border-border bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Interval</p>
                <p className="font-display text-2xl font-bold">{word.interval} days</p>
              </div>
              <div className="border border-border bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Ease Factor</p>
                <p className="font-display text-2xl font-bold">
                  {word.ease_factor.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {reviews && reviews.length > 0 && (
            <section className="border-t border-border pt-6">
              <div className="mb-4 flex items-center justify-between">
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
                      className="flex items-center justify-between border border-border bg-secondary/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-xs font-medium ${rating.color}`}>
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
                            {review.interval_before}d → {review.interval_after}d
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
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Showing last 10 of {reviews.length} reviews
                </p>
              )}
            </section>
          )}

          <section className="flex gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              {word.is_archived ? "Unarchive" : "Archive"}
            </Button>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-600 hover:bg-red-500/10"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}