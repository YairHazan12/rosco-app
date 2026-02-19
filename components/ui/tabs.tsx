"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  // Apple segmented-control base
  "inline-flex items-center justify-center rounded-[11px] p-[3px] group/tabs-list",
  {
    variants: {
      variant: {
        // Default: iOS segmented control style
        default:
          "bg-[var(--bg-grouped)] dark:bg-[rgba(118,118,128,0.24)]",
        // Line variant: underline style
        line:
          "bg-transparent rounded-none gap-1 border-b border-[var(--separator)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "relative inline-flex flex-1 items-center justify-center gap-1.5",
        "whitespace-nowrap transition-all duration-200 select-none",
        "text-[13px] font-semibold",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

        // Default variant — pill style (iOS segmented control)
        "group-data-[variant=default]/tabs-list:rounded-[9px]",
        "group-data-[variant=default]/tabs-list:px-4",
        "group-data-[variant=default]/tabs-list:py-1.5",
        "group-data-[variant=default]/tabs-list:min-h-[30px]",

        // Default — inactive
        "group-data-[variant=default]/tabs-list:text-[var(--label-tertiary)]",

        // Default — active pill
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-[var(--bg-card)]",
        "group-data-[variant=default]/tabs-list:data-[state=active]:text-[var(--label-primary)]",
        "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0.5px_1px_rgba(0,0,0,0.06)]",

        // Line variant — underline style
        "group-data-[variant=line]/tabs-list:rounded-none",
        "group-data-[variant=line]/tabs-list:px-3",
        "group-data-[variant=line]/tabs-list:py-2",
        "group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent",
        "group-data-[variant=line]/tabs-list:text-[var(--label-tertiary)]",
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-[var(--brand)]",
        "group-data-[variant=line]/tabs-list:data-[state=active]:border-[var(--brand)]",

        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ios-blue)]/50",

        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
