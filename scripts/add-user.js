// Este script agrega un nuevo usuario a la base de datos
// Ejecutar con: node scripts/add-user.js

import { MongoClient } from "mongodb"

// Configuración
const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"
const client = new MongoClient(uri)

// Datos del nuevo usuario
const NEW_USER = {
    name: "Sabrina",
    email: "sabrianr839@gmail.com",
    password: "Sabri1234",
    role: "admin", // o "employee"
    createdAt: new Date(),
}

async function addUser() {
    try {
        await client.connect()
        console.log("Conectado a MongoDB")

        const db = client.db()

        // Verificar si el usuario ya existe
        const existingUser = await db.collection("users").findOne({ email: NEW_USER.email })

        if (existingUser) {
            console.log(`El usuario con email ${NEW_USER.email} ya existe. Actualizando contraseña...`)

            // Actualizar la contraseña
            const result = await db
                .collection("users")
                .updateOne({ email: NEW_USER.email }, { $set: { password: NEW_USER.password } })

            if (result.modifiedCount === 1) {
                console.log("Contraseña actualizada exitosamente")
            } else {
                console.log("No se pudo actualizar la contraseña")
            }

            return
        }

        // Insertar nuevo usuario
        const result = await db.collection("users").insertOne(NEW_USER)

        console.log(`Nuevo usuario creado con ID: ${result.insertedId}`)
    } catch (error) {
        console.error("Error al agregar usuario:", error)
    } finally {
        await client.close()
    }
}

// Ejecutar la función
addUser()

