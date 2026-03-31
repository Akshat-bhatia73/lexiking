import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery, useMutation } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Archive, Trash2 } from "lucide-react"

export const Route = createFileRoute("/word/$id")({
  component: WordDetail,
})

function WordDetail() {
  const { id } = Route.useParams()
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const word = useQuery(api.words.get, { id: id as any })
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
