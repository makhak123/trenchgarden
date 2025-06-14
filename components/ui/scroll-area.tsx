"use client"

import * as React from "react"
import { CustomScrollArea, CustomScrollBar } from "./custom-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof CustomScrollArea>,
  React.ComponentPropsWithoutRef<typeof CustomScrollArea>
>(({ className, children, ...props }, ref) => (
  <CustomScrollArea ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    {children}
  </CustomScrollArea>
))
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof CustomScrollBar>,
  React.ComponentPropsWithoutRef<typeof CustomScrollBar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <CustomScrollBar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  />
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
