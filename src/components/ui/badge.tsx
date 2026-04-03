import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "border border-[var(--border-visible)] text-[var(--text-secondary)] rounded-none",
        secondary: "border border-[var(--border-visible)] text-[var(--text-secondary)] bg-[var(--surface)] rounded-none",
        outline: "border border-[var(--border-visible)] text-[var(--text-secondary)] rounded-none",
        active: "border border-[var(--text-display)] text-[var(--text-display)] rounded-none",
        success: "border border-[var(--success)] text-[var(--success)] rounded-none",
        warning: "border border-[var(--warning)] text-[var(--warning)] rounded-none",
        error: "border border-[var(--accent)] text-[var(--accent)] rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }