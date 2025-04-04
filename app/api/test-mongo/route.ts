import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-setup"

export async function GET() {
  try {
    // Probar conexión a MongoDB
    const client = await clientPromise
    const db = client.db()

    // Contar documentos en colecciones
    const usersCount = await db.collection("users").countDocuments()
    const kayaksCount = await db.collection("kayaks").countDocuments()
    const rentalsCount = await db.collection("rentals").countDocuments()

    return NextResponse.json({
      message: "Conexión a MongoDB exitosa",
      stats: {
        users: usersCount,
        kayaks: kayaksCount,
        rentals: rentalsCount,
      },
    })
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error)
    return NextResponse.json({ error: "Error al conectar con MongoDB" }, { status: 500 })
  }
}

