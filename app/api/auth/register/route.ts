import { NextResponse } from "next/server"
import { createUser } from "@/lib/db-service"
import { hash } from "bcrypt"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    // Validar que el rol sea válido
    if (role !== "admin" && role !== "employee") {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    // Hashear la contraseña
    const hashedPassword = await hash(password, 10)

    // Crear usuario
    const result = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
    })

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      userId: result.insertedId,
    })
  } catch (error: any) {
    console.error("Error al registrar usuario:", error)

    // Manejar error de email duplicado
    if (error.message === "El correo electrónico ya está registrado") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
  }
}

