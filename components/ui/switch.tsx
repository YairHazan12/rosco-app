"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[var(--brand)]" : "bg-[#E2E8F0]",
          className
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-lg",
            "transition-transform duration-200 ease-in-out",
            checked ? "translate-x-[20px]" : "translate-x-[2px]"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
