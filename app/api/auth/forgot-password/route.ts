import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { sign } from "jsonwebtoken"
import { randomBytes } from "crypto"

// Usar la variable de entorno proporcionada
const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

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

        // En un entorno de producción, aquí enviaríamos un correo electrónico con el enlace
        // Para fines de demostración, simplemente devolvemos el token

        console.log(`Token de restablecimiento generado para ${email}: ${token}`)

        return NextResponse.json({
            message: "Se ha enviado un enlace de restablecimiento a tu correo electrónico",
            token,
        })
    } catch (error) {
        console.error("Error al procesar solicitud de restablecimiento:", error)
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
    }
}

