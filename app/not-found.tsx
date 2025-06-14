import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Leaf className="mx-auto h-16 w-16 text-green-400" />
        </div>

        <h1 className="mb-4 text-4xl font-bold text-green-400">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-green-300">Page Not Found</h2>

        <p className="mb-6 text-green-200">
          The page you're looking for doesn't exist. Let's get you back to your garden.
        </p>

        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
