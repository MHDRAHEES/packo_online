export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  productCount: number
}

export interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  date: string
  title: string
  body: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category: string
  categorySlug: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  gallery: string[]
  inStock: boolean
  stockCount: number
  badge?: string
  shortDescription: string
  description: string
  specifications: { label: string; value: string }[]
  reviews: Review[]
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  quote: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}

export type PaymentMethod = 'cod' | 'razorpay'

export interface Order {
  id: string
  items: CartItem[]
  customer: CustomerInfo
  paymentMethod: PaymentMethod
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  createdAt: string
}
