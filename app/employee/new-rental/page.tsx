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
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewRentalPage() {
  const router = useRouter()
  const { getAvailableKayaks, addRental } = useRentals()
  const [rentalType, setRentalType] = useState<"simple" | "double">("simple")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [selectedKayakId, setSelectedKayakId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duration, setDuration] = useState<"30" | "60" | "90" | "120">("30")
  const [error, setError] = useState<string | null>(null)

  // Get available kayaks
  const availableKayaks = getAvailableKayaks()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedKayakId) {
      setError("Por favor selecciona un kayak")
      return
    }

    setIsSubmitting(true)

    try {
      // Calcular precio según duración y tipo
      const basePrice = rentalType === "simple" ? 6000 : 8000
      let multiplier = 1

      if (duration === "60") multiplier = 1.8
      else if (duration === "90") multiplier = 2.5
      else if (duration === "120") multiplier = 3

      const finalPrice = Math.round(basePrice * multiplier)

      // Create a new rental
      const newRental = {
        kayakId: Number.parseInt(selectedKayakId),
        startTime: new Date(),
        endTime: new Date(Date.now() + Number.parseInt(duration) * 60 * 1000), // Convert minutes to milliseconds
        type: rentalType,
        paymentMethod: paymentMethod,
        amount: finalPrice,
        status: "active" as const,
      }

      // Add the new rental
      await addRental(newRental)

      // Navigate back to the rentals page
      router.push("/employee/rentals")
    } catch (err) {
      console.error("Error al crear alquiler:", err)
      setError("Ocurrió un error al crear el alquiler. Por favor, intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Nuevo Alquiler</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Alquiler</CardTitle>
            <CardDescription>Registra un nuevo alquiler de kayak.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              <Label>Duración</Label>
              <RadioGroup
                value={duration}
                onValueChange={(value) => setDuration(value as "30" | "60" | "90" | "120")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="duration-30" />
                  <Label htmlFor="duration-30">30 minutos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60" id="duration-60" />
                  <Label htmlFor="duration-60">1 hora</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="90" id="duration-90" />
                  <Label htmlFor="duration-90">1 hora 30 minutos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="120" id="duration-120" />
                  <Label htmlFor="duration-120">2 horas</Label>
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

            <div className="p-4 border rounded-md bg-muted/50">
              <div className="font-medium">
                Precio estimado:{" "}
                {formatCurrency(
                  rentalType === "simple"
                    ? duration === "30"
                      ? 6000
                      : duration === "60"
                        ? 10800
                        : duration === "90"
                          ? 15000
                          : 18000
                    : duration === "30"
                      ? 8000
                      : duration === "60"
                        ? 14400
                        : duration === "90"
                          ? 20000
                          : 24000,
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Duración:{" "}
                {duration === "30"
                  ? "30 minutos"
                  : duration === "60"
                    ? "1 hora"
                    : duration === "90"
                      ? "1 hora 30 minutos"
                      : "2 horas"}
              </div>
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

