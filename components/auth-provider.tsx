"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  name: string
  role: "employee" | "admin"
  email?: string
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
    // Verificar si el usuario está autenticado al cargar la página
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticación...")
        const response = await fetch("/api/auth/me")

        console.log("Respuesta de /api/auth/me:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Datos de usuario:", data)

          if (data.user) {
            // Normalizar el rol (asegurarse de que sea "admin" o "employee")
            const role = data.user.role === "admin" ? "admin" : "employee"

            setUser({
              id: data.user._id || data.user.id,
              name: data.user.name || "Usuario",
              role: role,
              email: data.user.email,
            })

            console.log("Usuario autenticado:", role)
          }
        } else {
          console.log("No hay sesión activa")
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
      console.log("Intentando login con:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Respuesta de login:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al iniciar sesión")
      }

      const data = await response.json()
      console.log("Datos de login:", data)

      // Normalizar el rol (asegurarse de que sea "admin" o "employee")
      const role = data.user.role === "admin" ? "admin" : "employee"

      setUser({
        id: data.user._id || data.user.id,
        name: data.user.name || "Usuario",
        role: role,
        email: data.user.email,
      })

      console.log("Login exitoso, rol:", role)

      // Forzar una recarga de la página para asegurar que la cookie se aplique correctamente
      window.location.href = role === "admin" ? "/admin/dashboard" : "/employee/rentals"

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

      // Redirigir a la página de inicio
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
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

