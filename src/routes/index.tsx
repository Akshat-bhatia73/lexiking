import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/tanstack-react-start"
import { useAuth, useUser } from "@clerk/tanstack-react-start"
import { useQuery } from "convex/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { api } from "../../convex/_generated/api"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <UserButton />
            )}
          </div>
        </header>

        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="mb-4 text-2xl font-semibold">Welcome to LexiKing</h2>
            <p className="mb-8 text-center text-muted-foreground">
              Your AI-powered vocabulary tracker with spaced repetition.
              <br />
              Sign in or create an account to get started.
            </p>
          </div>
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useUser()
  const dueToday = useQuery(api.words.dueToday, {})
  const allWords = useQuery(api.words.list, {})
  const stats = useQuery(api.reviews.stats, { days: 30 })

  const dueCount = dueToday?.length ?? 0
  const totalCount = allWords?.length ?? 0
  const retentionRate = stats?.retentionRate ?? 0

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
        </h2>
        {dueCount > 0 ? (
          <p className="text-muted-foreground">
            You have{" "}
            <span className="font-semibold text-foreground">{dueCount}</span>{" "}
            {dueCount === 1 ? "word" : "words"} due for review today.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {totalCount === 0
              ? "Start building your vocabulary by adding your first word!"
              : "No words due for review today. Great job!"}
          </p>
        )}
        {totalCount === 0 && (
          <Link to="/add">
            <Button className="mt-4">Add Your First Word</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Words Due Today</p>
          <p className="text-2xl font-bold">{dueCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Words</p>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Retention Rate (30d)</p>
          <p className="text-2xl font-bold">
            {Math.round(retentionRate * 100)}%
          </p>
        </div>
      </div>

      {allWords && allWords.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Words</h3>
          <div className="space-y-2">
            {allWords.slice(0, 5).map((word) => (
              <Link key={word._id} to="/word/$id" params={{ id: word._id }}>
                <div className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent">
                  <div>
                    <p className="font-medium">{word.word}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {word.definition}
                    </p>
                  </div>
                  {word.part_of_speech && (
                    <span className="rounded bg-muted px-2 py-1 text-xs">
                      {word.part_of_speech}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link to="/library">
            <Button variant="outline" className="mt-4 w-full">
              View All Words
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
