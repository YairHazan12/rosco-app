import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all overflow-hidden select-none tracking-[0.1px]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white",
        secondary:
          "bg-[var(--bg-grouped)] text-[var(--label-secondary)]",
        destructive:
          "bg-[rgba(255,59,48,0.12)] text-[var(--ios-red)]",
        outline:
          "border border-[var(--separator)] text-[var(--label-secondary)] bg-transparent",
        ghost:
          "text-[var(--label-secondary)] hover:bg-[var(--bg-grouped)]",
        link:
          "text-[var(--ios-blue)] underline-offset-4 hover:underline",
        pending:
          "bg-[rgba(255,149,0,0.12)] text-[#B25000] dark:text-[#FF9F0A] dark:bg-[rgba(255,149,0,0.2)]",
        progress:
          "bg-[rgba(0,122,255,0.12)] text-[var(--ios-blue)] dark:bg-[rgba(0,122,255,0.2)]",
        success:
          "bg-[rgba(52,199,89,0.12)] text-[#248A3D] dark:text-[#30D158] dark:bg-[rgba(52,199,89,0.2)]",
        blue:
          "bg-[rgba(0,122,255,0.12)] text-[var(--ios-blue)] dark:bg-[rgba(0,122,255,0.2)]",
        purple:
          "bg-[rgba(175,82,222,0.12)] text-[var(--ios-purple)] dark:bg-[rgba(175,82,222,0.2)]",
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
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
