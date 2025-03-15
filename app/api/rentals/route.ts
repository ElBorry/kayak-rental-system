import { NextResponse } from "next/server"
import { createRental, getAllRentals } from "@/lib/db-service"

export async function GET() {
  try {
    const rentals = await getAllRentals()
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

    // Crear alquiler
    const result = await createRental({
      kayakId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      paymentMethod,
      amount,
      status,
    })

    return NextResponse.json({
      message: "Alquiler creado exitosamente",
      rentalId: result.insertedId,
    })
  } catch (error) {
    console.error("Error al crear alquiler:", error)
    return NextResponse.json({ error: "Error al crear el alquiler" }, { status: 500 })
  }
}

