'use client'

import { Heart, ShoppingCart, Trash2, ArrowLeft, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/context/authContext'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { useCart } from '@/components/providers/cart-provider'
import { useProduct } from '@/components/providers/product_provider'
import { useWishlist } from '@/components/providers/wishlist-provider'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/lib/types'

export default function WishlistPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, remove, clearWishlist, count } = useWishlist()
  const { addItem } = useCart()
  const { setSelectedProduct } = useProduct()

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    router.push('/product')
  }

  const handleAddToCart = (product: Product) => {
    addItem(product, 1)
    toast.success(`Added ${product.name} to your cart!`)
  }

  const handleRemove = (product: Product) => {
    remove(product.id)
    toast.info(`Removed ${product.name} from wishlist`)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fdfbf7_0%,#f4f8f5_100%)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-2"
              >
                <ArrowLeft className="size-4" /> Back to shop
              </Link>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                Saved Wishlist
                {count > 0 && (
                  <span className="rounded-full bg-primary/10 px-3.5 py-1 text-sm font-semibold text-primary">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                )}
              </h1>
            </div>

            {count > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  clearWishlist()
                  toast.info('Cleared all items from your wishlist')
                }}
                className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="size-4 mr-2" />
                Clear Wishlist
              </Button>
            )}
          </div>

          {/* Empty State */}
          {count === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-3xl border border-border bg-card/80 p-10 text-center shadow-lg backdrop-blur">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="size-10 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Your wishlist is empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Save your favorite items here so you can easily find and purchase them later.
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/shop" />}
                className="mt-6 rounded-full px-8 py-6 text-base font-semibold shadow-md transition-transform hover:scale-105"
              >
                <Sparkles className="size-5 mr-2" /> Explore Shop
              </Button>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => {
                const categoryName =
                  typeof product.category === 'string'
                    ? product.category
                    : (product.category as any)?.name || 'General'

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <div
                        className="h-full w-full cursor-pointer"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Image
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Remove Button Badge */}
                      <button
                        type="button"
                        onClick={() => handleRemove(product)}
                        aria-label="Remove item from wishlist"
                        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-md backdrop-blur transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-110"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {categoryName}
                      </span>
                      <h3
                        onClick={() => handleViewProduct(product)}
                        className="mt-1 cursor-pointer line-clamp-1 font-heading text-base font-bold text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </h3>

                      {/* Pricing */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-lg font-extrabold text-foreground">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                        <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {product.inStock ? 'In stock' : 'Out of stock'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex items-center gap-2">
                        {user?.role !== 'admin' && (
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 rounded-xl font-semibold shadow-sm transition-transform active:scale-95"
                          >
                            <ShoppingCart className="size-4 mr-2" /> Add to Cart
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleViewProduct(product)}
                          className={user?.role === 'admin' ? "flex-1 rounded-xl font-semibold" : "rounded-xl border-border"}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemove(product)}
                          className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
