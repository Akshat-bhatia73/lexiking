import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingText } from "@/components/ui/skeleton"

export const Route = createFileRoute("/library")({
  component: Library,
})

function Library() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [filter, setFilter] = useState<"all" | "due" | "archived">("all")

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/" })
    }
  }, [isLoaded, isSignedIn, navigate])

  const words = useQuery(api.words.list, {
    search: search || undefined,
    archived: filter === "archived" ? true : false,
  })
  const dueWords = useQuery(api.words.dueToday, {})

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingText />
      </div>
    )
  }

  const isLoading = words === undefined || dueWords === undefined

  const filteredWords =
    filter === "due"
      ? dueWords
      : words?.filter((w) =>
          search
            ? w.word.toLowerCase().includes(search.toLowerCase()) ||
              w.definition.toLowerCase().includes(search.toLowerCase())
            : true
        )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            LIBRARY
          </span>
          <h1 className="mt-1 font-sans text-4xl font-medium text-[var(--text-display)]">
            Your Words
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            {(filteredWords?.length ?? 0).toLocaleString()} words in your collection
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/add" })}>
          + ADD WORD
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-disabled)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="SEARCH WORDS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="segmented-control">
            <button
              onClick={() => setFilter("all")}
              className={`segment ${filter === "all" ? "segment-active" : ""}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter("due")}
              className={`segment ${filter === "due" ? "segment-active" : ""}`}
            >
              DUE
            </button>
            <button
              onClick={() => setFilter("archived")}
              className={`segment ${filter === "archived" ? "segment-active" : ""}`}
            >
              ARCHIVED
            </button>
          </div>

          <div className="segmented-control">
            <button
              onClick={() => setView("list")}
              className={`segment ${view === "list" ? "segment-active" : ""}`}
              title="List view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setView("grid")}
              className={`segment ${view === "grid" ? "segment-active" : ""}`}
              title="Grid view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <LoadingText>LOADING...</LoadingText>
        </div>
      ) : filteredWords && filteredWords.length > 0 ? (
        view === "list" ? (
          <ListView
            words={filteredWords}
            onSelect={(id) => navigate({ to: "/word/$id", params: { id } })}
          />
        ) : (
          <GridView
            words={filteredWords}
            onSelect={(id) => navigate({ to: "/word/$id", params: { id } })}
          />
        )
      ) : (
        <div className="empty-state py-24">
          <div className="empty-state-icon">
            <svg className="h-6 w-6 text-[var(--text-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">
            {search
              ? "No words found"
              : filter === "archived"
                ? "No archived words"
                : filter === "due"
                  ? "No words due today"
                  : "Your library is empty"}
          </h3>
          <p className="empty-state-description">
            {search
              ? "Try a different search term"
              : filter === "all"
                ? "Add your first word to get started"
                : ""}
          </p>
          {filter === "all" && !search && (
            <Button className="mt-6" onClick={() => navigate({ to: "/add" })}>
              ADD YOUR FIRST WORD
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ListView({
  words,
  onSelect,
}: {
  words: Array<{
    _id: string
    word: string
    definition: string
    part_of_speech?: string
  }>
  onSelect: (id: string) => void
}) {
  return (
    <div className="divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
      {words.map((word) => (
        <button
          key={word._id}
          onClick={() => onSelect(word._id)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[var(--surface-raised)]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono font-medium capitalize text-[var(--text-display)]">
                {word.word}
              </span>
              {word.part_of_speech && (
                <span className="tag">
                  {word.part_of_speech}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
              {word.definition}
            </p>
          </div>
          <svg
            className="h-4 w-4 flex-shrink-0 text-[var(--text-disabled)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function GridView({
  words,
  onSelect,
}: {
  words: Array<{
    _id: string
    word: string
    definition: string
    part_of_speech?: string
  }>
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((word) => (
        <button
          key={word._id}
          onClick={() => onSelect(word._id)}
          className="border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-colors hover:bg-[var(--surface-raised)]"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono font-medium capitalize text-[var(--text-display)]">
              {word.word}
            </span>
            {word.part_of_speech && (
              <span className="tag">
                {word.part_of_speech}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
            {word.definition}
          </p>
        </button>
      ))}
    </div>
  )
}