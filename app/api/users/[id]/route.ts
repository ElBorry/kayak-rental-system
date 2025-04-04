import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { ObjectId } from "mongodb"
import { hash } from "bcrypt"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const body = await request.json()
        const { name, email, role, password } = body

        // Validaciones básicas
        if (!name || !email || !role) {
            return NextResponse.json({ error: "Nombre, email y rol son requeridos" }, { status: 400 })
        }

        // Validar que el rol sea válido
        if (role !== "admin" && role !== "employee") {
            return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()

        // Preparar datos para actualizar
        const updateData: any = {
            name,
            email,
            role,
            updatedAt: new Date(),
        }

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            updateData.password = await hash(password, 10)
        }

        // Verificar si el ID es un ObjectId válido
        let filter = {}
        try {
            filter = { _id: new ObjectId(id) }
        } catch (e) {
            // Si no es un ObjectId válido, buscar por el campo id
            filter = { id: id }
        }

        const result = await db.collection("users").updateOne(filter, { $set: updateData })

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        return NextResponse.json({
            message: "Usuario actualizado exitosamente",
        })
    } catch (error) {
        console.error("Error al actualizar usuario:", error)
        return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        const client = await clientPromise
        const db = client.db()

        // Verificar si el ID es un ObjectId válido
        let filter = {}
        try {
            filter = { _id: new ObjectId(id) }
        } catch (e) {
            // Si no es un ObjectId válido, buscar por el campo id
            filter = { id: id }
        }

        // Verificar si es el último administrador
        const adminCount = await db.collection("users").countDocuments({ role: "admin" })
        const userToDelete = await db.collection("users").findOne(filter)

        if (userToDelete && userToDelete.role === "admin" && adminCount <= 1) {
            return NextResponse.json({ error: "No se puede eliminar el último administrador" }, { status: 400 })
        }

        const result = await db.collection("users").deleteOne(filter)

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
        }

        return NextResponse.json({
            message: "Usuario eliminado exitosamente",
        })
    } catch (error) {
        console.error("Error al eliminar usuario:", error)
        return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 })
    }
}

