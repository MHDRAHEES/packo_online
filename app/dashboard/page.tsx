'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquarePlus,
  Check,
  User as UserIcon,
  Shield,
  Package,
  RefreshCw,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/components/context/authContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, resolveValidProductImage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Order, OrderStatus, Product } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Review Modal State
  const [reviewingProduct, setReviewingProduct] = useState<{
    id: string
    name: string
    image: string
    orderId: string
  } | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([])
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  // Handle Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}?`)) return
    setCancellingOrderId(orderId)
    try {
      await api.cancelOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o))
      )
      toast.success(`Order #${orderId} has been cancelled successfully.`)
    } catch (err) {
      toast.error('Failed to cancel order. Please try again.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Fetch User Orders
  const fetchUserOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await api.getMyOrders()
      setOrders(data)
    } catch (err) {
      console.error('Failed to load user orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else {
        fetchUserOrders()
      }
    }
  }, [loading, user, router])

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingProduct) return
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setSubmittingReview(true)
    try {
      await api.createReview(reviewingProduct.id, {
        rating,
        title: reviewTitle.trim() || 'Great product!',
        comment: reviewComment.trim(),
      })
      toast.success(`Thank you! Your review for "${reviewingProduct.name}" has been submitted.`)
      setReviewedProductIds((prev) => [...prev, `${reviewingProduct.orderId}_${reviewingProduct.id}`])
      setReviewingProduct(null)
      setRating(5)
      setReviewTitle('')
      setReviewComment('')
    } catch (err) {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbf8_0%,#f1f7f2_100%)] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Button
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-[0.98]"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>

          <Button
            variant="outline"
            onClick={() => logout().finally(() => router.push('/'))}
            className="rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>

        {/* User Welcome Card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    Welcome, {user.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                    <Shield className="h-3 w-3" />
                    role: "{user.role}"
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {user.role === 'admin' && (
              <Button
                nativeButton={false}
                render={<Link href="/admin" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20"
              >
                Open Admin Panel →
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Overview Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <UserIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Profile Details</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Full Name</span>
                  <p className="font-semibold text-foreground">{user.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Email Address</span>
                  <p className="font-semibold text-foreground">{user.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Account Role</span>
                  <p className="font-semibold text-foreground capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Member Status</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" /> Verified Customer
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* User Orders & Status Tracking Section */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">My Orders & Order Status</h2>
                    <p className="text-xs text-muted-foreground">Track purchase status and leave product reviews</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUserOrders}
                  className="rounded-xl border-border text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>

              {/* Orders List */}
              {loadingOrders ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Loading order history...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">No Orders Found</p>
                    <p className="text-xs text-muted-foreground mt-1">You haven't placed any purchases yet.</p>
                  </div>
                  <Button
                    nativeButton={false}
                    render={<Link href="/shop" />}
                    className="rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const status: OrderStatus = (order.orderStatus || 'Processing') as OrderStatus

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-border bg-background p-5 space-y-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Order Header & Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-primary">#{order.id}</span>
                              <span className="text-xs text-muted-foreground">
                                • {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Payment: <span className="uppercase font-mono font-semibold">{order.paymentMethod}</span> ({order.isPaid ? 'Paid ✓' : 'Pending'})
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status === 'Delivered'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : status === 'Shipped'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                    : status === 'Cancelled'
                                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                }`}
                            >
                              {status === 'Delivered' && <CheckCircle2 className="h-3.5 w-3.5" />}
                              {status === 'Shipped' && <Truck className="h-3.5 w-3.5" />}
                              {status === 'Processing' && <Clock className="h-3.5 w-3.5" />}
                              {status === 'Cancelled' && <XCircle className="h-3.5 w-3.5" />}
                              <span>Status: {status}</span>
                            </span>

                            {/* Cancel Order Button */}
                            {status !== 'Delivered' && status !== 'Cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={cancellingOrderId === (order.id || order._id)}
                                onClick={() => handleCancelOrder(order.id || order._id || '')}
                                className="rounded-full border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                {cancellingOrderId === (order.id || order._id) ? 'Cancelling...' : 'Cancel Order'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Order Progress Visualizer */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                            <span className={status === 'Processing' ? 'text-amber-600 font-bold' : ''}>1. Order Placed</span>
                            <span className={status === 'Shipped' ? 'text-blue-600 font-bold' : ''}>2. Shipped</span>
                            <span className={status === 'Delivered' ? 'text-emerald-600 font-bold' : ''}>3. Delivered</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                            <div
                              className={`h-full transition-all ${status === 'Cancelled'
                                  ? 'bg-rose-500 w-full'
                                  : status === 'Delivered'
                                    ? 'bg-emerald-500 w-full'
                                    : status === 'Shipped'
                                      ? 'bg-blue-500 w-2/3'
                                      : 'bg-amber-500 w-1/3'
                                }`}
                            />
                          </div>
                        </div>

                        {/* Items List & Review Action */}
                        <div className="divide-y divide-border/60">
                          {order.items.map((item, idx) => {
                            const prodId = item.product._id || item.product.id
                            const reviewKey = `${order.id}_${prodId}`
                            const isReviewed = reviewedProductIds.includes(reviewKey)

                            return (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-12 w-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                                    <Image
                                      src={resolveValidProductImage(item.product?.image || (item as any)?.image)}
                                      alt={item.product?.name || 'Product'}
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-foreground">{item.product.name}</h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      Qty: {item.quantity} × {formatCurrency(item.product.price)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                  <span className="text-xs font-bold text-foreground">
                                    {formatCurrency(item.quantity * item.product.price)}
                                  </span>

                                  {/* Give Review Button */}
                                  {isReviewed ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                      <Check className="h-3 w-3" /> Reviewed
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setReviewingProduct({
                                          id: prodId,
                                          name: item.product.name,
                                          image: item.product.image,
                                          orderId: order.id,
                                        })
                                      }
                                      className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold"
                                    >
                                      <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" />
                                      Give Review
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Order Footer Total */}
                        <div className="flex justify-between items-center border-t border-border/60 pt-3 text-xs">
                          <span className="text-muted-foreground font-medium">Grand Total</span>
                          <span className="text-sm font-extrabold text-foreground">
                            {formatCurrency(order.total || order.totalPrice || 0)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* GIVE REVIEW MODAL */}
      {reviewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase">Product Feedback</span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">Write a Review</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReviewingProduct(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            {/* Target Product Summary */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <div className="relative h-12 w-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                <Image
                  src={resolveValidProductImage(reviewingProduct.image)}
                  alt={reviewingProduct.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{reviewingProduct.name}</h3>
                <p className="text-xs text-muted-foreground">Order #{reviewingProduct.orderId}</p>
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-foreground">{rating} of 5 Stars</span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Review Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Premium quality & fast delivery!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              {/* Review Comment Body */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Detailed Review / Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Describe your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingProduct(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
