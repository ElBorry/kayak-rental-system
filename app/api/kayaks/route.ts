import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"
import { kayaks as initialKayaks } from "@/lib/data"

// Marcar esta ruta como dinámica
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db()

        // Verificar si ya existen kayaks en la base de datos
        const count = await db.collection("kayaks").countDocuments()

        if (count === 0) {
            // Si no hay kayaks, insertar los iniciales
            await db.collection("kayaks").insertMany(initialKayaks)
            return NextResponse.json(initialKayaks)
        }

        // Si ya hay kayaks, devolverlos
        const kayaks = await db.collection("kayaks").find({}).toArray()
        return NextResponse.json(kayaks)
    } catch (error) {
        console.error("Error al obtener kayaks:", error)
        // Si hay un error, devolver los kayaks iniciales como fallback
        return NextResponse.json(initialKayaks)
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, isStandUpPaddle } = body

        // Validaciones básicas
        if (!name) {
            return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db()

        const result = await db.collection("kayaks").insertOne({
            name,
            isStandUpPaddle: !!isStandUpPaddle,
            available: true,
            createdAt: new Date(),
        })

        return NextResponse.json({
            message: "Kayak creado exitosamente",
            kayakId: result.insertedId.toString(),
        })
    } catch (error) {
        console.error("Error al crear kayak:", error)
        return NextResponse.json({ error: "Error al crear el kayak" }, { status: 500 })
    }
}

