import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"

// Marcar esta ruta como dinámica
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Usar directamente el cliente de MongoDB para asegurar que funciona
    const client = await clientPromise
    const db = client.db()
    const rentals = await db.collection("rentals").find({}).toArray()

    return NextResponse.json(rentals)
  } catch (error) {
    console.error("Error al obtener alquileres:", error)
    return NextResponse.json({ error: "Error al obtener los alquileres" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kayakId, startTime, endTime, type, paymentMethod, amount, status } = body

    // Validaciones básicas
    if (!kayakId || !startTime || !endTime || !type || !paymentMethod || !amount || !status) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Usar directamente el cliente de MongoDB
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("rentals").insertOne({
      kayakId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      paymentMethod,
      amount,
      status,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: "Alquiler creado exitosamente",
      rentalId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error al crear alquiler:", error)
    return NextResponse.json({ error: "Error al crear el alquiler" }, { status: 500 })
  }
}

