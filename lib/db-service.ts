// Este archivo es un ejemplo de cómo implementar servicios para interactuar con MongoDB

import clientPromise from "./mongodb-setup"
import type { Kayak, Rental } from "./types"
import { ObjectId } from "mongodb"

// Colecciones
const USERS_COLLECTION = "users"
const KAYAKS_COLLECTION = "kayaks"
const RENTALS_COLLECTION = "rentals"

// Servicios para usuarios
export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: "admin" | "employee"
  isDemo?: boolean // Añadir esta propiedad como opcional
}) {
  const client = await clientPromise
  const db = client.db()

  // Verificar si el email ya existe
  const existingUser = await db.collection(USERS_COLLECTION).findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("El correo electrónico ya está registrado")
  }

  // En una aplicación real, deberías hashear la contraseña antes de guardarla
  // Por ejemplo, usando bcrypt: const hashedPassword = await bcrypt.hash(userData.password, 10)

  const result = await db.collection(USERS_COLLECTION).insertOne({
    ...userData,
    createdAt: new Date(),
  })

  return result
}

export async function findUserByEmail(email: string) {
  const client = await clientPromise
  const db = client.db()

  return db.collection(USERS_COLLECTION).findOne({ email })
}

export async function findUserById(id: string) {
  const client = await clientPromise
  const db = client.db()

  return db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) })
}

export async function updateUser(
  id: string,
  userData: Partial<{
    name: string
    email: string
    password: string
    role: "admin" | "employee"
  }>,
) {
  const client = await clientPromise
  const db = client.db()

  return db
    .collection(USERS_COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...userData, updatedAt: new Date() } })
}

export async function getAllUsers() {
  const client = await clientPromise
  const db = client.db()

  return db.collection(USERS_COLLECTION).find().toArray()
}

// Servicios para kayaks
export async function createKayak(kayakData: Omit<Kayak, "id">) {
  const client = await clientPromise
  const db = client.db()

  const result = await db.collection(KAYAKS_COLLECTION).insertOne({
    ...kayakData,
    createdAt: new Date(),
  })

  return result
}

export async function getAllKayaks() {
  const client = await clientPromise
  const db = client.db()

  return db.collection(KAYAKS_COLLECTION).find().toArray()
}

export async function updateKayak(id: string, kayakData: Partial<Kayak>) {
  const client = await clientPromise
  const db = client.db()

  return db
    .collection(KAYAKS_COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...kayakData, updatedAt: new Date() } })
}

// Servicios para alquileres
export async function createRental(rentalData: Omit<Rental, "id">) {
  const client = await clientPromise
  const db = client.db()

  const result = await db.collection(RENTALS_COLLECTION).insertOne({
    ...rentalData,
    createdAt: new Date(),
  })

  return result
}

export async function getAllRentals() {
  const client = await clientPromise
  const db = client.db()

  return db.collection(RENTALS_COLLECTION).find().toArray()
}

export async function getRentalsByStatus(status: "active" | "completed" | "cancelled") {
  const client = await clientPromise
  const db = client.db()

  return db.collection(RENTALS_COLLECTION).find({ status }).toArray()
}

export async function updateRental(id: string, rentalData: Partial<Rental>) {
  const client = await clientPromise
  const db = client.db()

  return db
    .collection(RENTALS_COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...rentalData, updatedAt: new Date() } })
}

// Servicios para estadísticas y reportes
export async function getRentalStats(period: "day" | "week" | "month") {
  const client = await clientPromise
  const db = client.db()

  // Calcular la fecha de inicio según el período
  const startDate = new Date()
  if (period === "day") {
    startDate.setHours(0, 0, 0, 0)
  } else if (period === "week") {
    const day = startDate.getDay()
    startDate.setDate(startDate.getDate() - day)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === "month") {
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
  }

  // Obtener alquileres en el período
  const rentals = await db
    .collection(RENTALS_COLLECTION)
    .find({
      startTime: { $gte: startDate },
    })
    .toArray()

  // Calcular estadísticas
  const totalRentals = rentals.length
  const simpleRentals = rentals.filter((r) => r.type === "simple").length
  const doubleRentals = rentals.filter((r) => r.type === "double").length
  const cashPayments = rentals.filter((r) => r.paymentMethod === "cash").length
  const transferPayments = rentals.filter((r) => r.paymentMethod === "transfer").length

  const totalRevenue = rentals.reduce((sum, rental) => sum + rental.amount, 0)
  const simpleRevenue = rentals.filter((r) => r.type === "simple").reduce((sum, rental) => sum + rental.amount, 0)
  const doubleRevenue = rentals.filter((r) => r.type === "double").reduce((sum, rental) => sum + rental.amount, 0)
  const cashRevenue = rentals.filter((r) => r.paymentMethod === "cash").reduce((sum, rental) => sum + rental.amount, 0)
  const transferRevenue = rentals
    .filter((r) => r.paymentMethod === "transfer")
    .reduce((sum, rental) => sum + rental.amount, 0)

  return {
    totalRentals,
    simpleRentals,
    doubleRentals,
    cashPayments,
    transferPayments,
    totalRevenue,
    simpleRevenue,
    doubleRevenue,
    cashRevenue,
    transferRevenue,
    period,
    startDate,
  }
}

