// Este script corrige el rol del usuario
// Ejecutar con: node scripts/fix-user-role.js

import { MongoClient } from "mongodb"

// Configuración
const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"
const client = new MongoClient(uri)

// Email del usuario a corregir
const EMAIL = "sabrianr839@gmail.com"

async function fixUserRole() {
    try {
        await client.connect()
        console.log("Conectado a MongoDB")

        const db = client.db()

        // Buscar el usuario
        const user = await db.collection("users").findOne({ email: EMAIL })

        if (!user) {
            console.log(`Usuario con email ${EMAIL} no encontrado`)
            return
        }

        console.log(`Usuario encontrado: ${user.name || EMAIL}`)
        console.log(`Rol actual: ${user.role}`)

        // Corregir el rol y añadir nombre si falta
        const updates = {
            role: "employee", // Cambiar de "empleado" a "employee"
            name: user.name || "Sabrina", // Añadir nombre si no existe
        }

        const result = await db.collection("users").updateOne({ email: EMAIL }, { $set: updates })

        if (result.modifiedCount === 1) {
            console.log(`Usuario actualizado exitosamente. Nuevo rol: ${updates.role}, Nombre: ${updates.name}`)
        } else {
            console.log("No se pudo actualizar el usuario")
        }
    } catch (error) {
        console.error("Error al actualizar usuario:", error)
    } finally {
        await client.close()
    }
}

// Ejecutar la función
fixUserRole()

