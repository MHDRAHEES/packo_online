'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Product } from '@/lib/types'

interface WishlistContextValue {
  items: Product[]
  ids: string[]
  count: number
  has: (productId: string) => boolean
  toggle: (product: Product | string) => void
  remove: (productId: string) => void
  addItem: (product: Product) => void
  clearWishlist: () => void
}

const WISHLIST_STORAGE_KEY = 'verdant_packo_wishlist'

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error)
    }
  }, [items, isHydrated])

  const ids = useMemo(() => items.map((item) => item.id), [items])

  const has = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  )

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev
      return [...prev, product]
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const toggle = useCallback((target: Product | string) => {
    const targetId = typeof target === 'string' ? target : target.id
    setItems((prev) => {
      const exists = prev.some((p) => p.id === targetId)
      if (exists) {
        return prev.filter((p) => p.id !== targetId)
      } else {
        if (typeof target === 'string') {
          return [...prev, { id: targetId, name: 'Product', price: 0 } as Product]
        }
        return [...prev, target]
      }
    })
  }, [])

  const clearWishlist = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items,
      ids,
      count: items.length,
      has,
      toggle,
      remove,
      addItem,
      clearWishlist,
    }),
    [items, ids, has, toggle, remove, addItem, clearWishlist],
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx)
    throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}

