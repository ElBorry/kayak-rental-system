"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [resetLink, setResetLink] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setResetLink(null)
        setIsSubmitting(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar la solicitud")
            }

            setSuccess(true)

            // En un entorno de producción, aquí solo mostraríamos un mensaje de éxito
            // y el enlace se enviaría por correo electrónico.
            // Para fines de demostración, mostramos el enlace directamente.
            setResetLink(`/reset-password?token=${data.token}`)
        } catch (err: any) {
            console.error("Error:", err)
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <div className="flex items-center mb-2">
                            <Link href="/" className="mr-2">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <CardTitle>Recuperar Contraseña</CardTitle>
                        </div>
                        <CardDescription>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </CardDescription>
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
                                        Se ha enviado un enlace de recuperación a tu correo electrónico.
                                        {resetLink && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium">Para fines de demostración, puedes usar este enlace:</p>
                                                <Link href={resetLink} className="text-primary hover:underline mt-1 block">
                                                    Restablecer contraseña
                                                </Link>
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!success && (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </CardContent>

                        {!success && (
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
                                </Button>
                            </CardFooter>
                        )}

                        {success && (
                            <CardFooter>
                                <Link href="/" className="w-full">
                                    <Button variant="outline" className="w-full">
                                        Volver al inicio
                                    </Button>
                                </Link>
                            </CardFooter>
                        )}
                    </form>
                </Card>
            </div>
        </main>
    )
}

