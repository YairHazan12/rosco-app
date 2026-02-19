import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base layout
        "w-full min-w-0 px-3.5 py-3",
        // Typography
        "text-[16px] text-[var(--label-primary)]",
        "placeholder:text-[var(--label-quaternary)]",
        // Appearance — Apple-style
        "rounded-[10px] border border-[var(--border)]",
        "bg-white dark:bg-[rgba(255,255,255,0.06)]",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        // Sizing
        "min-h-[80px] field-sizing-content",
        // Transitions
        "transition-[border-color,box-shadow] duration-150 outline-none",
        // Focus
        "focus:border-[var(--ios-blue)] focus:ring-[3px] focus:ring-[var(--ios-blue)]/20",
        // Invalid
        "aria-invalid:border-[var(--ios-red)] aria-invalid:ring-[3px] aria-invalid:ring-[var(--ios-red)]/20",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Resize
        "resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
