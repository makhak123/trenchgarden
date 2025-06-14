"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ShoppingBag, Users, RotateCcw, RotateCw, Coins, Leaf, Settings, Info, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGardenStore } from "@/lib/store"
import { CustomTooltip } from "@/components/ui/custom-tooltip"
import { MotionDiv, SafeAnimatePresence } from "@/components/motion-wrapper"

interface EnhancedUIProps {
  selectedPlantType: string | null
  onRotatePlant: (direction: "clockwise" | "counterclockwise") => void
}

export default function EnhancedUI({ selectedPlantType, onRotatePlant }: EnhancedUIProps) {
  const router = useRouter()
  const { username, coins, level, experience } = useGardenStore()
  const [showInstructions, setShowInstructions] = useState(false)

  const experienceToNextLevel = level * 100
  const experiencePercentage = (experience / experienceToNextLevel) * 100

  // Handle close instructions with proper event handling
  const handleCloseInstructions = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowInstructions(false)
  }

  return (
    <>
      {/* Minimalist Top Bar */}
      <MotionDiv
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="absolute top-4 left-4 right-4 z-20"
      >
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <MotionDiv
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-green-500/20"
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold text-green-400">TRENCH GARDEN</h1>
            </div>
          </MotionDiv>

          {/* Center - User Stats (Compact) */}
          <MotionDiv
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-green-500/20"
          >
            <div className="text-center">
              <p className="text-xs font-medium text-green-400">{username}</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-purple-500/50 bg-purple-900/20 text-purple-300 text-xs px-2 py-0"
                >
                  Lv.{level}
                </Badge>
                <div className="w-16">
                  <Progress
                    value={experiencePercentage}
                    className="h-1 bg-purple-900/30"
                    indicatorClassName="bg-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-green-500/30" />

            <Badge className="bg-amber-600/20 border-amber-500/50 text-amber-300 px-2 py-1 text-xs">
              <Coins className="mr-1 h-3 w-3" />
              {coins.toLocaleString()}
            </Badge>
          </MotionDiv>

          {/* Right - Action buttons */}
          <div className="flex items-center gap-2">
            <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CustomTooltip content="Visit other gardens">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 backdrop-blur-xl rounded-xl"
                  onClick={() => router.push("/visit")}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </CustomTooltip>
            </MotionDiv>

            <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CustomTooltip content="Shop for new plants">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg rounded-xl backdrop-blur-xl"
                  onClick={() => router.push("/shop")}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </CustomTooltip>
            </MotionDiv>

            <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CustomTooltip content="Help & Settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-500/50 bg-gray-900/20 text-gray-400 hover:bg-gray-800/30 backdrop-blur-xl rounded-xl"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </CustomTooltip>
            </MotionDiv>
          </div>
        </div>
      </MotionDiv>

      {/* Plant Rotation Controls - Only show when plant selected */}
      <SafeAnimatePresence>
        {selectedPlantType && (
          <MotionDiv
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute bottom-32 left-4 z-20"
          >
            <Card className="border-green-500/20 bg-black/60 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-green-400 mr-2">Rotate:</p>
                  <MotionDiv whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <CustomTooltip content="Rotate left">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-green-500/50 bg-green-900/20 text-green-400 hover:bg-green-800/30 h-8 w-8 rounded-xl"
                        onClick={() => onRotatePlant("counterclockwise")}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </CustomTooltip>
                  </MotionDiv>
                  <MotionDiv whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <CustomTooltip content="Rotate right">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-green-500/50 bg-green-900/20 text-green-400 hover:bg-green-800/30 h-8 w-8 rounded-xl"
                        onClick={() => onRotatePlant("clockwise")}
                      >
                        <RotateCw className="h-3 w-3" />
                      </Button>
                    </CustomTooltip>
                  </MotionDiv>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )}
      </SafeAnimatePresence>

      {/* Selected Plant Indicator - Floating at top center */}
      <SafeAnimatePresence>
        {selectedPlantType && (
          <MotionDiv
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
          >
            <Card className="border-green-500/30 bg-black/70 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-green-400/30 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">
                      {selectedPlantType.charAt(0).toUpperCase() + selectedPlantType.slice(1)} Selected
                    </p>
                    <p className="text-xs text-green-300/70">Click in garden to place</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )}
      </SafeAnimatePresence>

      {/* Instructions Panel - Slide in from right - FIXED CLOSE BUTTON */}
      <SafeAnimatePresence>
        {showInstructions && (
          <MotionDiv
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute top-24 right-4 z-30 max-w-xs"
          >
            <Card className="border-green-500/20 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-green-400" />
                    <h3 className="font-medium text-green-400">Controls</h3>
                  </div>
                  {/* FIXED: Proper button with event handling */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400/70 hover:text-green-400 transition-colors"
                    onClick={handleCloseInstructions}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs text-green-300/90">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Select plants from inventory (1-9 keys)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Click in dirt to place plants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Drag to look around, scroll to zoom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Click plants to select them</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        )}
      </SafeAnimatePresence>
    </>
  )
}
