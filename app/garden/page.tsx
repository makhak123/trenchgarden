export const dynamic = "force-dynamic"

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
