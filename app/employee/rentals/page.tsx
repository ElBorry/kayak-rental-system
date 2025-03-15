"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRentals } from "@/lib/rental-context"
import type { Rental } from "@/lib/types"
import { formatCurrency, formatTime, getRemainingTime, formatRemainingTime } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RentalsPage() {
  const { rentals, kayaks, completeRental } = useRentals()
  const [activeRental, setActiveRental] = useState<Rental | null>(null)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "" })
  const [remainingTimes, setRemainingTimes] = useState<Record<string, string>>({})
  const alertedRentalsRef = useRef<Set<string>>(new Set())

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, string> = {}

      rentals.forEach((rental) => {
        if (rental.status === "active") {
          const remaining = getRemainingTime(rental.endTime)
          times[rental.id] = formatRemainingTime(remaining)

          // Check if rental time is up and not already alerted
          if (remaining <= 0 && !alertedRentalsRef.current.has(rental.id) && !rental.contactInfo) {
            // Alert for expired rentals
            const kayak = kayaks.find((k) => k.id === rental.kayakId)
            alert(`¡Alerta! El tiempo del alquiler del ${kayak?.name} ha finalizado.`)

            // Mark this rental as alerted
            alertedRentalsRef.current.add(rental.id)
          }
        }
      })

      setRemainingTimes(times)
    }, 1000)

    return () => clearInterval(interval)
  }, [rentals, kayaks])

  const handleCompleteRental = (rental: Rental) => {
    setActiveRental(rental)
    setContactDialogOpen(true)
  }

  const saveContactInfo = () => {
    if (!activeRental) return

    // Update the rental with contact info and mark as completed
    completeRental(activeRental.id, {
      phone: contactInfo.phone || undefined,
      email: contactInfo.email || undefined,
    })

    setContactDialogOpen(false)
    setContactInfo({ phone: "", email: "" })
    setActiveRental(null)
  }

  const activeRentals = rentals.filter((rental) => rental.status === "active")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Alquileres Activos</h1>
        <Link href="/employee/new-rental">
          <Button>Nuevo Alquiler</Button>
        </Link>
      </div>

      {activeRentals.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No hay alquileres activos en este momento.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeRentals.map((rental) => {
            const kayak = kayaks.find((k) => k.id === rental.kayakId)
            const remainingTime = remainingTimes[rental.id] || "0:00"
            const isExpired = getRemainingTime(rental.endTime) <= 0

            return (
              <Card key={rental.id} className={isExpired ? "border-destructive" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{kayak?.name}</CardTitle>
                    <Badge variant={isExpired ? "destructive" : "default"}>{isExpired ? "Finalizado" : "Activo"}</Badge>
                  </div>
                  <CardDescription>Inicio: {formatTime(rental.startTime)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Tipo:</div>
                      <div className="font-medium">{rental.type === "simple" ? "Simple" : "Doble"}</div>
                      <div>Monto:</div>
                      <div className="font-medium">{formatCurrency(rental.amount)}</div>
                      <div>Pago:</div>
                      <div className="font-medium">
                        {rental.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={isExpired ? "text-destructive font-bold" : ""}>
                          {isExpired ? "Tiempo finalizado" : `Restante: ${remainingTime}`}
                        </span>
                      </div>
                      <Button variant="outline" onClick={() => handleCompleteRental(rental)}>
                        Finalizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Alquiler</DialogTitle>
            <DialogDescription>
              Ingrese los datos de contacto del cliente para enviarle promociones futuras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveContactInfo}>Guardar y Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

