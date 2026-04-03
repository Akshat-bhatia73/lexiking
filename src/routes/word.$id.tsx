import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { LoadingText } from "@/components/ui/skeleton"

const RATING_LABELS: Record<number, { label: string; className: string }> = {
  0: {
    label: "AGAIN",
    className: "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]",
  },
  2: {
    label: "HARD",
    className: "border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)]",
  },
  4: {
    label: "GOOD",
    className: "border-[var(--interactive)] bg-[var(--interactive)]/10 text-[var(--interactive)]",
  },
  5: {
    label: "EASY",
    className: "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]",
  },
}

export const Route = createFileRoute("/word/$id")({
  component: WordDetail,
})

function WordDetail() {
  const { id } = Route.useParams()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const wordId = id as Id<"words">
  const word = useQuery(api.words.get, { id: wordId })
  const reviews = useQuery(api.reviews.byWord, { wordId })
  const archiveWord = useMutation(api.words.archive)
  const deleteWord = useMutation(api.words.remove)

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingText />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-[var(--text-secondary)]">Please sign in to view words</p>
        <Button onClick={() => navigate({ to: "/" })}>GO HOME</Button>
      </div>
    )
  }

  if (word === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <LoadingText>LOADING...</LoadingText>
      </div>
    )
  }

  if (word === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-[var(--text-secondary)]">Word not found</p>
        <Button onClick={() => navigate({ to: "/" })}>GO HOME</Button>
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
        ← BACK TO LIBRARY
      </Button>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-4xl font-medium capitalize text-[var(--text-display)]">
              {word.word}
            </h1>
            {word.part_of_speech && (
              <span className="tag">
                {word.part_of_speech}
              </span>
            )}
            {word.is_archived && (
              <span className="tag">
                ARCHIVED
              </span>
            )}
          </div>
          {word.pronunciation && (
            <p className="mt-2 text-[var(--text-secondary)] font-mono">{word.pronunciation}</p>
          )}
        </div>

        <div className="space-y-6 px-8 py-6">
          <section>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
              DEFINITION
            </h3>
            <p className="text-lg leading-relaxed text-[var(--text-primary)]">{word.definition}</p>
          </section>

          {word.examples && word.examples.length > 0 && (
            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                EXAMPLES
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {word.examples.map((example, index) => (
                  <li key={index} className="text-[var(--text-secondary)]">
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
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                    SYNONYMS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.map((synonym, index) => (
                      <span key={index} className="tag">
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {word.antonyms && word.antonyms.length > 0 && (
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                    ANTONYMS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((antonym, index) => (
                      <span key={index} className="tag">
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
              <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                ETYMOLOGY
              </h3>
              <p className="text-[var(--text-secondary)]">{word.etymology}</p>
            </section>
          )}

          {word.notes && (
            <section>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-2">
                NOTES
              </h3>
              <p className="text-[var(--text-secondary)]">{word.notes}</p>
            </section>
          )}

          <section className="border-t border-[var(--border)] pt-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-4">
              DETAILS
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[var(--text-secondary)]">Added:</span>
                <span className="font-mono text-[var(--text-primary)]">{formatDate(word.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[var(--text-secondary)]">Next Review:</span>
                <span className="font-mono text-[var(--text-primary)]">{formatDate(word.next_review_at)}</span>
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--border)] pt-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-4">
              LEARNING PROGRESS
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-[var(--border)] bg-[var(--surface-raised)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">REVIEWS</p>
                <p className="font-mono text-2xl font-bold text-[var(--text-display)] mt-1">
                  {word.repetitions}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface-raised)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">INTERVAL</p>
                <p className="font-mono text-2xl font-bold text-[var(--text-display)] mt-1">
                  {word.interval} DAYS
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface-raised)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">EASE FACTOR</p>
                <p className="font-mono text-2xl font-bold text-[var(--text-display)] mt-1">
                  {word.ease_factor.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {reviews && reviews.length > 0 && (
            <section className="border-t border-[var(--border)] pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  REVIEW HISTORY
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  {reviews.length} REVIEWS
                </span>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {reviews.slice(0, 10).map((review) => {
                  const rating = RATING_LABELS[review.rating]
                  return (
                    <div
                      key={review._id}
                      className={`flex items-center justify-between border border-[var(--border)] p-3 ${rating.className.replace('text-[', 'bg-[var(--')}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-xs font-mono font-medium ${rating.className}`}>
                          {rating.label}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-mono">
                          <span>EF: {review.ease_factor_before.toFixed(2)} → {review.ease_factor_after.toFixed(2)}</span>
                          <span className="text-[var(--text-disabled)]">|</span>
                          <span>{review.interval_before}d → {review.interval_after}d</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-mono">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(review.reviewed_at)}
                      </div>
                    </div>
                  )
                })}
              </div>
              {reviews.length > 10 && (
                <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  SHOWING LAST 10 OF {reviews.length} REVIEWS
                </p>
              )}
            </section>
          )}

          <section className="flex gap-3 border-t border-[var(--border)] pt-6">
            <Button variant="secondary" onClick={handleArchive}>
              {word.is_archived ? "UNARCHIVE" : "ARCHIVE"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              DELETE
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}