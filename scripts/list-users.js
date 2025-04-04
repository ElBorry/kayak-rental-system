// Este script lista todos los usuarios en la base de datos
// Ejecutar con: node scripts/list-users.js

import { MongoClient } from "mongodb"

// Configuración
const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"
const client = new MongoClient(uri)

async function listUsers() {
    try {
        await client.connect()
        console.log("Conectado a MongoDB")

        const db = client.db()

        // Obtener todos los usuarios
        const users = await db.collection("users").find({}).toArray()

        console.log(`Se encontraron ${users.length} usuarios:`)

        // Mostrar información de cada usuario (sin mostrar la contraseña completa)
        users.forEach((user, index) => {
            const passwordPreview = user.password ? `${user.password.substring(0, 3)}...` : "No definida"

            console.log(`\nUsuario ${index + 1}:`)
            console.log(`- ID: ${user._id}`)
            console.log(`- Nombre: ${user.name}`)
            console.log(`- Email: ${user.email}`)
            console.log(`- Rol: ${user.role}`)
            console.log(`- Contraseña (primeros caracteres): ${passwordPreview}`)
        })
    } catch (error) {
        console.error("Error al listar usuarios:", error)
    } finally {
        await client.close()
    }
}

// Ejecutar la función
listUsers()

