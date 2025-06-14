"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportRef?: React.RefObject<HTMLDivElement>
}

const CustomScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, viewportRef, ...props }, ref) => {
    const internalViewportRef = React.useRef<HTMLDivElement>(null)
    const actualViewportRef = viewportRef || internalViewportRef

    return (
      <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
        <div
          ref={actualViewportRef}
          className="h-full w-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
        >
          {children}
        </div>
      </div>
    )
  },
)
CustomScrollArea.displayName = "CustomScrollArea"

const CustomScrollAreaViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("h-full w-full overflow-auto", className)} {...props}>
      {children}
    </div>
  ),
)
CustomScrollAreaViewport.displayName = "CustomScrollAreaViewport"

const CustomScrollAreaScrollbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  />
))
CustomScrollAreaScrollbar.displayName = "CustomScrollAreaScrollbar"

const CustomScrollAreaThumb = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex-1 rounded-full bg-border", className)} {...props} />
  ),
)
CustomScrollAreaThumb.displayName = "CustomScrollAreaThumb"

const CustomScrollAreaCorner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("bg-blackA6", className)} {...props} />,
)
CustomScrollAreaCorner.displayName = "CustomScrollAreaCorner"

const CustomScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  />
))
CustomScrollBar.displayName = "CustomScrollBar"

export {
  CustomScrollArea,
  CustomScrollAreaViewport,
  CustomScrollAreaScrollbar,
  CustomScrollAreaThumb,
  CustomScrollAreaCorner,
  CustomScrollBar,
}
