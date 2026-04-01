import { useAuth } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import {
  Archive,
  ArrowLeft,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react"
import { api } from "../../convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Please sign in to view your library
        </p>
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
    <div className="min-h-svh p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => navigate({ to: "/add" })} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Word
          </Button>
        </div>

        <h1 className="mb-6 text-3xl font-bold">Library</h1>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search words..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="due">Due Today</TabsTrigger>
                <TabsTrigger value="archived">
                  <Archive className="mr-1 h-3 w-3" />
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center rounded-md border">
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              {search
                ? "No words found matching your search"
                : filter === "archived"
                  ? "No archived words"
                  : filter === "due"
                    ? "No words due for review today"
                    : "No words in your library yet"}
            </p>
            {filter === "all" && !search && (
              <Button onClick={() => navigate({ to: "/add" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Word
              </Button>
            )}
          </div>
        )}
      </div>
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
    <div className="space-y-2">
      {words.map((word) => (
        <Card
          key={word._id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => onSelect(word._id)}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold capitalize">{word.word}</h3>
                {word.part_of_speech && (
                  <Badge variant="secondary" className="text-xs">
                    {word.part_of_speech}
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {word.definition}
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </CardContent>
        </Card>
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
        <Card
          key={word._id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => onSelect(word._id)}
        >
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold capitalize">{word.word}</h3>
              {word.part_of_speech && (
                <Badge variant="secondary" className="text-xs">
                  {word.part_of_speech}
                </Badge>
              )}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {word.definition}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
