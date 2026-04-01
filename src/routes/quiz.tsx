import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation, useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please sign in to start quiz</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  if (dueWords === undefined) {
    return (
      <div className="min-h-svh p-6">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="mb-4 h-8 w-24" />
          <Skeleton className="mb-6 h-64 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (dueWords.length === 0) {
    return (
      <div className="min-h-svh p-6">
        <div className="mx-auto max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold">All caught up!</h2>
              <p className="mb-6 text-center text-muted-foreground">
                No words due for review today. Great job!
              </p>
              <Button onClick={() => navigate({ to: "/library" })}>
                View Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalWords = dueWords.length
  const isComplete = currentIndex >= totalWords

  if (isComplete) {
    return (
      <div className="min-h-svh p-6">
        <div className="mx-auto max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold">Quiz Complete!</h2>
              <p className="mb-6 text-center text-muted-foreground">
                You reviewed {completedCount} out of {totalWords} words.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                  Go Home
                </Button>
                <Button onClick={() => navigate({ to: "/analytics" })}>
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
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
      color: "bg-red-500 hover:bg-red-600",
      description: "Couldn't recall",
    },
    {
      value: 2,
      label: "Hard",
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Significant difficulty",
    },
    {
      value: 4,
      label: "Good",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Correct with hesitation",
    },
    {
      value: 5,
      label: "Easy",
      color: "bg-green-500 hover:bg-green-600",
      description: "Perfect recall",
    },
  ]

  return (
    <div className="min-h-svh p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalWords}
          </span>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl capitalize">
                {currentWord.word}
              </CardTitle>
              {currentWord.part_of_speech && (
                <Badge variant="secondary">{currentWord.part_of_speech}</Badge>
              )}
            </div>
            {currentWord.pronunciation && (
              <p className="text-muted-foreground">
                {currentWord.pronunciation}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {!showDefinition ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDefinition(true)}
                  className="gap-2"
                >
                  <Eye className="h-5 w-5" />
                  Show Definition
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 rounded-lg border p-4">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                      Definition
                    </h3>
                    <p className="text-lg">{currentWord.definition}</p>
                  </div>

                  {currentWord.examples && currentWord.examples.length > 0 && (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
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
                      <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                        Synonyms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentWord.synonyms.map((synonym, index) => (
                          <Badge key={index} variant="outline">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDefinition(false)}
                  className="gap-1"
                >
                  <EyeOff className="h-4 w-4" />
                  Hide
                </Button>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    How well did you know this?
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ratings.map((rating) => (
                      <Button
                        key={rating.value}
                        onClick={() => handleRate(rating.value)}
                        disabled={isSubmitting}
                        className={`${rating.color} text-white`}
                      >
                        <div className="text-left">
                          <div className="font-semibold">{rating.label}</div>
                          <div className="text-xs opacity-80">
                            {rating.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentIndex / totalWords) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
