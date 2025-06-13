"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function VisitPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleVisit = (e) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to visit",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would check if the user exists and redirect to their garden
    // For now, we'll just show a toast message
    toast({
      title: "Coming Soon",
      description: `Visiting ${username}'s garden will be available in a future update`,
    })
  }

  // Example featured gardens
  const featuredGardens = [
    { username: "trenchmaster", plants: 24, level: 8 },
    { username: "gardenking", plants: 18, level: 6 },
    { username: "plantlover", plants: 15, level: 5 },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex items-center justify-between border-b border-green-900/30 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <Link href="/garden" className="flex items-center gap-2 text-green-400">
          <ArrowLeft className="h-4 w-4" />
          Back to Garden
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center p-4">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-bold text-green-400">Visit Gardens</h1>
          <p className="text-sm text-green-200/70">Explore other users' Trench Gardens</p>
        </div>

        <Card className="w-full max-w-md border-green-900/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-green-300">Find a Garden</CardTitle>
            <CardDescription>Enter a username to visit their garden</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVisit} className="flex gap-2">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-green-900/50 bg-black/50 text-green-200"
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 w-full max-w-md">
          <h2 className="mb-4 font-mono text-xl font-bold text-green-400">Featured Gardens</h2>
          <div className="space-y-4">
            {featuredGardens.map((garden) => (
              <Card key={garden.username} className="border-green-900/30 bg-black/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="text-lg font-medium text-green-300">{garden.username}</h3>
                    <p className="text-sm text-green-200/70">
                      {garden.plants} plants • Level {garden.level}
                    </p>
                  </div>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: `Visiting ${garden.username}'s garden will be available in a future update`,
                      })
                    }}
                  >
                    Visit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
