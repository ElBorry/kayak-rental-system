"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Componente para manejar los parámetros de búsqueda
function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isValidToken, setIsValidToken] = useState(true)

    useEffect(() => {
        // Verificar si el token es válido
        if (!token) {
            setIsValidToken(false)
            setError("Token de restablecimiento no proporcionado o inválido")
            return
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)

                if (!response.ok) {
                    setIsValidToken(false)
                    const data = await response.json()
                    setError(data.error || "Token inválido o expirado")
                }
            } catch (err) {
                console.error("Error al verificar token:", err)
                setIsValidToken(false)
                setError("Error al verificar el token de restablecimiento")
            }
        }

        verifyToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        // Validar longitud mínima
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al restablecer la contraseña")
            }

            setSuccess(true)

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push("/")
            }, 3000)
        } catch (err: any) {
            console.error("Error:", err)
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isValidToken) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Enlace inválido</CardTitle>
                    <CardDescription>El enlace de restablecimiento de contraseña es inválido o ha expirado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Link href="/forgot-password" className="w-full">
                        <Button className="w-full">Solicitar nuevo enlace</Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center mb-2">
                    <Link href="/" className="mr-2">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <CardTitle>Restablecer Contraseña</CardTitle>
                </div>
                <CardDescription>Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription>
                                Tu contraseña ha sido restablecida exitosamente. Serás redirigido a la página de inicio de sesión.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!success && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}
                </CardContent>

                {!success && (
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Restableciendo..." : "Restablecer Contraseña"}
                        </Button>
                    </CardFooter>
                )}
            </form>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    )
}

