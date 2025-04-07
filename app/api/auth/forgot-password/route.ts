import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { sign } from "jsonwebtoken"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email-service"

// Marcar esta ruta como dinámica
export const dynamic = "force-dynamic"

// Usar variables de entorno sin valores por defecto
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set")
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
if (!APP_URL) {
    console.error("NEXT_PUBLIC_APP_URL environment variable is not set")
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
        }

        // Verificar que las variables de entorno estén configuradas
        if (!JWT_SECRET || !APP_URL) {
            return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 })
        }

        // Buscar usuario por email
        const client = await clientPromise
        const db = client.db()
        const user = await db.collection("users").findOne({ email })

        // Si no existe el usuario, devolver error
        if (!user) {
            return NextResponse.json({ error: "No existe una cuenta con este correo electrónico" }, { status: 404 })
        }

        // Generar token de restablecimiento
        const resetToken = randomBytes(32).toString("hex")
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

        // Guardar token en la base de datos
        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    resetToken,
                    resetTokenExpiry,
                },
            },
        )

        // Crear JWT para el enlace de restablecimiento
        const token = sign(
            {
                userId: user._id.toString(),
                resetToken,
            },
            JWT_SECRET,
            { expiresIn: "1h" },
        )

        // Crear enlace de restablecimiento
        const resetLink = `${APP_URL}/reset-password?token=${token}`

        // Enviar correo electrónico
        try {
            await sendPasswordResetEmail(email, resetLink)

            return NextResponse.json({
                message: "Se ha enviado un enlace de restablecimiento a tu correo electrónico",
            })
        } catch (emailError) {
            console.error("Error al enviar correo:", emailError)

            // Para desarrollo, devolver el token aunque falle el envío de correo
            if (process.env.NODE_ENV !== "production") {
                return NextResponse.json({
                    message: "Error al enviar correo, pero se generó el token (solo para desarrollo)",
                    token,
                })
            }

            throw emailError
        }
    } catch (error) {
        console.error("Error al procesar solicitud de restablecimiento:", error)
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }
}

