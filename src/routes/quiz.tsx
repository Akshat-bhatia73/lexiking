import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { api } from "../../convex/_generated/api"
import type { Doc } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { LoadingText } from "@/components/ui/skeleton"

export const Route = createFileRoute("/quiz")({
  component: Quiz,
})

function Quiz() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const dueWords = useQuery(api.words.dueToday, {})
  const recordReview = useMutation(api.reviews.record)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [sessionWords, setSessionWords] = useState<Array<Doc<"words">>>([])
  const [hasInitializedSession, setHasInitializedSession] = useState(false)

  useEffect(() => {
    if (dueWords === undefined || hasInitializedSession) {
      return
    }

    setSessionWords(dueWords)
    setCurrentIndex(0)
    setCompletedCount(0)
    setShowDefinition(false)
    setHasInitializedSession(true)
  }, [dueWords, hasInitializedSession])

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
        <p className="text-[var(--text-secondary)]">
          Please sign in to start quiz
        </p>
        <Button onClick={() => navigate({ to: "/" })}>GO HOME</Button>
      </div>
    )
  }

  if (dueWords === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <LoadingText>LOADING QUIZ...</LoadingText>
      </div>
    )
  }

  if (!hasInitializedSession && dueWords.length > 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <LoadingText>STARTING QUIZ...</LoadingText>
      </div>
    )
  }

  if (sessionWords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="border border-[var(--border-visible)] bg-[var(--surface)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-[var(--border-visible)] bg-[var(--surface-raised)]">
            <svg
              className="h-8 w-8 text-[var(--success)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="font-sans text-2xl font-medium text-[var(--text-display)]">
            ALL CAUGHT UP
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[var(--text-secondary)]">
            No words due for review today. Great job!
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/library" })}>
            VIEW LIBRARY
          </Button>
        </div>
      </div>
    )
  }

  const totalWords = sessionWords.length
  const isComplete = currentIndex >= totalWords

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="border border-[var(--border-visible)] bg-[var(--surface)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-[var(--border-visible)] bg-[var(--surface-raised)]">
            <svg
              className="h-8 w-8 text-[var(--success)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h2 className="font-sans text-2xl font-medium text-[var(--text-display)]">
            QUIZ COMPLETE
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            You reviewed {completedCount} out of {totalWords} words.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate({ to: "/" })}>
              GO HOME
            </Button>
            <Button onClick={() => navigate({ to: "/analytics" })}>
              VIEW ANALYTICS
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = sessionWords[currentIndex]

  const handleRate = async (rating: number) => {
    setIsSubmitting(true)
    try {
      await recordReview({ wordId: currentWord._id, rating })
      setCompletedCount((c) => c + 1)
      setCurrentIndex((i) => i + 1)
      setShowDefinition(false)
    } catch (error) {
      console.error("Failed to record review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const ratings = [
    {
      value: 0,
      label: "AGAIN",
      description: "Couldn't recall",
      className:
        "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)]/20",
    },
    {
      value: 2,
      label: "HARD",
      description: "Significant difficulty",
      className:
        "border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/20",
    },
    {
      value: 4,
      label: "GOOD",
      description: "Correct with hesitation",
      className:
        "border-[var(--good)] bg-[var(--good)]/10 text-[var(--good)] hover:bg-[var(--good)]/20",
    },
    {
      value: 5,
      label: "EASY",
      description: "Perfect recall",
      className:
        "border-[var(--easy)] bg-[var(--easy)]/10 text-[var(--easy)] hover:bg-[var(--easy)]/20",
    },
  ]

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
          {currentIndex + 1} OF {totalWords}
        </span>
        <div className="h-2 w-32 overflow-hidden bg-[var(--border)]">
          <div
            className="h-full bg-[var(--text-display)] transition-all duration-300"
            style={{ width: `${(completedCount / totalWords) * 100}%` }}
          />
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-4xl font-medium text-[var(--text-display)] capitalize">
              {currentWord.word}
            </h1>
            {currentWord.part_of_speech && (
              <span className="tag">{currentWord.part_of_speech}</span>
            )}
          </div>
          {currentWord.pronunciation && (
            <p className="mt-2 font-mono text-[var(--text-secondary)]">
              {currentWord.pronunciation}
            </p>
          )}
        </div>

        <div className="px-8 py-8">
          {!showDefinition ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-6 text-[var(--text-secondary)]">
                Can you recall the meaning?
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowDefinition(true)}
              >
                SHOW DEFINITION
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6 border-b border-[var(--border)] pb-6">
                <div>
                  <div className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
                    DEFINITION
                  </div>
                  <p className="text-lg leading-relaxed text-[var(--text-primary)]">
                    {currentWord.definition}
                  </p>
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div>
                    <div className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
                      EXAMPLES
                    </div>
                    <ul className="list-inside list-disc space-y-1">
                      {currentWord.examples.map((example, index) => (
                        <li
                          key={index}
                          className="text-[var(--text-secondary)]"
                        >
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                  <div>
                    <div className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
                      SYNONYMS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentWord.synonyms.map((synonym, index) => (
                        <span key={index} className="tag">
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <div className="mb-3 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
                  HOW WELL DID YOU KNOW THIS?
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ratings.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleRate(rating.value)}
                      disabled={isSubmitting}
                      className={`flex flex-col items-start border px-4 py-3 text-left transition-colors disabled:opacity-50 ${rating.className}`}
                    >
                      <span className="font-mono text-sm font-medium">
                        {rating.label}
                      </span>
                      <span className="text-xs opacity-70">
                        {rating.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowDefinition(false)}
                className="mt-4 flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.427a3 3 0 114.243 4.243M9.878 9.878l4.242-4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                Hide definition
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
