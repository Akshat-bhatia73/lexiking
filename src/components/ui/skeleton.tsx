import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-[var(--border)]", className)}
      {...props}
    />
  )
}

function LoadingText({ children = "LOADING..." }: { children?: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
      [{children}]
    </span>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 animate-[pulse_1s_ease-in-out_infinite] rounded-none bg-[var(--text-primary)]" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 animate-[pulse_1s_ease-in-out_infinite] rounded-none bg-[var(--text-primary)]" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 animate-[pulse_1s_ease-in-out_infinite] rounded-none bg-[var(--text-primary)]" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export { Skeleton, LoadingText, LoadingSpinner }