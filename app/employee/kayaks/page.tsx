"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRentals } from "@/lib/rental-context"

export default function KayaksPage() {
  const { kayaks } = useRentals()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Estado de Kayaks</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kayaks.map((kayak) => (
          <Card key={kayak.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{kayak.name}</CardTitle>
                <Badge variant={kayak.available ? "default" : "secondary"}>
                  {kayak.available ? "Disponible" : "En uso"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">{kayak.isStandUpPaddle ? "Stand Up Paddle" : "Kayak"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

