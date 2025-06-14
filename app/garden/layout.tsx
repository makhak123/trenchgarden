import type { ReactNode } from "react"

// Force dynamic rendering for all garden pages
export const dynamic = "force-dynamic"
export const revalidate = 0

interface GardenLayoutProps {
  children: ReactNode
}

export default function GardenLayout({ children }: GardenLayoutProps) {
  return <div className="garden-layout">{children}</div>
}
