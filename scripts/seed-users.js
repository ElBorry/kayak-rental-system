// Este script crea usuarios iniciales en la base de datos
// Ejecutar con: node scripts/seed-users.js

import { MongoClient } from "mongodb"
import { hash } from "bcrypt"

// Configuración
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"
const client = new MongoClient(uri)

async function seedUsers() {
  try {
    await client.connect()
    console.log("Conectado a MongoDB")

    const db = client.db()

    // Verificar si ya existen usuarios
    const usersCount = await db.collection("users").countDocuments()

    if (usersCount > 0) {
      console.log(`Ya existen ${usersCount} usuarios en la base de datos. No se crearán usuarios adicionales.`)
      return
    }

    // Hashear contraseñas
    const hashedPassword = await hash("password", 10)

    // Crear usuarios de prueba
    await db.collection("users").insertMany([
      {
        name: "Administrador",
        email: "admin@kayak.com",
        password: "password", // No hashear para usuarios de demostración
        role: "admin",
        isDemo: true, // Marcar como usuario de demostración
        createdAt: new Date(),
      },
      {
        name: "Empleado",
        email: "employee@kayak.com",
        password: "password", // No hashear para usuarios de demostración
        role: "employee",
        isDemo: true, // Marcar como usuario de demostración
        createdAt: new Date(),
      },
    ])

    console.log("Usuarios de demostración creados exitosamente")
  } catch (error) {
    console.error("Error al crear usuarios:", error)
  } finally {
    await client.close()
  }
}

// Ejecutar la función
seedUsers()

