"use client"

import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DemoModeIndicator() {
    const { isDemo } = useAuth()

    if (!isDemo) return null

    return (
        <Alert
            variant="destructive"
            className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-yellow-50 border-yellow-200 text-yellow-800"
        >
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
                <strong>Modo demostración:</strong> Los cambios no se guardarán en la base de datos.
            </AlertDescription>
        </Alert>
    )
}

