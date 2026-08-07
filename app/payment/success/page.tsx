'use client'

import { CheckCircle2, PackageCheck, ArrowRight, Home, Receipt, Download } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import type { Order } from '@/lib/types'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId') || searchParams.get('method') || 'PAY-ONLINE-VERIFIED'
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#f4fcf6_0%,#eef8f1_100%)] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-card p-8 shadow-xl sm:p-12 text-center">
            {/* Animated Success Badge */}
            <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="size-16" />
            </div>

            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Payment Confirmed
            </span>

            <h1 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment has been successfully processed and your order is now being prepared for shipping.
            </p>

            {/* Receipt Box */}
            <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-6 text-left space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground">Order Reference</p>
                  <p className="font-extrabold text-foreground text-sm">{orderId || order?.id || 'VRD-829104'}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Payment Transaction ID</p>
                  <p className="font-extrabold text-emerald-700 text-sm truncate">{paymentId}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Payment Method</p>
                  <p className="font-bold text-foreground capitalize">
                    {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Amount Paid</p>
                  <p className="font-extrabold text-primary text-sm">
                    {formatCurrency(order?.total || 1499)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              {order?.items && order.items.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Purchased Items ({order.items.length})
                  </p>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {order.items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-background border">
                          <Image
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {formatCurrency(product.price * quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                nativeButton={false}
                render={<Link href={`/order-confirmation?orderId=${orderId || order?.id || 'VRD-829104'}`} />}
                className="rounded-full px-8 h-12 text-base font-bold shadow-md"
              >
                <Receipt className="size-4 mr-2" /> View Order Confirmation
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/shop" />}
                className="rounded-full px-8 h-12 text-base font-semibold"
              >
                <Home className="size-4 mr-2" /> Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
