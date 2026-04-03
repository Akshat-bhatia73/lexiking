import { useAuth } from "@clerk/tanstack-react-start"
import { useAction, useMutation } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingText } from "@/components/ui/skeleton"

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingText />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-[var(--text-secondary)]">Please sign in to add words</p>
        <Button onClick={() => navigate({ to: "/" })}>GO HOME</Button>
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
    } catch (err) {
      console.error("Failed to save words:", err)
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
    } catch (err) {
      console.error("Failed to save word:", err)
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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/" })}
        className="mb-6"
      >
        ← BACK
      </Button>

      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          ADD WORD
        </span>
        <h1 className="mt-1 font-sans text-4xl font-medium text-[var(--text-display)]">
          New Word
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Enter a word and let AI enrich it with definitions, examples, and more.
        </p>
      </div>

      <div className="mb-6 segmented-control">
        <button
          onClick={() => setMode("single")}
          className={`segment ${mode === "single" ? "segment-active" : ""}`}
        >
          SINGLE WORD
        </button>
        <button
          onClick={() => setMode("extract")}
          className={`segment ${mode === "extract" ? "segment-active" : ""}`}
        >
          EXTRACT FROM TEXT
        </button>
      </div>

      {mode === "single" ? (
        <div className="space-y-6">
          {!isEnriched ? (
            <div className="border border-[var(--border-visible)] bg-[var(--surface)] p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="word">WORD</Label>
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
                        <LoadingText>ENRICHING...</LoadingText>
                      ) : (
                        "ENRICH"
                      )}
                    </Button>
                  </div>
                </div>
                {error && (
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]">
                    [ERROR: {error}]
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-2xl font-medium capitalize text-[var(--text-display)]">
                  {word}
                </h2>
                {partOfSpeech && (
                  <span className="tag">
                    {partOfSpeech}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="definition">
                  DEFINITION<span className="text-[var(--accent)]">*</span>
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
                  <Label htmlFor="partOfSpeech">PART OF SPEECH</Label>
                  <Input
                    id="partOfSpeech"
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    placeholder="noun, verb, adjective..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pronunciation">PRONUNCIATION</Label>
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
                  <Label>EXAMPLES</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddExample}>
                    + ADD
                  </Button>
                </div>
                {examples.map((example, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={example}
                      onChange={(e) => handleExampleChange(index, e.target.value)}
                      placeholder="Enter an example sentence..."
                      className="flex-1"
                    />
                    {examples.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveExample(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>SYNONYMS</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddSynonym}>
                      + ADD
                    </Button>
                  </div>
                  {synonyms.map((synonym, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={synonym}
                        onChange={(e) => handleSynonymChange(index, e.target.value)}
                        placeholder="synonym"
                        className="flex-1"
                      />
                      {synonyms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveSynonym(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>ANTONYMS</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddAntonym}>
                      + ADD
                    </Button>
                  </div>
                  {antonyms.map((antonym, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={antonym}
                        onChange={(e) => handleAntonymChange(index, e.target.value)}
                        placeholder="antonym"
                        className="flex-1"
                      />
                      {antonyms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveAntonym(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="etymology">ETYMOLOGY</Label>
                <Textarea
                  id="etymology"
                  value={etymology}
                  onChange={(e) => setEtymology(e.target.value)}
                  placeholder="Origin and history of the word..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">NOTES</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Personal notes or memory aids..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={resetForm}>
                  RESET
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!word.trim() || !definition.trim() || isSaving}
                >
                  {isSaving ? (
                    <LoadingText>SAVING...</LoadingText>
                  ) : (
                    "SAVE WORD"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-[var(--border-visible)] bg-[var(--surface)] p-6">
            <div className="space-y-4">
              <Label htmlFor="text">PASTE YOUR TEXT HERE</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste an article, essay, or any text to extract vocabulary words from..."
                rows={8}
              />
              {error && (
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent)]">
                  [ERROR: {error}]
                </p>
              )}
              <Button
                onClick={handleExtract}
                disabled={!text.trim() || isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <LoadingText>EXTRACTING...</LoadingText>
                ) : (
                  "EXTRACT VOCABULARY WORDS"
                )}
              </Button>
            </div>
          </div>

          {extractedWords.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  FOUND {extractedWords.length} WORDS
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setExtractedWords([])
                    setText("")
                  }}
                >
                  CLEAR
                </Button>
              </div>

              <div className="space-y-2">
                {extractedWords.map((w, index) => (
                  <div
                    key={index}
                    className={`border transition-colors ${
                      w.selected
                        ? "border-[var(--text-display)] bg-[var(--surface-raised)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    } p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={w.selected}
                            onChange={() => handleToggleWord(index)}
                            className="h-4 w-4"
                          />
                          <span className="font-mono font-medium capitalize text-[var(--text-display)]">
                            {w.word}
                          </span>
                          {w.part_of_speech && (
                            <span className="tag">
                              {w.part_of_speech}
                            </span>
                          )}
                        </label>
                        <p className="mt-1 ml-6 text-sm text-[var(--text-secondary)]">
                          {w.definition}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setExtractedWords(
                      extractedWords.map((w) => ({ ...w, selected: true }))
                    )
                  }
                >
                  SELECT ALL
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setExtractedWords(
                      extractedWords.map((w) => ({ ...w, selected: false }))
                    )
                  }
                >
                  DESELECT ALL
                </Button>
                <Button
                  onClick={handleSaveExtracted}
                  disabled={
                    !extractedWords.some((w) => w.selected) || isSavingExtracted
                  }
                  className="flex-1"
                >
                  {isSavingExtracted ? (
                    <LoadingText>SAVING...</LoadingText>
                  ) : (
                    `SAVE SELECTED (${extractedWords.filter((w) => w.selected).length})`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}