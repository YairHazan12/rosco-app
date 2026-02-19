import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base layout & sizing
        "w-full min-w-0 h-11 px-3.5 py-2",
        // Typography — iOS 16pt body size
        "text-[16px] text-[var(--label-primary)]",
        "placeholder:text-[var(--label-quaternary)]",
        // Appearance
        "rounded-[10px] border border-[var(--border)]",
        "bg-white dark:bg-[rgba(255,255,255,0.06)]",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        // Transitions
        "transition-[border-color,box-shadow] duration-150 outline-none",
        // Focus — iOS blue glow ring
        "focus:border-[var(--ios-blue)] focus:ring-[3px] focus:ring-[var(--ios-blue)]/20",
        // States
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[var(--ios-red)] aria-invalid:ring-[3px] aria-invalid:ring-[var(--ios-red)]/20",
        // File input styling
        "file:text-[var(--label-primary)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
