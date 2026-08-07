/**
 * Reusable API service layer.
 *
 * This module centralizes storefront data access and can communicate with the
 * Express + MongoDB backend when NEXT_PUBLIC_API_BASE_URL is configured.
 */
import axios, { type AxiosRequestConfig } from 'axios'
import { categories, products, testimonials } from '@/lib/data'
import type {
  Category,
  CartItem,
  CustomerInfo,
  Order,
  PaymentMethod,
  Product,
  Testimonial,
} from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    console.error('API Error:', message)
    return Promise.reject(error)
  },
)

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function extractCollection<T>(payload: unknown, key?: string): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const record = payload as Record<string, unknown>

  // 1. Check if record.data is an array (standard Express res.json({ success: true, data: [...] }))
  if (Array.isArray(record.data)) {
    return record.data as T[]
  }

  // 2. Check if key exists on record and is an array (e.g. { products: [...] })
  if (key && Array.isArray(record[key])) {
    return record[key] as T[]
  }

  // 3. Check if key exists on record.data (e.g. { data: { products: [...] } })
  if (record.data && typeof record.data === 'object') {
    const nested = record.data as Record<string, unknown>
    if (key && Array.isArray(nested[key])) {
      return nested[key] as T[]
    }
  }

  // 4. Fallback: return the first array property found in record
  for (const val of Object.values(record)) {
    if (Array.isArray(val)) {
      return val as T[]
    }
  }

  return []
}

export function normalizeProduct(item: any): Product {
  if (!item || typeof item !== 'object') {
    return products[0]
  }

  const id = String(item.id || item._id || `prod-${Math.random().toString(36).substring(2, 9)}`)

  let categoryName = 'General'
  let categorySlug = 'general'
  if (typeof item.category === 'string') {
    categoryName = item.category
    categorySlug = item.categorySlug || item.category.toLowerCase().replace(/\s+/g, '-')
  } else if (item.category && typeof item.category === 'object') {
    categoryName = item.category.name || item.category.title || 'General'
    categorySlug = item.category.slug || categoryName.toLowerCase().replace(/\s+/g, '-')
  }

  const image =
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0
      ? typeof item.images[0] === 'string'
        ? item.images[0]
        : item.images[0]?.url
      : '/images/products/green_tissue.png')

  const gallery =
    Array.isArray(item.gallery) && item.gallery.length > 0
      ? item.gallery
      : Array.isArray(item.images) && item.images.length > 0
        ? item.images.map((img: any) => (typeof img === 'string' ? img : img.url))
        : [image]

  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
  const originalPrice = item.originalPrice
    ? typeof item.originalPrice === 'number'
      ? item.originalPrice
      : parseFloat(item.originalPrice) || undefined
    : undefined

  const rating = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating) || 4.5
  const reviewCount =
    typeof item.reviewCount === 'number'
      ? item.reviewCount
      : typeof item.numReviews === 'number'
        ? item.numReviews
        : Array.isArray(item.reviews)
          ? item.reviews.length
          : 12

  const stockCount =
    typeof item.stockCount === 'number'
      ? item.stockCount
      : typeof item.countInStock === 'number'
        ? item.countInStock
        : typeof item.stock === 'number'
          ? item.stock
          : 20

  const inStock = item.inStock !== undefined ? Boolean(item.inStock) : stockCount > 0
  const featured = Boolean(item.featured ?? item.isFeatured ?? false)

  return {
    id,
    name: item.name || item.title || 'Product',
    slug: item.slug || id,
    category: categoryName,
    categorySlug,
    price,
    originalPrice,
    rating,
    reviewCount,
    image: image || '/images/products/green_tissue.png',
    gallery,
    inStock,
    stockCount,
    badge: item.badge || (featured ? 'Featured' : undefined),
    shortDescription: item.shortDescription || item.description || '',
    description: item.description || item.shortDescription || '',
    specifications: Array.isArray(item.specifications) ? item.specifications : [],
    reviews: Array.isArray(item.reviews) ? item.reviews : [],
    featured,
  }
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Request failed'
  }

  return 'Request failed'
}

export const api = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return apiClient.get<T>(url, config)
  },

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return apiClient.post<T>(url, data, config)
  },

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return apiClient.put<T>(url, data, config)
  },

  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return apiClient.delete<T>(url, config)
  },

  async getProducts(): Promise<Product[]> {
    try {
      const { data } = await apiClient.get('/products')
      const rawItems = extractCollection<any>(data, 'products')
      if (!rawItems || rawItems.length === 0) {
        return delay(products)
      }
      return rawItems.map(normalizeProduct)
    } catch (error) {
      console.warn('Falling back to local products data:', getErrorMessage(error))
      return delay(products)
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data } = await apiClient.get('/products?featured=true')
      const rawItems = extractCollection<any>(data, 'products')
      if (!rawItems || rawItems.length === 0) {
        // Fallback to local featured products or all local products
        const featuredLocal = products.filter((p) => p.featured)
        return delay(featuredLocal.length > 0 ? featuredLocal : products)
      }

      const normalized = rawItems.map(normalizeProduct)
      const featured = normalized.filter((p) => p.featured)
      // If API returned products but none were flagged featured, show the normalized items
      return featured.length > 0 ? featured : normalized
    } catch (error) {
      console.warn('Falling back to local featured products data:', getErrorMessage(error))
      const featuredLocal = products.filter((p) => p.featured)
      return delay(featuredLocal.length > 0 ? featuredLocal : products)
    }
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    try {
      const { data } = await apiClient.get(`/products/${slug}`)
      const payload = (data as { data?: any }).data ?? data
      if (payload) return normalizeProduct(payload)
      return delay(products.find((p) => p.slug === slug || p.id === slug))
    } catch (error) {
      console.warn('Falling back to local product data:', getErrorMessage(error))
      return delay(products.find((p) => p.slug === slug || p.id === slug))
    }
  },

  async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
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

  async getCategories(): Promise<Category[]> {
    try {
      const { data } = await apiClient.get('/categories')
      const rawCategories = extractCollection<Category>(data, 'categories')
      if (!rawCategories || rawCategories.length === 0) {
        return delay(categories)
      }
      return rawCategories
    } catch (error) {
      console.warn('Falling back to local categories data:', getErrorMessage(error))
      return delay(categories)
    }
  },

  async getProductsByCategory(slug: string): Promise<Product[]> {
    try {
      const { data } = await apiClient.get(`/products/category/${slug}`)
      const rawItems = extractCollection<any>(data, 'products')
      if (!rawItems || rawItems.length === 0) {
        return delay(products.filter((p) => p.categorySlug === slug))
      }
      return rawItems.map(normalizeProduct)
    } catch (error) {
      console.warn('Falling back to local category data:', getErrorMessage(error))
      return delay(products.filter((p) => p.categorySlug === slug))
    }
  },

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const { data } = await apiClient.get('/testimonials')
      const rawTestimonials = extractCollection<Testimonial>(data, 'testimonials')
      if (!rawTestimonials || rawTestimonials.length === 0) {
        return delay(testimonials)
      }
      return rawTestimonials
    } catch (error) {
      console.warn('Falling back to local testimonials data:', getErrorMessage(error))
      return delay(testimonials)
    }
  },

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
    try {
      const { data } = await apiClient.post('/orders', input)
      const payload = (data as { data?: Order }).data ?? data
      return payload as Order
    } catch (error) {
      console.warn('Falling back to local order mock:', getErrorMessage(error))
      const order: Order = {
        id: `VRD-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        ...input,
      }
      return delay(order, 700)
    }
  },
}

export type Api = typeof api
