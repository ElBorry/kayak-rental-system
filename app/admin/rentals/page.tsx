"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRentals } from "@/lib/rental-context"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function RentalsPage() {
  const { rentals, kayaks } = useRentals()
  const [filter, setFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  // Apply filters
  const filteredRentals = rentals.filter((rental) => {
    const kayak = kayaks.find((k) => k.id === rental.kayakId)
    const matchesSearch = kayak?.name.toLowerCase().includes(filter.toLowerCase()) || rental.id.includes(filter)

    const matchesType = typeFilter === "all" || rental.type === typeFilter
    const matchesPayment = paymentFilter === "all" || rental.paymentMethod === paymentFilter

    return matchesSearch && matchesType && matchesPayment
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Historial de Alquileres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input placeholder="Buscar por kayak o ID" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de alquiler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="double">Doble</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kayak</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              ) : (
                filteredRentals.map((rental) => {
                  const kayak = kayaks.find((k) => k.id === rental.kayakId)

                  return (
                    <TableRow key={rental.id}>
                      <TableCell>{rental.id}</TableCell>
                      <TableCell>{kayak?.name}</TableCell>
                      <TableCell>{formatDateTime(rental.startTime)}</TableCell>
                      <TableCell>{rental.type === "simple" ? "Simple" : "Doble"}</TableCell>
                      <TableCell>{rental.paymentMethod === "cash" ? "Efectivo" : "Transferencia"}</TableCell>
                      <TableCell>{formatCurrency(rental.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rental.status === "active"
                              ? "default"
                              : rental.status === "completed"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {rental.status === "active"
                            ? "Activo"
                            : rental.status === "completed"
                              ? "Completado"
                              : "Cancelado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

