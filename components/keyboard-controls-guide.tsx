"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function KeyboardControlsGuide() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 bg-black/80 p-4 rounded-lg text-white max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Keyboard Controls</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">W</span>
          <span className="ml-2">Move forward</span>
        </div>
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">S</span>
          <span className="ml-2">Move backward</span>
        </div>
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">A</span>
          <span className="ml-2">Move left</span>
        </div>
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">D</span>
          <span className="ml-2">Move right</span>
        </div>
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">Shift</span>
          <span className="ml-2">Run</span>
        </div>
        <div>
          <span className="bg-gray-700 px-2 py-1 rounded">1-9</span>
          <span className="ml-2">Select inventory slot</span>
        </div>
        <div className="col-span-2">
          <span className="bg-gray-700 px-2 py-1 rounded">Click</span>
          <span className="ml-2">on selected plant to deselect it</span>
        </div>
      </div>
    </div>
  )
}
