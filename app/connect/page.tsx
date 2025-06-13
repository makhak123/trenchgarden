"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ConnectPage() {
  const [address, setAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleConnect = () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      toast({
        title: "Connected",
        description: "Wallet connected successfully. 23 TRENCH tokens found.",
      })
      setIsConnecting(false)
      router.push("/garden")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 text-green-400 hover:text-green-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md border-green-900/50 bg-black/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-mono text-2xl text-green-400">Connect Wallet</CardTitle>
          <CardDescription>Connect your wallet to access your Trench Garden</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-green-400">
              Wallet Address
            </Label>
            <Input
              id="address"
              placeholder="Enter your wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border-green-900/50 bg-black/50 text-green-200"
            />
          </div>

          <div className="rounded-md bg-green-900/20 p-3 text-sm text-green-300">
            <p className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Hold Trench Garden tokens to unlock rare plants and special features
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
