import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

// Usar variable intermedia con tipo explícito
const secretFromEnv: string = process.env.JWT_SECRET || "borry1234";
const JWT_SECRET = secretFromEnv;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
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