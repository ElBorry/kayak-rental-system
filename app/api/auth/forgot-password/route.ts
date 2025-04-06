import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { sign } from "jsonwebtoken"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email-service"

// Usar variables intermedias con tipos explícitos
const secretFromEnv: string = process.env.JWT_SECRET || "borry1234";
const JWT_SECRET = secretFromEnv;

const appUrlFromEnv: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_URL = appUrlFromEnv;

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
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

        console.log("Token de restablecimiento generado para", email, ":", token)

        // Enviar correo electrónico
        try {
            console.log("Intentando enviar correo a:", email)
            console.log("Usando configuración:", {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === "true",
                user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 5)}...` : "no configurado"
            })

            await sendPasswordResetEmail(email, resetLink)
            console.log("Correo enviado exitosamente a:", email)

            return NextResponse.json({
                message: "Se ha enviado un enlace de restablecimiento a tu correo electrónico",
            })
        } catch (unknownError: unknown) {
            console.error("Error al enviar correo:", unknownError)

            let errorMessage = "Error desconocido al enviar correo"

            // Verificar si el error es un objeto Error
            if (unknownError instanceof Error) {
                errorMessage = unknownError.message

                // Verificar si es un error de autenticación
                if (errorMessage.includes("Invalid login") || errorMessage.includes("authentication")) {
                    console.error("Error de autenticación con el proveedor de correo. Verifica tus credenciales.")
                }
            }

            // Para desarrollo, devolver el token aunque falle el envío de correo
            if (process.env.NODE_ENV !== "production") {
                return NextResponse.json({
                    message: "Error al enviar correo, pero se generó el token (solo para desarrollo)",
                    token,
                    error: errorMessage
                })
            }

            throw unknownError
        }
    } catch (error: unknown) {
        console.error("Error al procesar solicitud de restablecimiento:", error)

        let errorMessage = "Error al procesar la solicitud"
        if (error instanceof Error) {
            errorMessage = error.message
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}