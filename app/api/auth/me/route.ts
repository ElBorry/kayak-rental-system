import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import clientPromise from "@/lib/mongodb-setup"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set")
}

export async function GET() {
    try {
        // Obtener token de las cookies
        const token = cookies().get("auth_token")?.value

        if (!token) {
            console.log("No se encontró token de autenticación")
            return NextResponse.json({ error: "No autenticado" }, { status: 401 })
        }

        // Verificar que JWT_SECRET esté configurado
        if (!JWT_SECRET) {
            return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 })
        }

        // Verificar token
        const decoded = verify(token, JWT_SECRET) as {
            id: string
            isDemo?: boolean // Añadir campo para usuarios de demostración
        }

        // Si es un usuario de demostración, devolver información sin consultar la BD
        if (decoded.isDemo) {
            return NextResponse.json({
                user: {
                    _id: decoded.id,
                    id: decoded.id,
                    name: decoded.id.includes("admin") ? "Administrador (Demo)" : "Empleado (Demo)",
                    email: decoded.id.includes("admin") ? "admin@kayak.com" : "employee@kayak.com",
                    role: decoded.id.includes("admin") ? "admin" : "employee",
                    isDemo: true,
                },
            })
        }

        // Si es usuario real, obtener de la base de datos
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
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        // Devolver información del usuario (sin contraseña)
        const { password, ...userWithoutPassword } = user

        return NextResponse.json({
            user: {
                ...userWithoutPassword,
                isDemo: false, // Marcar explícitamente como usuario real
            },
        })
    } catch (error) {
        console.error("Error al verificar autenticación:", error)
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
}

