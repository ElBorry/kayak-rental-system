"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Kayak, Rental } from "@/lib/types"
import { kayaks as initialKayaksData } from "@/lib/data"

type RentalContextType = {
  rentals: Rental[]
  kayaks: Kayak[]
  addRental: (rental: Omit<Rental, "id">) => Promise<void>
  completeRental: (id: string, contactInfo?: { phone?: string; email?: string }) => Promise<void>
  getAvailableKayaks: () => Kayak[]
  filterRentalsByDate: (startDate: Date, endDate: Date) => Rental[]
  isLoading: boolean
}

const RentalContext = createContext<RentalContextType | undefined>(undefined)

export function RentalProvider({ children }: { children: ReactNode }) {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [kayaks, setKayaks] = useState<Kayak[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Cargar kayaks
        const kayaksResponse = await fetch("/api/kayaks")
        if (kayaksResponse.ok) {
          const kayaksData = await kayaksResponse.json()
          setKayaks(kayaksData)
        } else {
          console.error("Error al cargar kayaks:", await kayaksResponse.text())
          // Usar kayaks iniciales como fallback
          setKayaks(initialKayaksData)
        }

        // Cargar alquileres
        const rentalsResponse = await fetch("/api/rentals")
        if (rentalsResponse.ok) {
          const rentalsData = await rentalsResponse.json()

          // Convertir strings de fecha a objetos Date
          const formattedRentals = rentalsData.map((rental: any) => ({
            ...rental,
            startTime: new Date(rental.startTime),
            endTime: new Date(rental.endTime),
            id: rental._id ? rental._id.toString() : rental.id,
          }))

          setRentals(formattedRentals)
        } else {
          console.error("Error al cargar rentals:", await rentalsResponse.text())
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        // Usar kayaks iniciales como fallback
        setKayaks(initialKayaksData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Solo se ejecuta una vez al montar el componente

  // Calcular kayaks disponibles cuando cambian los alquileres
  const getAvailableKayaks = () => {
    const activeRentalKayakIds = rentals.filter((rental) => rental.status === "active").map((rental) => rental.kayakId)

    return kayaks.map((kayak) => ({
      ...kayak,
      available: !activeRentalKayakIds.includes(kayak.id),
    }))
  }

  const addRental = async (rentalData: Omit<Rental, "id">) => {
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error al crear el alquiler:", errorText)
        throw new Error("Error al crear el alquiler")
      }

      const data = await response.json()

      // Agregar el nuevo alquiler al estado
      const newRental: Rental = {
        id: data.rentalId,
        ...rentalData,
      }

      setRentals((prevRentals) => [...prevRentals, newRental])
    } catch (error) {
      console.error("Error al agregar alquiler:", error)
      throw error
    }
  }

  const completeRental = async (id: string, contactInfo?: { phone?: string; email?: string }) => {
    try {
      const response = await fetch(`/api/rentals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          contactInfo,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error al completar el alquiler:", errorText)
        throw new Error("Error al completar el alquiler")
      }

      // Actualizar el estado local
      setRentals((prevRentals) =>
        prevRentals.map((rental) => {
          if (rental.id === id) {
            return {
              ...rental,
              status: "completed" as const,
              contactInfo: contactInfo || rental.contactInfo,
            }
          }
          return rental
        }),
      )
    } catch (error) {
      console.error("Error al completar alquiler:", error)
      throw error
    }
  }

  // Función para filtrar alquileres por fecha
  const filterRentalsByDate = (startDate: Date, endDate: Date) => {
    return rentals.filter((rental) => {
      const rentalDate = new Date(rental.startTime)
      return rentalDate >= startDate && rentalDate <= endDate
    })
  }

  // Obtener kayaks disponibles para el valor de retorno
  const availableKayaks = getAvailableKayaks()

  return (
    <RentalContext.Provider
      value={{
        rentals,
        kayaks: availableKayaks,
        addRental,
        completeRental,
        getAvailableKayaks: () => availableKayaks,
        filterRentalsByDate,
        isLoading,
      }}
    >
      {children}
    </RentalContext.Provider>
  )
}

export function useRentals() {
  const context = useContext(RentalContext)
  if (context === undefined) {
    throw new Error("useRentals must be used within a RentalProvider")
  }
  return context
}

