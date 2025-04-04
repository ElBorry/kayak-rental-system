"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import LoginForm from "@/components/login-form";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState("Desconectado");

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/rentals");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function checkMongoDB() {
      try {
        const response = await fetch("/api/test-mongo");
        const data = await response.json();
        setDbStatus(data.status);
      } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        setDbStatus("❌ Error conectando a MongoDB");
      }
    }
    checkMongoDB();
}, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Cargando...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Sistema de Alquiler de Kayaks</h1>
          <p className="mt-2 text-muted-foreground">Inicia sesión para continuar</p>
        </div>
        <LoginForm />        
      </div>
    </main>
  );
}
