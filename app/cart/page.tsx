'use client'

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/context/authContext'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { useCart } from '@/components/providers/cart-provider'
import { useProduct } from '@/components/providers/product_provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/lib/types'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart()
  const { setSelectedProduct } = useProduct()
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  const shipping = subtotal > 500 || itemCount === 0 ? 0 : 49
  const tax = Math.round(subtotal * 0.18)
  const discount = Math.round((subtotal * discountPercent) / 100)
  const grandTotal = Math.max(0, subtotal + shipping + tax - discount)

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    router.push('/product')
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    if (promoCode.trim().toUpperCase() === 'VERDANT10') {
      setDiscountPercent(10)
      toast.success('Promo code applied! 10% discount added.')
    } else if (promoCode.trim().toUpperCase() === 'PACKO20') {
      setDiscountPercent(20)
      toast.success('Promo code applied! 20% discount added.')
    } else {
      toast.error('Invalid promo code. Try VERDANT10 or PACKO20')
    }
  }

  if (user?.role === 'admin') {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-[linear-gradient(135deg,#fdfbf7_0%,#f4f8f5_100%)] p-6">
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-xl">
              ⚡
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Admin Account Active</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Shopping cart operations are reserved for customer accounts. As an administrator (<code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary font-mono">role: "admin"</code>), please manage orders and catalog via the Admin Panel.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/admin" />}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Go to Admin Panel
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/shop" />}
                className="w-full rounded-2xl"
              >
                Browse Storefront
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fdfbf7_0%,#f4f8f5_100%)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/shop"
                className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="size-4" /> Continue Shopping
              </Link>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                Shopping Cart
                {itemCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-3.5 py-1 text-sm font-semibold text-primary">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </h1>
            </div>

            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  clearCart()
                  toast.info('Cleared all items from your cart')
                }}
                className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-3xl border border-border bg-card/80 p-10 text-center shadow-lg backdrop-blur">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="size-10 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Looks like you haven't added anything to your cart yet. Explore our store to find great items!
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/shop" />}
                className="mt-6 rounded-full px-8 py-6 text-base font-semibold shadow-md transition-transform hover:scale-105"
              >
                <Sparkles className="size-5 mr-2" /> Start Shopping
              </Button>
            </div>
          ) : (
            /* Cart Layout */
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Cart Items */}
              <div className="space-y-4 lg:col-span-8">
                {items.map(({ product, quantity }) => {
                  const categoryName =
                    typeof product.category === 'string'
                      ? product.category
                      : (product.category as any)?.name || 'General'

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                    >
                      {/* Image */}
                      <div
                        className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted cursor-pointer"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Image
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-center">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {categoryName}
                        </span>
                        <h3
                          onClick={() => handleViewProduct(product)}
                          className="cursor-pointer font-heading text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      {/* Quantity Controls & Item Total */}
                      <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="flex size-7 items-center justify-center rounded-lg hover:bg-background text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-foreground">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            className="flex size-7 items-center justify-center rounded-lg hover:bg-background text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(product.price * quantity)}
                          </p>
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(product.id)
                            toast.info(`Removed ${product.name} from cart`)
                          }}
                          aria-label="Remove item"
                          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Order Summary
                  </h2>

                  {/* Promo Code Form */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (e.g. PACKO20)"
                      className="rounded-xl h-10 text-sm"
                    />
                    <Button type="submit" variant="secondary" className="rounded-xl h-10">
                      Apply
                    </Button>
                  </form>

                  {/* Summary Rows */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Shipping</span>
                      <span className="font-semibold text-foreground">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 font-bold">FREE</span>
                        ) : (
                          formatCurrency(shipping)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (18% GST)</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(tax)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}

                    <div className="my-3 border-t border-border" />

                    <div className="flex justify-between text-base font-extrabold text-foreground">
                      <span>Grand Total</span>
                      <span className="text-lg text-primary">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    nativeButton={false}
                    render={<Link href="/checkout" />}
                    className="w-full rounded-2xl h-12 text-base font-bold shadow-md transition-transform active:scale-95"
                  >
                    Proceed to Checkout <ArrowRight className="size-5 ml-2" />
                  </Button>

                  {/* Security Highlights */}
                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-4 text-primary shrink-0" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary shrink-0" />
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
