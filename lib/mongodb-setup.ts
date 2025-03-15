import { MongoClient, ServerApiVersion } from "mongodb";

// Verificar si la URI de la base de datos está definida
if (!process.env.MONGODB_URI) {
  throw new Error("❌ Error: La variable de entorno MONGODB_URI no está definida.");
}

// Obtener la URI desde las variables de entorno
const uri: string = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Definir los tipos de `client` y `clientPromise`
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Manejo global para evitar múltiples conexiones en desarrollo
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Si estamos en desarrollo, usar una variable global para evitar múltiples conexiones
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, crear una nueva conexión sin usar global
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
