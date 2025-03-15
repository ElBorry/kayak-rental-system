import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Eliminar la cookie de autenticación
  cookies().delete("auth_token")

  return NextResponse.json({ message: "Sesión cerrada exitosamente" })
}

