"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  name: string
  role: "employee" | "admin"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Attempting login with:", email)

      // Simulate admin login with admin@kayak.com
      if (email === "admin@kayak.com" && password === "password") {
        const adminUser = {
          id: "1",
          name: "Administrador",
          role: "admin" as const,
        }
        setUser(adminUser)
        localStorage.setItem("user", JSON.stringify(adminUser))
        console.log("Admin login successful")
      }
      // Simulate employee login with employee@kayak.com
      else if (email === "employee@kayak.com" && password === "password") {
        const employeeUser = {
          id: "2",
          name: "Empleado",
          role: "employee" as const,
        }
        setUser(employeeUser)
        localStorage.setItem("user", JSON.stringify(employeeUser))
        console.log("Employee login successful")
      } else {
        console.error("Invalid credentials:", email)
        throw new Error("Credenciales inválidas")
      }
    } catch (error) {
      console.error("Error during login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

