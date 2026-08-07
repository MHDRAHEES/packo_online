'use client'

import {
  CheckCircle2,
  Package,
  Printer,
  ShoppingBag,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import type { Order } from '@/lib/types'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('lastOrder') || localStorage.getItem('lastOrder')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setOrder(parsed)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  const displayOrderId = orderIdParam || order?.id || 'VRD-829104'
  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  // Estimated delivery date 4 days in future
  const estDate = new Date()
  estDate.setDate(estDate.getDate() + 4)
  const formattedEstDate = estDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fdfbf7_0%,#f4f8f5_100%)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/shop"
                className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-4" /> Back to Store
              </Link>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Order Confirmation
              </h1>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') window.print()
              }}
              className="rounded-full border-border text-foreground hover:bg-muted"
            >
              <Printer className="size-4 mr-2" /> Print Invoice
            </Button>
          </div>

          {/* Banner Card */}
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 sm:p-8">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Order Confirmed
              </span>
              <h2 className="mt-2 text-xl font-bold text-emerald-950">
                Order #{displayOrderId}
              </h2>
              <p className="mt-1 text-xs text-emerald-800">
                A confirmation email has been sent to{' '}
                <strong>{order?.customer.email || 'customer@example.com'}</strong>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
            {/* Delivery Info */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Delivery Address
              </h3>
              <p className="text-sm font-bold text-foreground">
                {order?.customer.name || 'Muhammed Rahees'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {order?.customer.address || '123 Tech Park, Suite 400'}
                <br />
                {order?.customer.city || 'Kochi'}, {order?.customer.state || 'Kerala'}{' '}
                {order?.customer.zip || '682001'}
                <br />
                Phone: {order?.customer.phone || '+91 9876543210'}
              </p>
            </div>

            {/* Order Info */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="size-4 text-primary" /> Order Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-bold text-foreground">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Delivery:</span>
                  <span className="font-bold text-emerald-600">{formattedEstDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-bold text-foreground capitalize">
                    {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {order?.paymentMethod === 'cod' ? 'Pending COD' : 'Paid & Verified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 mb-8">
            <h3 className="font-heading text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Package className="size-5 text-primary" /> Ordered Products
            </h3>

            <div className="divide-y divide-border">
              {order?.items && order.items.length > 0 ? (
                order.items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex items-center gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted border">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-sm text-muted-foreground">
                  Order items confirmed.
                </div>
              )}
            </div>

            {/* Total Breakdown */}
            <div className="border-t border-border pt-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(order?.subtotal || 1400)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-semibold text-foreground">
                  {order?.shipping === 0 ? 'FREE' : formatCurrency(order?.shipping || 0)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(order?.tax || 252)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base font-extrabold text-foreground">
                <span>Total Amount Paid</span>
                <span className="text-xl text-primary">
                  {formatCurrency(order?.total || 1652)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="text-center">
            <Button
              nativeButton={false}
              render={<Link href="/shop" />}
              className="rounded-full px-10 h-13 text-base font-bold shadow-lg"
            >
              <ShoppingBag className="size-5 mr-2" /> Continue Shopping
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
