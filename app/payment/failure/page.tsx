'use client'

import { AlertTriangle, RefreshCw, ShoppingCart, HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reason =
    searchParams.get('reason') ||
    'Transaction was cancelled or declined by your bank / card issuer.'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(135deg,#fff8f8_0%,#fdf2f2_100%)] py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-destructive/20 bg-card p-8 shadow-xl sm:p-12 text-center">
            {/* Warning Icon */}
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-12" />
            </div>

            <span className="rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
              Payment Failed
            </span>

            <h1 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Payment Could Not Be Completed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We were unable to process your payment for order reference{' '}
              <strong className="text-foreground">{orderId || 'VRD-829104'}</strong>.
            </p>

            {/* Error Detail Box */}
            <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-destructive mb-1">
                Reason / Error Details
              </p>
              <p className="text-sm text-foreground font-medium">{reason}</p>
            </div>

            {/* Troubleshooting Tips */}
            <div className="mt-6 text-left rounded-2xl border border-border bg-muted/30 p-5 space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="size-4 text-primary" /> What can you do next?
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify your card details, expiration date, and CVV code.</li>
                <li>Ensure your account has sufficient balance or credit limit.</li>
                <li>Try choosing a different payment method (UPI, Cards, NetBanking, or COD).</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                nativeButton={false}
                render={<Link href="/checkout" />}
                className="rounded-full px-8 h-12 text-base font-bold shadow-md"
              >
                <RefreshCw className="size-4 mr-2" /> Try Payment Again
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/cart" />}
                className="rounded-full px-8 h-12 text-base font-semibold"
              >
                <ShoppingCart className="size-4 mr-2" /> Return to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
