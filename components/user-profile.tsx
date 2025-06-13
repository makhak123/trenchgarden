"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Leaf, Trophy, Clock, Coins, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGardenStore } from "@/lib/store"

export default function UserProfile() {
  const { toast } = useToast()
  const { username, coins, level, experience, plants, addCoins, gainExperience } = useGardenStore()

  const experienceToNextLevel = level * 100
  const experiencePercentage = (experience / experienceToNextLevel) * 100

  const handleClaim = () => {
    addCoins(25)
    gainExperience(10)

    toast({
      title: "Claimed!",
      description: "You've claimed your daily rewards: 25 coins and 10 XP",
    })
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="font-mono text-2xl font-bold text-green-400">User Profile</h2>
        <p className="text-sm text-green-200/70">Your Trench Garden stats and achievements</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-4">
          {/* User Info */}
          <Card className="border-green-900/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <User className="h-5 w-5" />
                User Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-400">{username}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-600 bg-purple-900/20 text-purple-400">
                      Level {level}
                    </Badge>
                    <Badge variant="outline" className="border-green-600 bg-green-900/20 text-green-400">
                      {plants.length} Plants
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-green-200/70">Experience</span>
                  <span className="text-xs font-medium text-green-400">
                    {experience}/{experienceToNextLevel} XP
                  </span>
                </div>
                <Progress
                  value={experiencePercentage}
                  className="h-2 bg-green-900/20"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Token Balance */}
          <Card className="border-green-900/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Coins className="h-5 w-5" />
                Token Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-400">{coins}</p>
                  <p className="text-sm text-green-200/70">Garden Coins</p>
                </div>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-900/20"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "This feature will be available in the future",
                    })
                  }}
                >
                  Get More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Garden Stats */}
          <Card className="border-green-900/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Leaf className="h-5 w-5" />
                Garden Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-green-900/10 p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{plants.length}</p>
                  <p className="text-xs text-green-200/70">Plants Grown</p>
                </div>
                <div className="rounded-md bg-green-900/10 p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">0</p>
                  <p className="text-xs text-green-200/70">Plants Harvested</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-green-900/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md bg-green-900/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-700 p-2">
                      <Leaf className="h-4 w-4 text-green-100" />
                    </div>
                    <div>
                      <p className="font-medium text-green-300">First Plant</p>
                      <p className="text-xs text-green-200/70">Plant your first Trench Garden plant</p>
                    </div>
                  </div>
                  <Badge className={plants.length > 0 ? "bg-green-600" : "bg-gray-600"}>
                    {plants.length > 0 ? "Completed" : "Incomplete"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-md bg-green-900/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gray-700 p-2">
                      <Trophy className="h-4 w-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-green-300">Collector</p>
                      <p className="text-xs text-green-200/70">Collect 5 different plant types</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    {new Set(plants.map((p) => p.type)).size}/5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Rewards */}
          <Card className="border-green-900/30 bg-black/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Clock className="h-5 w-5" />
                Daily Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-300">Daily Coin Bonus</p>
                  <p className="text-xs text-green-200/70">Claim 25 Garden Coins daily</p>
                </div>
                <Button onClick={handleClaim} className="bg-green-600 hover:bg-green-700">
                  Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
