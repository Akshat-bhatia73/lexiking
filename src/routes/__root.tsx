import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/tanstack-react-start"
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useRouteContext,
} from "@tanstack/react-router"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { BarChart3, BookOpen, LayoutGrid, Plus } from "lucide-react"
import appCss from "../styles.css?url"
import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { ConvexReactClient } from "convex/react"
import type { QueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "LexiKing - Your Personal Vocabulary Companion",
      },
      {
        name: "description",
        content:
          "Build your vocabulary with AI-powered enrichment and spaced repetition. Track, learn, and master new words effortlessly.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: ({ error }) => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LexiKing - Error</title>
      </head>
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">{error.message}</p>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: () => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LexiKing - Not Found</title>
      </head>
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Page Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The page you're looking for doesn't exist.
            </p>
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  ),
  shellComponent: Shell,
})

function Shell({ children }: { children: React.ReactNode }) {
  const context = useRouteContext({ from: Route.id })
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk
        client={context.convexClient}
        useAuth={useAuth}
      >
        <html lang="en">
          <head>
            <HeadContent />
          </head>
          <body className="bg-background text-foreground">
            <Navigation />
            <main className="min-h-svh">{children}</main>
            <Scripts />
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function NavLink({
  to,
  children,
  active,
}: {
  to: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function Navigation() {
  const { isSignedIn, isLoaded } = useAuth()
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-display text-xl font-semibold tracking-tight">
            LexiKing
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <NavLink to="/library" active={location.pathname === "/library"}>
            <span className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Library
            </span>
          </NavLink>
          <NavLink to="/analytics" active={location.pathname === "/analytics"}>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="h-8 w-8 animate-pulse bg-muted" />
          ) : !isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Get Started</Button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/add">
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Word
                </Button>
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}