import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { ObjectId } from "mongodb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const body = await request.json()

        // Usar directamente el cliente de MongoDB
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

        const result = await db.collection("rentals").updateOne(filter, { $set: { ...body, updatedAt: new Date() } })

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Alquiler no encontrado" }, { status: 404 })
        }

        return NextResponse.json({
            message: "Alquiler actualizado exitosamente",
        })
    } catch (error) {
        console.error("Error al actualizar alquiler:", error)
        return NextResponse.json({ error: "Error al actualizar el alquiler" }, { status: 500 })
    }
}

