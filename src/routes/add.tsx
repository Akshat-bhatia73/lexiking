import { useAuth } from "@clerk/tanstack-react-start"
import { useMutation } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Plus, X } from "lucide-react"

export const Route = createFileRoute("/add")({
  component: AddWord,
})

function AddWord() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const saveWord = useMutation(api.words.save)

  const [word, setWord] = useState("")
  const [isEnriching, setIsEnriching] = useState(false)
  const [isEnriched, setIsEnriched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [definition, setDefinition] = useState("")
  const [partOfSpeech, setPartOfSpeech] = useState("")
  const [pronunciation, setPronunciation] = useState("")
  const [examples, setExamples] = useState<string[]>([""])
  const [synonyms, setSynonyms] = useState<string[]>([""])
  const [antonyms, setAntonyms] = useState<string[]>([""])
  const [etymology, setEtymology] = useState("")
  const [notes, setNotes] = useState("")

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
        <p className="text-muted-foreground">Please sign in to add words</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
      </div>
    )
  }

  const handleEnrich = async () => {
    if (!word.trim()) return
    setIsEnriching(true)
    // Placeholder for AI enrichment - will be implemented later
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsEnriching(false)
    setIsEnriched(true)
  }

  const handleAddExample = () => setExamples([...examples, ""])
  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }
  const handleExampleChange = (index: number, value: string) => {
    const updated = [...examples]
    updated[index] = value
    setExamples(updated)
  }

  const handleAddSynonym = () => setSynonyms([...synonyms, ""])
  const handleRemoveSynonym = (index: number) => {
    setSynonyms(synonyms.filter((_, i) => i !== index))
  }
  const handleSynonymChange = (index: number, value: string) => {
    const updated = [...synonyms]
    updated[index] = value
    setSynonyms(updated)
  }

  const handleAddAntonym = () => setAntonyms([...antonyms, ""])
  const handleRemoveAntonym = (index: number) => {
    setAntonyms(antonyms.filter((_, i) => i !== index))
  }
  const handleAntonymChange = (index: number, value: string) => {
    const updated = [...antonyms]
    updated[index] = value
    setAntonyms(updated)
  }

  const handleSave = async () => {
    if (!word.trim() || !definition.trim()) return

    setIsSaving(true)
    try {
      const wordId = await saveWord({
        word: word.trim(),
        definition: definition.trim(),
        part_of_speech: partOfSpeech.trim() || undefined,
        pronunciation: pronunciation.trim() || undefined,
        examples:
          examples.filter((e) => e.trim()).length > 0
            ? examples.filter((e) => e.trim())
            : undefined,
        synonyms:
          synonyms.filter((s) => s.trim()).length > 0
            ? synonyms.filter((s) => s.trim())
            : undefined,
        antonyms:
          antonyms.filter((a) => a.trim()).length > 0
            ? antonyms.filter((a) => a.trim())
            : undefined,
        etymology: etymology.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      navigate({ to: "/word/$id", params: { id: wordId } })
    } catch (error) {
      console.error("Failed to save word:", error)
    } finally {
      setIsSaving(false)
    }
  }

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
          <CardHeader>
            <CardTitle>Add New Word</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEnriched ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="word">Word</Label>
                  <div className="flex gap-2">
                    <Input
                      id="word"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="Enter a word to learn..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEnrich()
                      }}
                    />
                    <Button
                      onClick={handleEnrich}
                      disabled={!word.trim() || isEnriching}
                    >
                      {isEnriching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Enrich"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {isEnriching && (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}

                {!isEnriching && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold capitalize">{word}</h2>
                      {partOfSpeech && (
                        <Badge variant="secondary">{partOfSpeech}</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="definition">
                        Definition<span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="definition"
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        placeholder="Enter the definition..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="partOfSpeech">Part of Speech</Label>
                        <Input
                          id="partOfSpeech"
                          value={partOfSpeech}
                          onChange={(e) => setPartOfSpeech(e.target.value)}
                          placeholder="noun, verb, adjective..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronunciation">Pronunciation</Label>
                        <Input
                          id="pronunciation"
                          value={pronunciation}
                          onChange={(e) => setPronunciation(e.target.value)}
                          placeholder="/ˈwɜːrd/"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Examples</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleAddExample}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      {examples.map((example, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={example}
                            onChange={(e) =>
                              handleExampleChange(index, e.target.value)
                            }
                            placeholder="Enter an example sentence..."
                            className="flex-1"
                          />
                          {examples.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExample(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Synonyms</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddSynonym}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                        {synonyms.map((synonym, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={synonym}
                              onChange={(e) =>
                                handleSynonymChange(index, e.target.value)
                              }
                              placeholder="synonym"
                              className="flex-1"
                            />
                            {synonyms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSynonym(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Antonyms</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleAddAntonym}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                        {antonyms.map((antonym, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={antonym}
                              onChange={(e) =>
                                handleAntonymChange(index, e.target.value)
                              }
                              placeholder="antonym"
                              className="flex-1"
                            />
                            {antonyms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAntonym(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="etymology">Etymology</Label>
                      <Textarea
                        id="etymology"
                        value={etymology}
                        onChange={(e) => setEtymology(e.target.value)}
                        placeholder="Origin and history of the word..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Personal notes or memory aids..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEnriched(false)
                          setDefinition("")
                          setPartOfSpeech("")
                          setPronunciation("")
                          setExamples([""])
                          setSynonyms([""])
                          setAntonyms([""])
                          setEtymology("")
                          setNotes("")
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={
                          !word.trim() || !definition.trim() || isSaving
                        }
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Word"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
