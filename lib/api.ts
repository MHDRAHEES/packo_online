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
  OrderStatus,
  PaymentMethod,
  Product,
  RazorpayOrder,
  Testimonial,
  UploadImageResult,
} from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://packo-online-backend.onrender.com/api/v1' || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthMe = error.config?.url?.includes('/auth/me')
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    if (!isAuthMe) {
      console.error('API Error:', message)
    }
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

export function resolveValidProductImage(src?: string | null): string {
  if (!src || typeof src !== 'string' || src.includes('placeholder')) {
    return '/images/products/green_tissue.png'
  }
  return src
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
          p.description.toLowerCase().includes(q),
      ),
    )
  },

  async createProduct(input: {
    name: string
    description: string
    price: number
    discountPrice?: number
    category: string
    stock: number
    images?: string[]
    image?: string
    isFeatured?: boolean
  }): Promise<Product> {
    try {
      const payload = {
        name: input.name,
        description: input.description,
        price: Number(input.price),
        discountPrice: Number(input.discountPrice || 0),
        category: input.category,
        stock: Number(input.stock),
        images: input.images && input.images.length > 0 ? input.images : [input.image || '/images/products/green_tissue.png'],
        isFeatured: Boolean(input.isFeatured),
      }
      const { data } = await apiClient.post('/products', payload)
      const raw = (data as any)?.data ?? data
      const created = normalizeProduct(raw)
      products.unshift(created)
      return created
    } catch (error) {
      console.warn('Falling back to local product creation mock:', getErrorMessage(error))
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        _id: `66881a29f8c4b1234567${Math.floor(10000 + Math.random() * 90000)}`,
        name: input.name,
        slug: input.name.toLowerCase().replace(/\s+/g, '-'),
        category: input.category,
        categorySlug: input.category.toLowerCase().replace(/\s+/g, '-'),
        price: Number(input.price),
        originalPrice: input.discountPrice ? Number(input.price) + Number(input.discountPrice) : undefined,
        rating: 5.0,
        reviewCount: 0,
        image: input.image || (input.images && input.images[0]) || '/images/products/green_tissue.png',
        gallery: input.images || [input.image || '/images/products/green_tissue.png'],
        inStock: Number(input.stock) > 0,
        stockCount: Number(input.stock),
        shortDescription: input.description.slice(0, 100),
        description: input.description,
        specifications: [],
        reviews: [],
        featured: input.isFeatured,
      }
      products.unshift(newProd)
      return delay(newProd, 300)
    }
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
    const orderPayload = {
      orderItems: input.items.map((item) => ({
        product: item.product?._id || item.product?.id || (item as any).productId || (item as any).id || '66881a29f8c4b12345678901',
        name: item.product?.name || 'Product',
        quantity: item.quantity || 1,
        image: resolveValidProductImage(item.product?.image || (item.product as any)?.images?.[0]),
        price: item.product?.price || 0,
      })),
      shippingAddress: {
        address: input.customer.address || 'Address',
        city: input.customer.city || 'City',
        postalCode: input.customer.zip || (input.customer as any).postalCode || '100001',
        country: (input.customer as any).country || 'India',
        phone: input.customer.phone || '9999999999',
      },
      paymentMethod: input.paymentMethod || 'Razorpay',
      taxPrice: input.tax || 0,
      shippingPrice: input.shipping || 0,
      totalPrice: input.total,
    }

    try {
      const { data } = await apiClient.post('/orders', orderPayload)
      const payload = (data as { data?: Order }).data ?? data
      return payload as Order
    } catch (error) {
      console.error('Failed to create order on backend:', getErrorMessage(error))
      throw error
    }
  },

  async createRazorpayOrder(amount: number, orderId?: string): Promise<RazorpayOrder> {
    try {
      const { data } = await apiClient.post('/payment/checkout', { amount, orderId })
      return (data as any)?.data ?? data
    } catch (error) {
      console.error('Failed to create Razorpay order on backend:', getErrorMessage(error))
      throw error
    }
  },

  async verifyPayment(paymentData: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    orderId?: string
  }) {
    try {
      const { data } = await apiClient.post('/payment/verify', paymentData)
      return (data as any)?.data ?? data
    } catch (error) {
      console.error('Payment verification failed on backend:', getErrorMessage(error))
      throw error
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data } = await apiClient.get(`/orders/${id}`)
      const payload = (data as { data?: Order }).data ?? data
      return payload as Order
    } catch (error) {
      console.error(`Failed to fetch order (${id}) from backend:`, getErrorMessage(error))
      return null
    }
  },

  async getMyOrders(): Promise<Order[]> {
    try {
      const { data } = await apiClient.get('/orders/my-orders')
      const payload = (data as any)?.data ?? data
      const rawList = Array.isArray(payload) ? payload : (Array.isArray(data) ? data : [])
      return rawList.map((ord: any) => ({
        id: ord._id || ord.id || `VRD-${Math.floor(100000 + Math.random() * 900000)}`,
        _id: ord._id || ord.id,
        user: ord.user ? { _id: ord.user._id, name: ord.user.name, email: ord.user.email } : undefined,
        customer: {
          name: ord.user?.name || ord.shippingAddress?.name || 'Customer',
          email: ord.user?.email || 'customer@example.com',
          phone: ord.shippingAddress?.phone || '',
          address: ord.shippingAddress?.address || '',
          city: ord.shippingAddress?.city || '',
          state: ord.shippingAddress?.state || '',
          zip: ord.shippingAddress?.postalCode || ord.shippingAddress?.zip || '',
        },
        items: Array.isArray(ord.orderItems)
          ? ord.orderItems.map((item: any) => ({
            product: {
              id: item.product?._id || item.product || `prod-${Math.random().toString(36).substr(2, 5)}`,
              _id: item.product?._id || item.product,
              name: item.name || item.product?.name || 'Product Item',
              slug: (item.name || item.product?.name || 'product').toLowerCase().replace(/\s+/g, '-'),
              category: item.product?.category || 'General',
              categorySlug: (item.product?.category || 'general').toLowerCase().replace(/\s+/g, '-'),
              price: item.price || item.product?.price || 0,
              rating: item.product?.rating || 4.5,
              reviewCount: item.product?.reviewCount || 0,
              image: resolveValidProductImage(item.image || item.product?.image || (Array.isArray(item.product?.images) ? item.product?.images[0] : null)),
              gallery: [resolveValidProductImage(item.image || item.product?.image || (Array.isArray(item.product?.images) ? item.product?.images[0] : null))],
              inStock: true,
              stockCount: 50,
              shortDescription: '',
              description: '',
              specifications: [],
              reviews: [],
            },
            quantity: item.quantity || 1,
          }))
          : ord.items || [],
        paymentMethod: (ord.paymentMethod === 'COD' || ord.paymentMethod === 'cod') ? 'cod' : 'razorpay',
        subtotal: ord.totalPrice ? Math.round(ord.totalPrice * 0.82) : ord.subtotal || 0,
        tax: ord.taxPrice || ord.tax || 0,
        shipping: ord.shippingPrice || ord.shipping || 0,
        discount: ord.discount || 0,
        total: ord.totalPrice || ord.total || 0,
        orderStatus: ord.orderStatus || (ord.isDelivered ? 'Delivered' : 'Processing'),
        isPaid: Boolean(ord.isPaid),
        paidAt: ord.paidAt,
        isDelivered: Boolean(ord.isDelivered),
        deliveredAt: ord.deliveredAt,
        createdAt: ord.createdAt || new Date().toISOString(),
        updatedAt: ord.updatedAt || new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Failed to fetch user orders from backend:', getErrorMessage(error))
      return []
    }
  },

  async createReview(productId: string, reviewData: { rating: number; title?: string; comment: string }) {
    try {
      const { data } = await apiClient.post(`/products/${productId}/reviews`, reviewData)
      return (data as any)?.data ?? data
    } catch (error) {
      console.warn(`Falling back to local review creation mock (${productId}):`, getErrorMessage(error))
      return delay({
        id: `rev_${Date.now()}`,
        rating: reviewData.rating,
        title: reviewData.title || 'Great product!',
        body: reviewData.comment,
        author: 'Verified Customer',
        date: new Date().toISOString(),
      }, 400)
    }
  },

  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const { data } = await apiClient.put(`/orders/${orderId}/cancel`)
      const updated = (data as any)?.data ?? data
      return {
        id: updated._id || updated.id || orderId,
        _id: updated._id || updated.id || orderId,
        items: updated.items || [],
        customer: updated.customer || { name: 'Customer', email: 'customer@example.com', phone: '', address: '', city: '', state: '', zip: '' },
        paymentMethod: updated.paymentMethod || 'razorpay',
        subtotal: updated.subtotal || 0,
        shipping: updated.shipping || 0,
        tax: updated.tax || 0,
        discount: updated.discount || 0,
        total: updated.totalPrice || updated.total || 0,
        orderStatus: updated.orderStatus || 'Cancelled',
        isPaid: Boolean(updated.isPaid),
        isDelivered: Boolean(updated.isDelivered),
        createdAt: updated.createdAt || new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Failed to cancel order (${orderId}) on backend:`, getErrorMessage(error))
      throw error
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data } = await apiClient.get('/orders')
      const payload = (data as any)?.data ?? data
      const rawList = Array.isArray(payload) ? payload : (Array.isArray(data) ? data : [])
      return rawList.map((ord: any) => ({
        id: ord._id || ord.id || `VRD-${Math.floor(100000 + Math.random() * 900000)}`,
        _id: ord._id || ord.id,
        user: ord.user ? { _id: ord.user._id, name: ord.user.name, email: ord.user.email } : undefined,
        customer: {
          name: ord.user?.name || ord.shippingAddress?.name || 'Store Customer',
          email: ord.user?.email || 'customer@example.com',
          phone: ord.shippingAddress?.phone || '',
          address: ord.shippingAddress?.address || '',
          city: ord.shippingAddress?.city || '',
          state: ord.shippingAddress?.state || '',
          zip: ord.shippingAddress?.postalCode || ord.shippingAddress?.zip || '',
        },
        items: Array.isArray(ord.orderItems)
          ? ord.orderItems.map((item: any) => ({
            product: {
              id: item.product?._id || item.product || `prod-${Math.random().toString(36).substr(2, 5)}`,
              _id: item.product?._id || item.product,
              name: item.name || item.product?.name || 'Product Item',
              slug: (item.name || item.product?.name || 'product').toLowerCase().replace(/\s+/g, '-'),
              category: item.product?.category || 'General',
              categorySlug: (item.product?.category || 'general').toLowerCase().replace(/\s+/g, '-'),
              price: item.price || item.product?.price || 0,
              rating: item.product?.rating || 4.5,
              reviewCount: item.product?.reviewCount || 0,
              image: resolveValidProductImage(item.image || item.product?.image || (Array.isArray(item.product?.images) ? item.product?.images[0] : null)),
              gallery: [resolveValidProductImage(item.image || item.product?.image || (Array.isArray(item.product?.images) ? item.product?.images[0] : null))],
              inStock: true,
              stockCount: 50,
              shortDescription: '',
              description: '',
              specifications: [],
              reviews: [],
            },
            quantity: item.quantity || 1,
          }))
          : ord.items || [],
        paymentMethod: (ord.paymentMethod === 'COD' || ord.paymentMethod === 'cod') ? 'cod' : 'razorpay',
        subtotal: ord.totalPrice ? Math.round(ord.totalPrice * 0.82) : ord.subtotal || 0,
        tax: ord.taxPrice || ord.tax || 0,
        shipping: ord.shippingPrice || ord.shipping || 0,
        discount: ord.discount || 0,
        total: ord.totalPrice || ord.total || 0,
        orderStatus: ord.orderStatus || (ord.isDelivered ? 'Delivered' : 'Processing'),
        isPaid: Boolean(ord.isPaid),
        paidAt: ord.paidAt,
        isDelivered: Boolean(ord.isDelivered),
        deliveredAt: ord.deliveredAt,
        createdAt: ord.createdAt || new Date().toISOString(),
        updatedAt: ord.updatedAt || new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Failed to fetch admin orders from backend:', getErrorMessage(error))
      return []
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const { data } = await apiClient.put(`/orders/${orderId}/status`, { status })
      const updated = (data as any)?.data ?? data
      return {
        id: updated._id || updated.id || orderId,
        _id: updated._id || updated.id || orderId,
        items: updated.items || [],
        customer: updated.customer || { name: 'Customer', email: 'customer@example.com', phone: '', address: '', city: '', state: '', zip: '' },
        paymentMethod: updated.paymentMethod || 'razorpay',
        subtotal: updated.subtotal || 0,
        shipping: updated.shipping || 0,
        tax: updated.tax || 0,
        discount: updated.discount || 0,
        total: updated.totalPrice || updated.total || 0,
        orderStatus: updated.orderStatus || status,
        isPaid: Boolean(updated.isPaid),
        isDelivered: Boolean(updated.isDelivered),
        createdAt: updated.createdAt || new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Failed to update order status (${orderId}) on backend:`, getErrorMessage(error))
      throw error
    }
  },

  async uploadImage(file: File): Promise<UploadImageResult> {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await apiClient.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const payload = (data as any)?.data ?? data
      return {
        url: payload.url || payload.secure_url || URL.createObjectURL(file),
        public_id: payload.public_id,
      }
    } catch (error) {
      console.warn('Falling back to local object URL for image upload:', getErrorMessage(error))
      const previewUrl = URL.createObjectURL(file)
      return delay({ url: previewUrl, public_id: `mock_img_${Date.now()}` }, 400)
    }
  },

  async uploadImages(files: File[]): Promise<UploadImageResult[]> {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))
      const { data } = await apiClient.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const payload = (data as any)?.data ?? data
      if (Array.isArray(payload)) {
        return payload.map((item: any) => ({
          url: item.url || item.secure_url,
          public_id: item.public_id,
        }))
      }
      return files.map((file) => ({ url: URL.createObjectURL(file) }))
    } catch (error) {
      console.warn('Falling back to local object URLs for multi image upload:', getErrorMessage(error))
      const results = files.map((file) => ({
        url: URL.createObjectURL(file),
        public_id: `mock_img_${Math.random().toString(36).substring(2, 7)}`,
      }))
      return delay(results, 500)
    }
  },
}

export type Api = typeof api
