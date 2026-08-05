/**
 * Reusable API service layer.
 *
 * This module centralizes every data access call the storefront makes. Right
 * now it resolves against local mock data, but each function is async and
 * shaped like a real network call so it can be swapped for the future
 * Node.js + Express + MongoDB backend without touching UI components.
 *
 * To connect the real backend later, set NEXT_PUBLIC_API_URL and replace the
 * mock bodies with `fetch(`${API_URL}/...`)` calls that return the same types.
 */
import { categories, products, testimonials } from '@/lib/data'
import type {
  Category,
  CustomerInfo,
  Order,
  PaymentMethod,
  Product,
  Testimonial,
  CartItem,
} from '@/lib/types'

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// Simulate network latency so loading states are exercised in development.
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const api = {
  // ----- Products -----
  async getProducts(): Promise<Product[]> {
    return delay(products)
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return delay(products.filter((p) => p.featured))
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return delay(products.find((p) => p.slug === slug))
  },

  async getRelatedProducts(
    product: Product,
    limit = 4,
  ): Promise<Product[]> {
    const related = products.filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
    )
    const fallback = products.filter((p) => p.id !== product.id)
    return delay([...related, ...fallback].slice(0, limit))
  },

  async searchProducts(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase()
    if (!q) return delay(products)
    return delay(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      ),
    )
  },

  // ----- Categories -----
  async getCategories(): Promise<Category[]> {
    return delay(categories)
  },

  async getProductsByCategory(slug: string): Promise<Product[]> {
    return delay(products.filter((p) => p.categorySlug === slug))
  },

  // ----- Testimonials -----
  async getTestimonials(): Promise<Testimonial[]> {
    return delay(testimonials)
  },

  // ----- Orders / Checkout -----
  async placeOrder(input: {
    items: CartItem[]
    customer: CustomerInfo
    paymentMethod: PaymentMethod
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
  }): Promise<Order> {
    const order: Order = {
      id: `VRD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      ...input,
    }
    return delay(order, 700)
  },
}

export type Api = typeof api
