import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import clientPromise from "@/lib/mongodb-setup"
import { compare } from "bcrypt"

// Usar la variable de entorno proporcionada
const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Intento de login:", { email })

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

    // Verificar si es un usuario de demostración (admin@kayak.com o employee@kayak.com)
    const isDemoUser = email === "admin@kayak.com" || email === "employee@kayak.com"

    let passwordMatches = false

    if (isDemoUser) {
      // Para usuarios de demostración, comparación directa (password = "password")
      passwordMatches = password === "password"
    } else {
      // Verificar si la contraseña está hasheada (comienza con $2a$, $2b$ o $2y$ para bcrypt)
      const isHashed =
        typeof user.password === "string" &&
        (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$"))

      if (isHashed) {
        // Si está hasheada, usar bcrypt para comparar
        try {
          passwordMatches = await compare(password, user.password)
          console.log("Verificación con bcrypt:", passwordMatches)
        } catch (e) {
          console.error("Error al verificar contraseña hasheada:", e)
          passwordMatches = false
        }
      } else {
        // Si no está hasheada, comparación directa (para usuarios existentes)
        passwordMatches = user.password === password
        console.log("Verificación directa:", passwordMatches)

        // Si la contraseña coincide, podríamos actualizar a una versión hasheada
        // para futuras verificaciones (opcional)
        if (passwordMatches) {
          try {
            const { hash } = await import("bcrypt")
            const hashedPassword = await hash(password, 10)
            await db.collection("users").updateOne({ _id: user._id }, { $set: { password: hashedPassword } })
            console.log("Contraseña actualizada a versión hasheada")
          } catch (e) {
            console.error("Error al actualizar a contraseña hasheada:", e)
            // No interrumpir el login si esto falla
          }
        }
      }
    }

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
        isDemo: isDemoUser, // Añadir flag para identificar usuarios de demostración
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
      user: {
        ...userWithoutPassword,
        isDemo: isDemoUser, // Añadir flag para identificar usuarios de demostración
      },
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}

