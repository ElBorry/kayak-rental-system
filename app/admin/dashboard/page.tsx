"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRentals } from "@/lib/rental-context"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

export default function DashboardPage() {
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
  const cashRevenue = filteredRentals
    .filter((r) => r.paymentMethod === "cash")
    .reduce((sum, rental) => sum + rental.amount, 0)
  const transferRevenue = filteredRentals
    .filter((r) => r.paymentMethod === "transfer")
    .reduce((sum, rental) => sum + rental.amount, 0)

  // Data for charts
  const rentalTypeData = [
    { name: "Simple", value: simpleRentals },
    { name: "Doble", value: doubleRentals },
  ]

  const paymentMethodData = [
    { name: "Efectivo", value: cashPayments },
    { name: "Transferencia", value: transferPayments },
  ]

  const revenueData = [
    { name: "Efectivo", value: cashRevenue },
    { name: "Transferencia", value: transferRevenue },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(transferRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rentals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rentals">Alquileres</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Alquiler</CardTitle>
                <CardDescription>Distribución de alquileres simples y dobles</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rentalTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {rentalTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Distribución de pagos en efectivo y transferencia</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Método de Pago</CardTitle>
              <CardDescription>Distribución de ingresos por efectivo y transferencia</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
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
                  <Bar dataKey="value" name="Ingresos" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

