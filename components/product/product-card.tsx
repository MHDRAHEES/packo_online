'use client'

import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Zap ,SmilePlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/components/providers/cart-provider'
import { useWishlist } from '@/components/providers/wishlist-provider'
import { StarRating } from '@/components/star-rating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { discountPercent, formatCurrency } from '@/lib/format'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useProduct } from "../providers/product_provider"

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const wished = has(product.id)
  const discount = discountPercent(product.price, product.originalPrice)
  const { setSelectedProduct } = useProduct()

const handleView = () => {
  console.log("View clicked", product)

  setSelectedProduct(product)

  router.push("/product")
}
  return (
    <motion.article
      initial={{ opacity: 1, y: 24 }}
      whileInView={{ opacity: 3, y: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">

        <div
          className="relative h-full w-full cursor-pointer"
          onClick={handleView}
        >
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 668px) 40vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-90"
          />
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <Badge
              variant={
                discount > 0
                  ? 'default'
                  : product.inStock
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {product.badge}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            toggle(product.id)
            toast(wished ? 'Removed from wishlist' : 'Added to wishlist', {
              description: product.name,
            })
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={cn(
              'size-4.5 transition-colors',
              wished && 'fill-destructive text-destructive',
            )}
          />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/85 px-3 py-1 text-xs font-semibold text-background">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <h3
          onClick={handleView}
          className="mt-1 line-clamp-1 font-heading text-[0.95rem] font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span
            className={cn(
              'ml-auto text-xs font-medium',
              product.inStock ? 'text-secondary-foreground' : 'text-destructive',
            )}
          >
            {product.inStock
              ? product.stockCount <= 20
                ? `Only ${product.stockCount} left`
                : 'In stock'
              : 'Unavailable'}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">

          <Button
            variant="outline"
            className="h-10 flex-1 rounded-lg"
            onClick={handleView}

          >
            <SmilePlus className="size-4" />
            View Details
          </Button>

        </div>


      </div>
    </motion.article>
  )
}
