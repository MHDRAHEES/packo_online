'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Product } from '@/lib/types'

type ProductContextType = {
  selectedProduct: Product | null
  setSelectedProduct: (product: Product) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({
  children,
}: {
  children: ReactNode
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <ProductContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const context = useContext(ProductContext)

  if (!context) {
    throw new Error('useProduct must be used inside ProductProvider')
  }

  return context
}