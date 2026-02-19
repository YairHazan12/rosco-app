import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none select-none active:scale-[0.97] active:opacity-80",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-[10px] shadow-sm hover:brightness-105 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        destructive:
          "rounded-[10px] shadow-sm focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-1",
        outline:
          "border border-[rgba(60,60,67,0.18)] bg-white/80 text-[var(--label-primary)] rounded-[10px] hover:bg-[var(--bg-primary)] dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(84,84,88,0.4)] dark:text-white shadow-sm",
        secondary:
          "bg-[var(--bg-grouped)] text-[var(--label-primary)] rounded-[10px] hover:bg-[var(--separator)] shadow-sm",
        ghost:
          "text-[var(--label-primary)] rounded-[10px] hover:bg-[var(--bg-grouped)]",
        link: "text-primary underline-offset-4 hover:underline",
        ios:
          "bg-[var(--ios-blue)] text-white rounded-[12px] shadow-sm hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--ios-blue)]/50 focus-visible:ring-offset-1",
        "ios-brand":
          "bg-[var(--brand)] text-white rounded-[12px] shadow-sm hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50 focus-visible:ring-offset-1",
        "ios-success":
          "bg-[var(--ios-green)] text-white rounded-[12px] shadow-sm hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--ios-green)]/50 focus-visible:ring-offset-1",
        "ios-danger":
          "bg-[var(--ios-red)] text-white rounded-[12px] shadow-sm hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--ios-red)]/50 focus-visible:ring-offset-1",
      },
      size: {
        default: "h-11 px-5 py-2 text-[15px]",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-9 rounded-[10px] gap-1.5 px-3.5 text-[14px]",
        lg: "h-14 rounded-[14px] px-8 text-[17px]",
        icon: "size-11 rounded-[10px]",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-9 rounded-[10px]",
        "icon-lg": "size-14 rounded-[14px]",
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
