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
import appCss from "../styles.css?url"
import type { ConvexQueryClient } from "@convex-dev/react-query"
import type { ConvexReactClient } from "convex/react"
import type { QueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ThemeProvider, ThemeToggle } from "@/lib/theme"

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
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Doto:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LexiKing - Error</title>
      </head>
      <body className="bg-[var(--black)] text-[var(--text-primary)]">
        <main className="flex min-h-screen items-center justify-center">
          <div className="px-6 text-center">
            <h1 className="font-sans text-2xl font-medium text-[var(--text-display)]">
              ERROR
            </h1>
            <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
              {error.message}
            </p>
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
      <body className="bg-[var(--black)] text-[var(--text-primary)]">
        <main className="flex min-h-screen items-center justify-center">
          <div className="px-6 text-center">
            <h1 className="font-sans text-2xl font-medium text-[var(--text-display)]">
              NOT FOUND
            </h1>
            <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] uppercase">
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
      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>
        <ThemeProvider>
          <html lang="en">
            <head>
              <HeadContent />
            </head>
            <body className="bg-[var(--black)] text-[var(--text-primary)]">
              <Navigation />
              <main className="min-h-[calc(100vh-64px)]">{children}</main>
              <Scripts />
            </body>
          </html>
        </ThemeProvider>
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
      className={`font-mono text-[11px] tracking-[0.08em] uppercase transition-colors duration-150 ${
        active
          ? "text-[var(--text-display)]"
          : "text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"
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
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--black)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--text-display)] uppercase">
            LEXIKING
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {isSignedIn && (
            <>
              <NavLink to="/library" active={location.pathname === "/library"}>
                LIBRARY
              </NavLink>
              <NavLink
                to="/analytics"
                active={location.pathname === "/analytics"}
              >
                ANALYTICS
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoaded ? (
            <div className="h-8 w-8 animate-pulse bg-[var(--border)]" />
          ) : !isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  SIGN IN
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">GET STARTED</Button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/add">
                <Button size="sm">+ ADD WORD</Button>
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
