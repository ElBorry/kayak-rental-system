"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRentals } from "@/lib/rental-context"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { DatePicker } from "@/components/ui/date-picker"

export default function ReportsPage() {
  const { rentals, filterRentalsByDate } = useRentals()
  const [filteredRentals, setFilteredRentals] = useState(rentals)
  const [filterPeriod, setFilterPeriod] = useState<"day" | "week" | "month" | "custom">("month")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Aplicar filtros cuando cambian los parámetros
  useEffect(() => {
    let start = new Date()
    let end = new Date()

    if (filterPeriod === "day") {
      // Hoy
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (filterPeriod === "week") {
      // Esta semana
      const day = start.getDay()
      start.setDate(start.getDate() - day)
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + (6 - day))
      end.setHours(23, 59, 59, 999)
    } else if (filterPeriod === "month") {
      // Este mes
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
    } else if (filterPeriod === "custom") {
      // Período personalizado
      if (startDate && endDate) {
        start = startDate
        end = endDate
        end.setHours(23, 59, 59, 999)
      }
    }

    // Aplicar filtro
    if (filterPeriod === "custom" && (!startDate || !endDate)) {
      setFilteredRentals(rentals)
    } else {
      setFilteredRentals(filterRentalsByDate(start, end))
    }
  }, [rentals, filterPeriod, startDate, endDate, filterRentalsByDate])

  // Calculate statistics
  const totalRentals = filteredRentals.length
  const simpleRentals = filteredRentals.filter((r) => r.type === "simple").length
  const doubleRentals = filteredRentals.filter((r) => r.type === "double").length
  const cashPayments = filteredRentals.filter((r) => r.paymentMethod === "cash").length
  const transferPayments = filteredRentals.filter((r) => r.paymentMethod === "transfer").length

  const totalRevenue = filteredRentals.reduce((sum, rental) => sum + rental.amount, 0)
  const simpleRevenue = filteredRentals
    .filter((r) => r.type === "simple")
    .reduce((sum, rental) => sum + rental.amount, 0)
  const doubleRevenue = filteredRentals
    .filter((r) => r.type === "double")
    .reduce((sum, rental) => sum + rental.amount, 0)

  // Data for charts
  const rentalTypeData = [
    { name: "Simple", cantidad: simpleRentals, ingresos: simpleRevenue },
    { name: "Doble", cantidad: doubleRentals, ingresos: doubleRevenue },
  ]

  const paymentMethodData = [
    { name: "Efectivo", value: cashPayments },
    { name: "Transferencia", value: transferPayments },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <div className="flex items-center gap-4">
          <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diario</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensual</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {filterPeriod === "custom" && (
            <div className="flex items-center gap-2">
              <DatePicker date={startDate} setDate={setStartDate} placeholder="Fecha inicio" />
              <span>-</span>
              <DatePicker date={endDate} setDate={setEndDate} placeholder="Fecha fin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alquileres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRentals}</div>
            <p className="text-xs text-muted-foreground">
              {filterPeriod === "day"
                ? "Hoy"
                : filterPeriod === "week"
                  ? "Esta semana"
                  : filterPeriod === "month"
                    ? "Este mes"
                    : "Período seleccionado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alquileres Simples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simpleRentals}</div>
            <p className="text-xs text-muted-foreground">
              {totalRentals > 0 ? `${((simpleRentals / totalRentals) * 100).toFixed(1)}% del total` : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alquileres Dobles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doubleRentals}</div>
            <p className="text-xs text-muted-foreground">
              {totalRentals > 0 ? `${((doubleRentals / totalRentals) * 100).toFixed(1)}% del total` : "0% del total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {filterPeriod === "day"
                ? "Hoy"
                : filterPeriod === "week"
                  ? "Esta semana"
                  : filterPeriod === "month"
                    ? "Este mes"
                    : "Período seleccionado"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rentals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rentals">Alquileres</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="payment">Métodos de Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alquileres por Tipo</CardTitle>
              <CardDescription>
                Distribución de alquileres simples y dobles{" "}
                {filterPeriod === "day"
                  ? "hoy"
                  : filterPeriod === "week"
                    ? "esta semana"
                    : filterPeriod === "month"
                      ? "este mes"
                      : "en el período seleccionado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rentalTypeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" name="Cantidad" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Tipo de Alquiler</CardTitle>
              <CardDescription>
                Ingresos generados por tipo de alquiler{" "}
                {filterPeriod === "day"
                  ? "hoy"
                  : filterPeriod === "week"
                    ? "esta semana"
                    : filterPeriod === "month"
                      ? "este mes"
                      : "en el período seleccionado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rentalTypeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Distribución de métodos de pago{" "}
                {filterPeriod === "day"
                  ? "hoy"
                  : filterPeriod === "week"
                    ? "esta semana"
                    : filterPeriod === "month"
                      ? "este mes"
                      : "en el período seleccionado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentMethodData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

