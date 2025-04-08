import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"

// Marcar esta ruta como dinámica
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db()

        const users = await db.collection("users").find({}).toArray()

        // Eliminar contraseñas antes de enviar
        const usersWithoutPasswords = users.map((user) => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
        })

        return NextResponse.json(usersWithoutPasswords)
    } catch (error) {
        console.error("Error al obtener usuarios:", error)
        return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password, role, phone } = body

        // Validaciones básicas
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
        }

        // Validar que el rol sea válido
        if (role !== "admin" && role !== "employee") {
            return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()

        // Verificar si el email ya existe
        const existingUser = await db.collection("users").findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
        }

        // Crear objeto de usuario sin incluir campos nulos o indefinidos
        const userData: any = {
            name,
            email,
            password, // En producción, deberías hashear la contraseña
            role,
            createdAt: new Date(),
        }

        // Solo agregar phone si tiene un valor
        if (phone) {
            userData.phone = phone
        }

        // Crear usuario
        const result = await db.collection("users").insertOne(userData)

        return NextResponse.json({
            message: "Usuario creado exitosamente",
            userId: result.insertedId.toString(),
        })
    } catch (error) {
        console.error("Error al crear usuario:", error)
        return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
    }
}
