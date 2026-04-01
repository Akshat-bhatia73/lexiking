import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { CheckCircle, Eye, EyeOff, Sparkles } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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
        <p className="text-muted-foreground">Please sign in to start quiz</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  if (dueWords === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Skeleton className="mb-4 h-8 w-24" />
        <Skeleton className="mb-6 h-64 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (dueWords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex flex-col items-center justify-center border border-border bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center border border-border bg-secondary">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">All caught up!</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            No words due for review today. Great job!
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/library" })}>
            View Library
          </Button>
        </div>
      </div>
    )
  }

  const totalWords = dueWords.length
  const isComplete = currentIndex >= totalWords

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex flex-col items-center justify-center border border-border bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center border border-border bg-secondary">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Quiz Complete!</h2>
          <p className="mt-2 text-muted-foreground">
            You reviewed {completedCount} out of {totalWords} words.
          </p>
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>
              Go Home
            </Button>
            <Button onClick={() => navigate({ to: "/analytics" })}>
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = dueWords[currentIndex]

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
      label: "Again",
      color: "border border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500/20",
      description: "Couldn't recall",
    },
    {
      value: 2,
      label: "Hard",
      color: "border border-orange-500 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      description: "Significant difficulty",
    },
    {
      value: 4,
      label: "Good",
      color: "border border-blue-500 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      description: "Correct with hesitation",
    },
    {
      value: 5,
      label: "Easy",
      color: "border border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20",
      description: "Perfect recall",
    },
  ]

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {totalWords}
        </span>
        <div className="h-2 w-32 overflow-hidden bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(currentIndex / totalWords) * 100}%` }}
          />
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold capitalize">
              {currentWord.word}
            </h1>
            {currentWord.part_of_speech && (
              <span className="border border-border bg-secondary px-2 py-0.5 text-sm text-muted-foreground">
                {currentWord.part_of_speech}
              </span>
            )}
          </div>
          {currentWord.pronunciation && (
            <p className="mt-2 text-muted-foreground">
              {currentWord.pronunciation}
            </p>
          )}
        </div>

        <div className="px-8 py-8">
          {!showDefinition ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-6 text-muted-foreground">
                Can you recall the meaning?
              </p>
              <Button variant="outline" size="lg" onClick={() => setShowDefinition(true)}>
                <Eye className="mr-2 h-5 w-5" />
                Show Definition
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6 border-b border-border pb-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Definition
                  </h3>
                  <p className="text-lg leading-relaxed">{currentWord.definition}</p>
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Examples
                    </h3>
                    <ul className="list-inside list-disc space-y-1">
                      {currentWord.examples.map((example, index) => (
                        <li key={index} className="text-muted-foreground">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Synonyms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentWord.synonyms.map((synonym, index) => (
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
              </div>

              <div className="pt-6">
                <h3 className="mb-3 text-sm font-medium">
                  How well did you know this?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {ratings.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => handleRate(rating.value)}
                      disabled={isSubmitting}
                      className={`${rating.color} flex flex-col items-start px-4 py-3 text-left transition-colors disabled:opacity-50`}
                    >
                      <span className="font-semibold">{rating.label}</span>
                      <span className="text-xs opacity-70">{rating.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowDefinition(false)}
                className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <EyeOff className="h-4 w-4" />
                Hide definition
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}