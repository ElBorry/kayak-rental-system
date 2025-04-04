import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import clientPromise from "@/lib/mongodb-setup"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "borry1234"

export async function GET() {
    try {
        // Obtener token de las cookies
        const token = cookies().get("auth_token")?.value

        if (!token) {
            console.log("No se encontró token de autenticación")
            return NextResponse.json({ error: "No autenticado" }, { status: 401 })
        }

        console.log("Token encontrado, verificando...")

        try {
            // Verificar token
            const decoded = verify(token, JWT_SECRET) as { id: string }
            console.log("Token verificado, ID de usuario:", decoded.id)

            // Obtener usuario de la base de datos
            const client = await clientPromise
            const db = client.db()

            let user
            try {
                // Intentar buscar por ObjectId
                user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) })
            } catch (e) {
                // Si falla, buscar por id como string
                user = await db.collection("users").findOne({ id: decoded.id })
            }

            if (!user) {
                console.log("Usuario no encontrado en la base de datos")
                return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
            }

            console.log("Usuario encontrado:", user.email)

            // Devolver información del usuario (sin contraseña)
            const { password, ...userWithoutPassword } = user

            return NextResponse.json({ user: userWithoutPassword })
        } catch (jwtError) {
            console.error("Error al verificar token JWT:", jwtError)
            return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }
    } catch (error) {
        console.error("Error al verificar autenticación:", error)
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
}

