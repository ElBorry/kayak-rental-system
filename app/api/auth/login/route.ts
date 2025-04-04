import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import clientPromise from "@/lib/mongodb-setup"

// Usar la variable de entorno proporcionada
const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Intento de login:", { email, password })

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario por email
    const client = await clientPromise
    const db = client.db()
    const user = await db.collection("users").findOne({ email })

    console.log("Usuario encontrado:", user ? "Sí" : "No")

    if (!user) {
      console.log("Usuario no encontrado para email:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Mostrar la contraseña almacenada (solo para depuración)
    console.log("Contraseña almacenada:", user.password)
    console.log("Contraseña proporcionada:", password)

    // Comparación directa de contraseñas
    const passwordMatches = user.password === password
    console.log("Contraseña coincide:", passwordMatches)

    if (!passwordMatches) {
      console.log("Contraseña incorrecta para usuario:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear token JWT
    const token = sign(
      {
        id: user._id.toString(),
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

    console.log("Login exitoso para:", userWithoutPassword.email)

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}

