"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Kayak, Rental } from "@/lib/types"
import { kayaks as initialKayaks } from "@/lib/data"

type RentalContextType = {
  rentals: Rental[]
  kayaks: Kayak[]
  addRental: (rental: Omit<Rental, "id">) => void
  completeRental: (id: string, contactInfo?: { phone?: string; email?: string }) => void
  getAvailableKayaks: () => Kayak[]
  filterRentalsByDate: (startDate: Date, endDate: Date) => Rental[]
}

const RentalContext = createContext<RentalContextType | undefined>(undefined)

export function RentalProvider({ children }: { children: ReactNode }) {
  // Iniciar sin alquileres predefinidos
  const [rentals, setRentals] = useState<Rental[]>([])
  const [kayaks, setKayaks] = useState<Kayak[]>(initialKayaks)
  const [alertedRentals, setAlertedRentals] = useState<Set<string>>(new Set())

  // Update kayak availability based on active rentals
  useEffect(() => {
    const activeRentalKayakIds = rentals.filter((rental) => rental.status === "active").map((rental) => rental.kayakId)

    const updatedKayaks = initialKayaks.map((kayak) => ({
      ...kayak,
      available: !activeRentalKayakIds.includes(kayak.id),
    }))

    setKayaks(updatedKayaks)
  }, [rentals])

  const addRental = (rentalData: Omit<Rental, "id">) => {
    const newId = `${Date.now()}`
    const newRental: Rental = {
      id: newId,
      ...rentalData,
    }

    setRentals((prevRentals) => [...prevRentals, newRental])
  }

  const completeRental = (id: string, contactInfo?: { phone?: string; email?: string }) => {
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
  }

  const getAvailableKayaks = () => {
    return kayaks.filter((kayak) => kayak.available)
  }

  // Nueva función para filtrar alquileres por fecha
  const filterRentalsByDate = (startDate: Date, endDate: Date) => {
    return rentals.filter((rental) => {
      const rentalDate = new Date(rental.startTime)
      return rentalDate >= startDate && rentalDate <= endDate
    })
  }

  return (
    <RentalContext.Provider
      value={{
        rentals,
        kayaks,
        addRental,
        completeRental,
        getAvailableKayaks,
        filterRentalsByDate,
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

