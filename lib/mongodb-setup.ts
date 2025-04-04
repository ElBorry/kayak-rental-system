import { MongoClient, ServerApiVersion } from "mongodb"

// Usar la variable de entorno proporcionada
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://soyelborry:Lio1234@kayakyaguarete.iqrju.mongodb.net/kayakyaguarete?retryWrites=true&w=majority&appName=kayakyaguarete"

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usamos una variable global para preservar la conexión entre recargas de HMR
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()

    // Solo registramos errores si ocurren
    globalWithMongo._mongoClientPromise.catch((err) => {
      console.error("Error al conectar con MongoDB:", err)
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(uri, options)
  clientPromise = client.connect()

  // Solo registramos errores si ocurren
  clientPromise.catch((err) => {
    console.error("Error al conectar con MongoDB:", err)
  })
}

// Verificar la conexión
clientPromise
  .then(() => {
    console.log("MongoDB conectado correctamente")
  })
  .catch((err) => {
    console.error("Error al conectar con MongoDB:", err)
  })

export default clientPromise

