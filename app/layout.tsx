import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { RentalProvider } from "@/lib/rental-context"
import { DemoModeIndicator } from "@/components/demo-mode-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Alquiler de Kayaks",
  description: "Aplicación para gestionar alquileres de kayaks",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <RentalProvider>
              {children}
              <DemoModeIndicator />
            </RentalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

