// Este script elimina el índice único en el campo username
// Ejecutar con: node scripts/remove-username-index.js

import { MongoClient } from "mongodb"

// Configuración - usa la variable de entorno o la cadena de conexión directa
const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"

const client = new MongoClient(uri)

async function removeUsernameIndex() {
    try {
        await client.connect()
        console.log("Conectado a MongoDB")

        const db = client.db()

        // Listar todos los índices antes de eliminar
        console.log("Índices actuales en la colección users:")
        const currentIndexes = await db.collection("users").indexes()
        console.log(currentIndexes)

        // Eliminar el índice username_1
        try {
            await db.collection("users").dropIndex("username_1")
            console.log("Índice username_1 eliminado exitosamente")
        } catch (indexError) {
            if (indexError.code === 27) {
                console.log("El índice username_1 no existe, no es necesario eliminarlo")
            } else {
                throw indexError
            }
        }

        // Verificar que el índice se haya eliminado
        console.log("Índices después de la eliminación:")
        const updatedIndexes = await db.collection("users").indexes()
        console.log(updatedIndexes)

        console.log("Proceso completado con éxito")
    } catch (error) {
        console.error("Error:", error)
    } finally {
        await client.close()
    }
}

removeUsernameIndex()
