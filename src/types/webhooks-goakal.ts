interface User {
  name: string
  email: string
  phone: string
}

interface Service {
  id: string
  name: string
}

interface PriceScheme {
  id: string
  name: string
  price: number
}

interface CrossSale {
  id: string
  name: string
  price: number
}

interface TransactionData {
  id: string
  paymentId: string
  status: string
  amount: number
  schoolId: string
  user: User
  service: Service
  priceScheme: PriceScheme
  crossSales: CrossSale[]
  createdAt: string
  paidAt: string
}

export interface GoakalWebhookPayload {
  event: string
  data: TransactionData
  idempotencyKey: string
  token: string
}
