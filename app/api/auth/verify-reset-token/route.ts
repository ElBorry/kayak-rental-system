import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

// Marcar esta ruta como dinámica
export const dynamic = "force-dynamic"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set")
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
        }

        // Verificar que JWT_SECRET esté configurado
        if (!JWT_SECRET) {
            return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 })
        }

        try {
            // Verificar JWT
            const decoded = verify(token, JWT_SECRET) as { userId: string; resetToken: string }

            // Buscar usuario con el token de restablecimiento
            const client = await clientPromise
            const db = client.db()

            const user = await db.collection("users").findOne({
                _id: new ObjectId(decoded.userId),
                resetToken: decoded.resetToken,
                resetTokenExpiry: { $gt: new Date() },
            })

            if (!user) {
                return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
            }

            return NextResponse.json({ valid: true })
        } catch (jwtError) {
            console.error("Error al verificar token JWT:", jwtError)
            return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }
    } catch (error) {
        console.error("Error al verificar token de restablecimiento:", error)
        return NextResponse.json({ error: "Error al verificar token" }, { status: 500 })
    }
}

