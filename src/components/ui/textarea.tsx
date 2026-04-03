import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-16 w-full resize-none bg-transparent border border-[var(--border-visible)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 rounded-[8px]",
        "placeholder:text-[var(--text-disabled)]",
        "focus:border-[var(--text-primary)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }