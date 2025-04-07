import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Este middleware se ejecuta en todas las rutas
export function middleware(request: NextRequest) {
    // Puedes agregar lógica aquí si es necesario
    return NextResponse.next()
}

// Configurar para que se ejecute en todas las rutas
export const config = {
    matcher: [
        /*
         * Coincide con todas las rutas de solicitud excepto:
         * 1. Todas las rutas que comienzan con /api (rutas API)
         * 2. Todas las rutas que comienzan con /_next (rutas internas de Next.js)
         * 3. Todas las rutas que contienen un archivo (archivos estáticos)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}

