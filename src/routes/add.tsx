import { useAuth } from "@clerk/tanstack-react-start"
import { useAction, useMutation } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ArrowLeft, FileText, Loader2, Plus, X } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/add")({
  component: AddWord,
})

function AddWord() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const saveWord = useMutation(api.words.save)
  const enrichWord = useAction(api.ai.enrichWord)
  const extractFromText = useAction(api.ai.extractFromText)

  const [mode, setMode] = useState<"single" | "extract">("single")

  // Single word state
  const [word, setWord] = useState("")
  const [isEnriching, setIsEnriching] = useState(false)
  const [isEnriched, setIsEnriched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [definition, setDefinition] = useState("")
  const [partOfSpeech, setPartOfSpeech] = useState("")
  const [pronunciation, setPronunciation] = useState("")
  const [examples, setExamples] = useState<Array<string>>([""])
  const [synonyms, setSynonyms] = useState<Array<string>>([""])
  const [antonyms, setAntonyms] = useState<Array<string>>([""])
  const [etymology, setEtymology] = useState("")
  const [notes, setNotes] = useState("")

  // Extract from text state
  const [text, setText] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedWords, setExtractedWords] = useState<
    Array<{
      word: string
      definition: string
      part_of_speech: string
      pronunciation: string
      examples: Array<string>
      selected: boolean
    }>
  >([])
  const [isSavingExtracted, setIsSavingExtracted] = useState(false)

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
    setError(null)
    try {
      const result = await enrichWord({ word: word.trim() })
      setDefinition(result.definition)
      setPartOfSpeech(result.part_of_speech)
      setPronunciation(result.pronunciation)
      setExamples(result.examples.length > 0 ? result.examples : [""])
      setSynonyms(result.synonyms.length > 0 ? result.synonyms : [""])
      setAntonyms(result.antonyms.length > 0 ? result.antonyms : [""])
      setEtymology(result.etymology)
      setIsEnriched(true)
    } catch (err) {
      console.error("Enrichment failed:", err)
      setError("Failed to enrich word. Please try again.")
    } finally {
      setIsEnriching(false)
    }
  }

  const handleExtract = async () => {
    if (!text.trim()) return
    setIsExtracting(true)
    setError(null)
    try {
      const result = await extractFromText({ text: text.trim() })
      setExtractedWords(
        result.map((w) => ({
          ...w,
          selected: true,
        }))
      )
    } catch (err) {
      console.error("Extraction failed:", err)
      setError("Failed to extract words. Please try again.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleToggleWord = (index: number) => {
    setExtractedWords(
      extractedWords.map((w, i) =>
        i === index ? { ...w, selected: !w.selected } : w
      )
    )
  }

  const handleSaveExtracted = async () => {
    const selected = extractedWords.filter((w) => w.selected)
    if (selected.length === 0) return

    setIsSavingExtracted(true)
    try {
      for (const w of selected) {
        await saveWord({
          word: w.word,
          definition: w.definition,
          part_of_speech: w.part_of_speech || undefined,
          pronunciation: w.pronunciation || undefined,
          examples: w.examples.length > 0 ? w.examples : undefined,
          source: "paste",
        })
      }
      navigate({ to: "/library" })
    } catch (error) {
      console.error("Failed to save words:", error)
      setError("Failed to save some words. Please try again.")
    } finally {
      setIsSavingExtracted(false)
    }
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

  const resetForm = () => {
    setIsEnriched(false)
    setDefinition("")
    setPartOfSpeech("")
    setPronunciation("")
    setExamples([""])
    setSynonyms([""])
    setAntonyms([""])
    setEtymology("")
    setNotes("")
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

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "single" | "extract")}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="single">Single Word</TabsTrigger>
            <TabsTrigger value="extract">
              <FileText className="mr-2 h-4 w-4" />
              Extract from Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
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
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
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
                          <h2 className="text-2xl font-bold capitalize">
                            {word}
                          </h2>
                          {partOfSpeech && (
                            <Badge variant="secondary">{partOfSpeech}</Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="definition">
                            Definition
                            <span className="text-destructive">*</span>
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
                          <Button variant="outline" onClick={resetForm}>
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
          </TabsContent>

          <TabsContent value="extract">
            <Card>
              <CardHeader>
                <CardTitle>Extract Words from Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="text">Paste your text here</Label>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste an article, essay, or any text to extract vocabulary words from..."
                    rows={8}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  onClick={handleExtract}
                  disabled={!text.trim() || isExtracting}
                  className="w-full"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Vocabulary Words"
                  )}
                </Button>

                {extractedWords.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Found {extractedWords.length} words
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExtractedWords([])
                          setText("")
                        }}
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {extractedWords.map((w, index) => (
                        <div
                          key={index}
                          className={`rounded-lg border p-4 transition-colors ${
                            w.selected ? "bg-accent" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={w.selected}
                                  onChange={() => handleToggleWord(index)}
                                  className="h-4 w-4"
                                />
                                <h4 className="font-semibold capitalize">
                                  {w.word}
                                </h4>
                                {w.part_of_speech && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {w.part_of_speech}
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {w.definition}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setExtractedWords(
                            extractedWords.map((w) => ({
                              ...w,
                              selected: true,
                            }))
                          )
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setExtractedWords(
                            extractedWords.map((w) => ({
                              ...w,
                              selected: false,
                            }))
                          )
                        }
                      >
                        Deselect All
                      </Button>
                      <Button
                        onClick={handleSaveExtracted}
                        disabled={
                          !extractedWords.some((w) => w.selected) ||
                          isSavingExtracted
                        }
                        className="flex-1"
                      >
                        {isSavingExtracted ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          `Save Selected (${extractedWords.filter((w) => w.selected).length})`
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
