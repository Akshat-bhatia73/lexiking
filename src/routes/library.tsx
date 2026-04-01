import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Archive, LayoutGrid, List, Plus, Search } from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/library")({
  component: Library,
})

function Library() {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [filter, setFilter] = useState<"all" | "due" | "archived">("all")

  const words = useQuery(api.words.list, {
    search: search || undefined,
    archived: filter === "archived" ? true : false,
  })
  const dueWords = useQuery(api.words.dueToday, {})

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
        <p className="text-muted-foreground">Please sign in to view your library</p>
        <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
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
          <h1 className="font-display text-3xl font-bold">Library</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredWords?.length ?? 0} words in your collection
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/add" })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Word
        </Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-border">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("due")}
              className={`border-x border-border px-3 py-1.5 text-sm transition-colors ${
                filter === "due"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              Due
            </button>
            <button
              onClick={() => setFilter("archived")}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                filter === "archived"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <Archive className="h-3 w-3" />
              Archived
            </button>
          </div>

          <div className="flex border border-border">
            <button
              onClick={() => setView("list")}
              className={`px-2 py-1.5 transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`border-l border-border px-2 py-1.5 transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border bg-card p-4">
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          ))}
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center border border-border bg-secondary">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">
            {search
              ? "No words found"
              : filter === "archived"
                ? "No archived words"
                : filter === "due"
                  ? "No words due today"
                  : "Your library is empty"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "Try a different search term"
              : filter === "all"
                ? "Add your first word to get started"
                : ""}
          </p>
          {filter === "all" && !search && (
            <Button className="mt-6" onClick={() => navigate({ to: "/add" })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Word
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
    <div className="divide-y divide-border border border-border bg-card">
      {words.map((word) => (
        <button
          key={word._id}
          onClick={() => onSelect(word._id)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-medium capitalize">
                {word.word}
              </span>
              {word.part_of_speech && (
                <span className="border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                  {word.part_of_speech}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {word.definition}
            </p>
          </div>
          <svg
            className="h-4 w-4 flex-shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
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
          className="border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="font-display font-medium capitalize">
              {word.word}
            </span>
            {word.part_of_speech && (
              <span className="border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                {word.part_of_speech}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {word.definition}
          </p>
        </button>
      ))}
    </div>
  )
}