import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/db-service"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

// Usar la variable de entorno proporcionada
const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario por email
    const user = await findUserByEmail(email)

    // Si no existe el usuario o la contraseña no coincide
    if (!user || user.password !== password) {
      // En una app real, usar bcrypt.compare
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear token JWT
    const token = sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    )

    // Guardar token en cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })

    // Devolver información del usuario (sin contraseña)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)

    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}

