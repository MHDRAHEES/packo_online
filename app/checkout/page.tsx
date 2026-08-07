'use client'

import { ArrowLeft, CreditCard, ShieldCheck, Truck, CheckCircle2, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/context/authContext'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { useCart } from '@/components/providers/cart-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { CustomerInfo, PaymentMethod, RazorpayOrder } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, itemCount, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user as any)?.phone || '',
      }))
    }
  }, [user])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay')

  const shipping = subtotal > 500 || itemCount === 0 ? 0 : 49
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  if (items.length === 0 && !loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background py-16 text-center">
          <div className="mx-auto max-w-md p-8">
            <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
            <p className="mt-2 text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
            <Button nativeButton={false} render={<Link href="/shop" />} className="mt-6 rounded-full">
              Back to Shop
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer.name || !customer.email || !customer.address || !customer.city) {
      toast.error('Please fill in all required shipping fields')
      return
    }

    setLoading(true)

    try {
      // 1. Place order record
      const order = await api.placeOrder({
        items,
        customer,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        discount: 0,
        total,
      })

      // Save order to session/local storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastOrder', JSON.stringify(order))
        localStorage.setItem('lastOrder', JSON.stringify(order))
      }

      if (paymentMethod === 'cod') {
        clearCart()
        toast.success('Order placed successfully with Cash on Delivery!')
        router.push(`/payment/success?orderId=${order.id}&method=cod`)
        return
      }

      // 2. Process Razorpay online payment
      let razorpayOrder: RazorpayOrder | null = null
      try {
        razorpayOrder = await api.createRazorpayOrder(total, order.id)
      } catch (err) {
        console.warn('Razorpay order creation fallback:', err)
      }

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere'

      const options = {
        key: razorpayKey,
        amount: (razorpayOrder?.amount || total * 100).toString(),
        currency: razorpayOrder?.currency || 'INR',
        name: 'Packo Store',
        description: `Order Payment #${order.id}`,
        order_id: razorpayOrder?.id,
        handler: async function (response: any) {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id || razorpayOrder?.id || 'mock_order',
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 9)}`,
              razorpay_signature: response.razorpay_signature || 'mock_sig',
              orderId: order.id,
            })
            clearCart()
            toast.success('Payment completed successfully!')
            router.push(
              `/payment/success?orderId=${order.id}&paymentId=${response.razorpay_payment_id || 'pay_mock_123'
              }`,
            )
          } catch (error) {
            router.push(`/payment/failure?orderId=${order.id}&reason=verification_failed`)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            toast.info('Payment window closed')
          },
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: '#0F5132',
        },
      }

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          setLoading(false)
          router.push(
            `/payment/failure?orderId=${order.id}&reason=${encodeURIComponent(
              response.error?.description || 'Payment Failed',
            )}`,
          )
        })
        rzp.open()
      } else {
        // Fallback simulated payment success for dev testing
        setTimeout(() => {
          clearCart()
          toast.success('Mock payment verified successfully!')
          router.push(`/payment/success?orderId=${order.id}&paymentId=pay_mock_demo`)
        }, 1200)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fdfbf7_0%,#f4f8f5_100%)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-4" /> Return to Cart
          </Link>

          <h1 className="mb-8 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Checkout & Payment
          </h1>

          <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Shipping & Payment Info */}
            <div className="space-y-8 lg:col-span-7">
              {/* Shipping Address Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Truck className="size-5 text-primary" /> Shipping Information
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={customer.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Email Address *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={customer.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      value={customer.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Street Address *
                    </label>
                    <Input
                      name="address"
                      value={customer.address}
                      onChange={handleChange}
                      placeholder="House/Apartment #, Street"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      City *
                    </label>
                    <Input
                      name="city"
                      value={customer.city}
                      onChange={handleChange}
                      placeholder="Kochi"
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      State *
                    </label>
                    <Input
                      name="state"
                      value={customer.state}
                      onChange={handleChange}
                      placeholder="Kerala"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" /> Select Payment Method
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Razorpay Option */}
                  <label
                    className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${paymentMethod === 'razorpay'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-background hover:border-primary/40'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="accent-primary size-4"
                        />
                        <span className="font-bold text-foreground">Razorpay / Online</span>
                      </div>
                      <ShieldCheck className="size-5 text-emerald-600" />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      UPI, Credit/Debit Cards, NetBanking & Mobile Wallets via Razorpay gateway.
                    </p>
                  </label>

                  {/* COD Option */}
                  <label
                    className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-background hover:border-primary/40'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-primary size-4"
                        />
                        <span className="font-bold text-foreground">Cash on Delivery</span>
                      </div>
                      <CheckCircle2 className="size-5 text-primary" />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      Pay with cash when your package arrives at your doorstep.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Order Summary
                </h2>

                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3 py-1">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        {formatCurrency(product.price * quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (18% GST)</span>
                    <span className="font-semibold text-foreground">{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-base font-extrabold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-xl text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl h-13 text-base font-bold shadow-lg transition-transform active:scale-95"
                >
                  {loading ? (
                    'Processing Order...'
                  ) : paymentMethod === 'cod' ? (
                    'Confirm Order (Cash on Delivery)'
                  ) : (
                    <>
                      <Lock className="size-4 mr-2" /> Pay {formatCurrency(total)} Now
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Lock className="size-3 text-emerald-600" /> 256-Bit SSL Encrypted & Secure Checkout
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
