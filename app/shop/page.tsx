"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Coins } from "lucide-react"
import { useGardenStore, getShopItems } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function ShopPage() {
  const [filter, setFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()
  const { coins, level, purchaseItem } = useGardenStore()

  const shopItems = getShopItems()

  const filteredItems = shopItems.filter((item) => {
    if (filter === "all") return true
    return item.rarity === filter
  })

  const handlePurchase = (item) => {
    if (level < item.unlockLevel) {
      toast({
        title: "Level too low",
        description: `You need to be level ${item.unlockLevel} to purchase this item`,
        variant: "destructive",
      })
      return
    }

    if (coins < item.price) {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price} coins to purchase this item`,
        variant: "destructive",
      })
      return
    }

    const success = purchaseItem(item.id)

    if (success) {
      toast({
        title: "Purchase successful",
        description: `You purchased ${item.name}`,
      })
    } else {
      toast({
        title: "Purchase failed",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-green-900/30 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <Button variant="ghost" className="text-green-400" onClick={() => router.push("/garden")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Garden
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-600 bg-green-900/20 text-green-400">
            <Coins className="mr-2 h-4 w-4" />
            {coins} Coins
          </Badge>
          <Badge variant="outline" className="border-purple-600 bg-purple-900/20 text-purple-400">
            Level {level}
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <h1 className="font-mono text-3xl font-bold text-green-400">Garden Shop</h1>
          <p className="text-sm text-green-200/70">Purchase plants and items for your garden</p>
        </div>

        <Tabs defaultValue="all" className="flex-1" onValueChange={setFilter}>
          <TabsList className="bg-green-900/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-green-700">
              All
            </TabsTrigger>
            <TabsTrigger value="common" className="data-[state=active]:bg-green-700">
              Common
            </TabsTrigger>
            <TabsTrigger value="uncommon" className="data-[state=active]:bg-green-700">
              Uncommon
            </TabsTrigger>
            <TabsTrigger value="rare" className="data-[state=active]:bg-green-700">
              Rare
            </TabsTrigger>
            <TabsTrigger value="legendary" className="data-[state=active]:bg-green-700">
              Legendary
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="flex-1 data-[state=active]:flex-1">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border-green-900/30 bg-black/40">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-green-300">{item.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`
                            ${item.rarity === "common" ? "border-gray-500 text-gray-300" : ""}
                            ${item.rarity === "uncommon" ? "border-green-500 text-green-300" : ""}
                            ${item.rarity === "rare" ? "border-blue-500 text-blue-300" : ""}
                            ${item.rarity === "legendary" ? "border-amber-500 text-amber-300" : ""}
                          `}
                        >
                          {item.rarity}
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="flex h-32 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div className={`h-16 w-16 rounded-full`} style={{ backgroundColor: item.color }} />
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Coins className="mr-1 h-4 w-4 text-amber-400" />
                          <span className="text-amber-400">{item.price}</span>
                        </div>
                        <Badge variant="outline" className="border-purple-600 text-purple-400">
                          Level {item.unlockLevel}+
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handlePurchase(item)}
                        disabled={coins < item.price || level < item.unlockLevel}
                      >
                        {coins < item.price
                          ? "Not enough coins"
                          : level < item.unlockLevel
                            ? `Unlock at level ${item.unlockLevel}`
                            : "Purchase"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
