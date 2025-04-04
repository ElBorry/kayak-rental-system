import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, password } = body

        if (!token || !password) {
            return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 })
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

            // Actualizar contraseña y eliminar token de restablecimiento
            await db.collection("users").updateOne(
                { _id: user._id },
                {
                    $set: {
                        password: password,
                    },
                    $unset: {
                        resetToken: "",
                        resetTokenExpiry: "",
                    },
                },
            )

            return NextResponse.json({ message: "Contraseña restablecida exitosamente" })
        } catch (jwtError) {
            console.error("Error al verificar token JWT:", jwtError)
            return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }
    } catch (error) {
        console.error("Error al restablecer contraseña:", error)
        return NextResponse.json({ error: "Error al restablecer contraseña" }, { status: 500 })
    }
}

