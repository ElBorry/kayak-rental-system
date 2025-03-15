"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRentals } from "@/lib/rental-context"
import { formatCurrency } from "@/lib/utils"

export default function NewRentalPage() {
  const router = useRouter()
  const { getAvailableKayaks, addRental } = useRentals()
  const [rentalType, setRentalType] = useState<"simple" | "double">("simple")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [selectedKayakId, setSelectedKayakId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get available kayaks
  const availableKayaks = getAvailableKayaks()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedKayakId) {
      alert("Por favor selecciona un kayak")
      return
    }

    setIsSubmitting(true)

    // Create a new rental
    const newRental = {
      kayakId: Number.parseInt(selectedKayakId),
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      type: rentalType,
      paymentMethod: paymentMethod,
      amount: rentalType === "simple" ? 6000 : 8000,
      status: "active" as const,
    }

    // Add the new rental
    addRental(newRental)

    // Navigate back to the rentals page
    router.push("/employee/rentals")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Nuevo Alquiler</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Alquiler</CardTitle>
            <CardDescription>Registra un nuevo alquiler de kayak. La duración es de 30 minutos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Alquiler</Label>
              <RadioGroup
                value={rentalType}
                onValueChange={(value) => setRentalType(value as "simple" | "double")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="flex justify-between w-full">
                    <span>Alquiler Simple</span>
                    <span>{formatCurrency(6000)}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="double" id="double" />
                  <Label htmlFor="double" className="flex justify-between w-full">
                    <span>Alquiler Doble</span>
                    <span>{formatCurrency(8000)}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pago</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as "cash" | "transfer")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer">Transferencia Bancaria</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kayak">Seleccionar Kayak</Label>
              <Select value={selectedKayakId} onValueChange={setSelectedKayakId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un kayak" />
                </SelectTrigger>
                <SelectContent>
                  {availableKayaks.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay kayaks disponibles
                    </SelectItem>
                  ) : (
                    availableKayaks.map((kayak) => (
                      <SelectItem key={kayak.id} value={kayak.id.toString()}>
                        {kayak.name} {kayak.isStandUpPaddle ? "(Stand Up Paddle)" : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/employee/rentals")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedKayakId}>
              {isSubmitting ? "Registrando..." : "Registrar Alquiler"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

