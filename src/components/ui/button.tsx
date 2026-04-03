import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-mono text-[13px] uppercase tracking-[0.06em] outline-none select-none transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[var(--text-display)] text-[var(--black)] rounded-full min-h-[44px] px-6 py-3 hover:opacity-90",
        secondary: "bg-transparent border border-[var(--border-visible)] text-[var(--text-primary)] rounded-full min-h-[44px] px-6 py-3 hover:border-[var(--text-primary)]",
        outline: "bg-transparent border border-[var(--border-visible)] text-[var(--text-primary)] rounded-full min-h-[44px] px-6 py-3 hover:border-[var(--text-primary)]",
        ghost: "bg-transparent text-[var(--text-secondary)] min-h-[44px] px-4 py-2 hover:text-[var(--text-primary)]",
        destructive: "bg-transparent border border-[var(--accent)] text-[var(--accent)] rounded-full min-h-[44px] px-6 py-3 hover:bg-[var(--accent-subtle)]",
        link: "text-[var(--interactive)] underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        sm: "min-h-[36px] text-[11px] px-4 py-2",
        lg: "min-h-[48px] text-[13px] px-8 py-3",
        icon: "min-h-[44px] min-w-[44px] px-0",
        "icon-sm": "min-h-[36px] min-w-[36px] px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }