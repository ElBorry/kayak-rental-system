export type RentalType = "simple" | "double"
export type PaymentMethod = "cash" | "transfer"

export interface Kayak {
  id: number
  name: string
  isStandUpPaddle: boolean
  available: boolean
}

export interface Rental {
  id: string
  kayakId: number
  startTime: Date
  endTime: Date
  type: RentalType
  paymentMethod: PaymentMethod
  amount: number
  status: "active" | "completed" | "cancelled"
  contactInfo?: {
    phone?: string
    email?: string
  }
}

