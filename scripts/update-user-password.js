// Este script actualiza la contraseña de un usuario específico
// Ejecutar con: node scripts/update-user-password.js

import { MongoClient } from "mongodb"

// Configuración
const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"
const client = new MongoClient(uri)

// Datos del usuario a actualizar
const EMAIL = "sabrianr839@gmail.com"
const NEW_PASSWORD = "Sabri1234"

async function updateUserPassword() {
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

        console.log(`Usuario encontrado: ${user.name}`)

        // Actualizar la contraseña
        const result = await db.collection("users").updateOne({ email: EMAIL }, { $set: { password: NEW_PASSWORD } })

        if (result.modifiedCount === 1) {
            console.log(`Contraseña actualizada exitosamente para ${EMAIL}`)
        } else {
            console.log("No se pudo actualizar la contraseña")
        }
    } catch (error) {
        console.error("Error al actualizar contraseña:", error)
    } finally {
        await client.close()
    }
}

// Ejecutar la función
updateUserPassword()

