"use client"

import dynamic from "next/dynamic"

export const forceDynamic = "force-dynamic"

const GardenScene = dynamic(() => import("@/components/garden-scene-safe"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
})

export default function GardenPage() {
  return (
    <div className="min-h-screen bg-black">
      <GardenScene />
    </div>
  )
}
