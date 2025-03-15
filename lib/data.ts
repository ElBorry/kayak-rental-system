import type { Kayak, Rental } from "./types"

// Kayaks data
export const kayaks: Kayak[] = [
  { id: 1, name: "Kayak 1", isStandUpPaddle: false, available: true },
  { id: 2, name: "Kayak 2", isStandUpPaddle: false, available: true },
  { id: 3, name: "Kayak 3", isStandUpPaddle: false, available: true },
  { id: 4, name: "Kayak 4", isStandUpPaddle: false, available: true },
  { id: 5, name: "Kayak 5", isStandUpPaddle: false, available: true },
  { id: 6, name: "Kayak 6", isStandUpPaddle: false, available: true },
  { id: 7, name: "Kayak 7", isStandUpPaddle: false, available: true },
  { id: 8, name: "Kayak 8", isStandUpPaddle: false, available: true },
  { id: 9, name: "Kayak 9", isStandUpPaddle: false, available: true },
  { id: 10, name: "Kayak 10", isStandUpPaddle: false, available: true },
  { id: 11, name: "Stand Up Paddle", isStandUpPaddle: true, available: true },
]

// Sample rentals data
export const rentals: Rental[] = [
  {
    id: "1",
    kayakId: 1,
    startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    endTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    type: "simple",
    paymentMethod: "cash",
    amount: 6000,
    status: "active",
  },
  {
    id: "2",
    kayakId: 3,
    startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    endTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    type: "double",
    paymentMethod: "transfer",
    amount: 8000,
    status: "active",
  },
]

