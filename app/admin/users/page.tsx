"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

type User = {
  id: string
  _id?: string
  name: string
  email: string
  role: "admin" | "employee"
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as "admin" | "employee",
  })
  const [error, setError] = useState<string | null>(null)

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          // Normalizar los IDs
          const formattedUsers = data.map((user: any) => ({
            ...user,
            id: user._id || user.id,
          }))
          setUsers(formattedUsers)
        } else {
          console.error("Error al cargar usuarios:", await response.text())
          setError("Error al cargar usuarios")
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        setError("Error al cargar usuarios")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setCurrentUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't show existing password
        role: user.role,
      })
    } else {
      setCurrentUser(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
      })
    }
    setError(null)
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (user: User) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as "admin" | "employee" }))
  }

  const handleSubmit = async () => {
    // Validar form
    if (!formData.name || !formData.email || (!currentUser && !formData.password)) {
      setError("Por favor completa todos los campos requeridos.")
      return
    }

    try {
      if (currentUser) {
        // Actualizar usuario existente
        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            ...(formData.password ? { password: formData.password } : {}),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al actualizar usuario")
        }

        // Actualizar estado local
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === currentUser.id
              ? {
                  ...user,
                  name: formData.name,
                  email: formData.email,
                  role: formData.role,
                }
              : user,
          ),
        )
      } else {
        // Crear nuevo usuario
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al crear usuario")
        }

        const data = await response.json()

        // Agregar nuevo usuario al estado
        const newUser: User = {
          id: data.userId,
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
        setUsers((prevUsers) => [...prevUsers, newUser])
      }

      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error al guardar usuario:", error)
      setError(error.message || "Error al guardar usuario")
    }
  }

  const handleDelete = async () => {
    if (!currentUser) return

    try {
      // Prevenir eliminar el último admin
      const adminCount = users.filter((user) => user.role === "admin").length
      if (currentUser.role === "admin" && adminCount <= 1) {
        setError("No se puede eliminar el último administrador.")
        setIsDeleteDialogOpen(false)
        return
      }

      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      // Actualizar estado local
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== currentUser.id))
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      setError(error.message || "Error al eliminar usuario")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Administrador" : "Empleado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(user)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {currentUser
                ? "Actualiza los detalles del usuario existente."
                : "Completa los campos para crear un nuevo usuario."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña{" "}
                {currentUser && <span className="text-xs text-muted-foreground">(Dejar en blanco para mantener)</span>}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={currentUser ? "••••••••" : "Contraseña"}
                required={!currentUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{currentUser ? "Guardar Cambios" : "Crear Usuario"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario {currentUser?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

