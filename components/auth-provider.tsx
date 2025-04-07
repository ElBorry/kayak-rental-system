"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  name: string
  role: "employee" | "admin"
  email?: string
  isDemo?: boolean // Añadir flag para identificar usuarios de demostración
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isDemo: boolean // Añadir propiedad para verificar si es usuario de demostración
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false) // Estado para controlar si es usuario de demostración

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la página
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            const userData = {
              id: data.user._id || data.user.id,
              name: data.user.name,
              role: data.user.role,
              email: data.user.email,
              isDemo: data.user.isDemo || false,
            }
            setUser(userData)
            setIsDemo(userData.isDemo || false) // Actualizar estado de demostración
          }
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Verificar si es un usuario de demostración
      const isDemoUser = email === "admin@kayak.com" || email === "employee@kayak.com"

      if (isDemoUser && password === "password") {
        // Manejar usuarios de demostración
        const demoUser = {
          id: email === "admin@kayak.com" ? "demo-admin-id" : "demo-employee-id",
          name: email === "admin@kayak.com" ? "Administrador (Demo)" : "Empleado (Demo)",
          role: email === "admin@kayak.com" ? ("admin" as const) : ("employee" as const),
          email: email,
          isDemo: true,
        }
        setUser(demoUser)
        setIsDemo(true)
        console.log("Login exitoso con usuario de demostración:", demoUser)
        return
      }

      // Intento normal de login con la API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al iniciar sesión")
      }

      const data = await response.json()

      const userData = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        role: data.user.role,
        email: data.user.email,
        isDemo: data.user.isDemo || false,
      }

      setUser(userData)
      setIsDemo(userData.isDemo || false)

      return data
    } catch (error) {
      console.error("Error durante el login:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      setIsDemo(false)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading, isDemo }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

