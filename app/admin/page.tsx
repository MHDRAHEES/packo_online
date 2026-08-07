'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
  Search,
  Eye,
  LogOut,
  ShieldAlert,
  CreditCard,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  Lock,
} from 'lucide-react'
import { useAuth } from '@/components/context/authContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, resolveValidProductImage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Order, OrderStatus, Product, UploadImageResult } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'upload' | 'products'>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Product Management State
  const [productList, setProductList] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // New Product Form State
  const [newProdName, setNewProdName] = useState('')
  const [newProdCategory, setNewProdCategory] = useState('Tissues & Papers')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [newProdDiscountPrice, setNewProdDiscountPrice] = useState('')
  const [newProdStock, setNewProdStock] = useState('50')
  const [newProdImage, setNewProdImage] = useState('/images/products/green_tissue.png')
  const [newProdDescription, setNewProdDescription] = useState('')
  const [newProdFeatured, setNewProdFeatured] = useState(false)
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [uploadingProdImage, setUploadingProdImage] = useState(false)

  // Image Upload State
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadImageResult[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Fetch Products
  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const data = await api.getProducts()
      setProductList(data)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProdName.trim() || !newProdPrice) {
      toast.error('Please enter product title and price')
      return
    }
    setCreatingProduct(true)
    try {
      const created = await api.createProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        price: Number(newProdPrice),
        discountPrice: Number(newProdDiscountPrice || 0),
        stock: Number(newProdStock || 0),
        image: newProdImage,
        description: newProdDescription.trim() || 'High quality premium store product.',
        isFeatured: newProdFeatured,
      })
      toast.success(`Product "${created.name}" created & published successfully!`)
      setProductList((prev) => [created, ...prev])
      setNewProdName('')
      setNewProdPrice('')
      setNewProdDiscountPrice('')
      setNewProdDescription('')
    } catch (err) {
      toast.error('Failed to create product. Please try again.')
    } finally {
      setCreatingProduct(false)
    }
  }

  // Handle Product Image Upload
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingProdImage(true)
    try {
      const res = await api.uploadImage(files[0])
      setNewProdImage(res.url)
      toast.success('Product image uploaded successfully!')
    } catch (err) {
      toast.error('Failed to upload product image')
    } finally {
      setUploadingProdImage(false)
    }
  }

  // Fetch Admin Orders
  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await api.getAllOrders()
      setOrders(data)
    } catch (err) {
      toast.error('Failed to load admin orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        const timeout = setTimeout(() => {
          router.replace('/dashboard')
        }, 1500)
        return () => clearTimeout(timeout)
      } else {
        fetchOrders()
        fetchProducts()
      }
    }
  }, [loading, user, router])

  // Handle Order Status Update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await api.updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId || o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      )
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === orderId)) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null))
      }
      toast.success(`Order #${orderId} status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Handle Single/Multiple Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      if (files.length === 1) {
        const res = await api.uploadImage(files[0])
        setUploadedImages((prev) => [res, ...prev])
        toast.success('Image uploaded successfully!')
      } else {
        const fileArray = Array.from(files)
        const results = await api.uploadImages(fileArray)
        setUploadedImages((prev) => [...results, ...prev])
        toast.success(`${results.length} images uploaded successfully!`)
      }
    } catch (err) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Copy Image URL to Clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success('Image URL copied to clipboard!')
    setTimeout(() => setCopiedUrl(null), 2500)
  }

  // Calculated Sales & Order Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || o.totalPrice || 0), 0)
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    const processingCount = orders.filter((o) => (o.orderStatus || 'Processing') === 'Processing').length
    const shippedCount = orders.filter((o) => o.orderStatus === 'Shipped').length
    const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length
    const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length

    const razorpayCount = orders.filter((o) => o.paymentMethod === 'razorpay').length
    const codCount = orders.filter((o) => o.paymentMethod === 'cod').length

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      razorpayCount,
      codCount,
    }
  }, [orders])

  // Filtered Orders for Table View
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = order.orderStatus || 'Processing'
      const matchesStatus = statusFilter === 'all' || currentStatus.toLowerCase() === statusFilter.toLowerCase()

      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query) ||
        (order._id && order._id.toLowerCase().includes(query)) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)

      return matchesStatus && matchesQuery
    })
  }, [orders, statusFilter, searchQuery])

  // Initial Auth Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-sm font-medium tracking-wide text-slate-400">Verifying Admin Credentials...</p>
        </div>
      </div>
    )
  }

  // Access Restriction Guard
  if (!user || user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-900/40 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-100">Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-400">
            This dashboard is strictly reserved for user accounts with privilege <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-rose-400 font-mono">role: "admin"</code>.
          </p>
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400 text-left">
            <p className="font-semibold text-slate-300">Current Session Info:</p>
            <p className="mt-1">User: {user ? user.name : 'Not Logged In'}</p>
            <p>Role: <span className="font-bold text-amber-400">{user?.role || 'Guest'}</span></p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              onClick={() => router.push('/login')}
            >
              Sign In as Admin
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-800 text-slate-300 hover:bg-slate-800"
              onClick={() => router.push('/dashboard')}
            >
              Return to Customer Dashboard
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Packo Admin</h1>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  role: "admin"
                </span>
              </div>
              <p className="text-xs text-slate-400">Sales Analytics, Order Tracking & Asset Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs border-0 shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Store
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-200">{user.name}</p>
                <p className="text-slate-400 text-[10px]">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout().then(() => router.push('/'))}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            <TrendingUp className="h-4 w-4" />
            Overview & Sales Report
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Orders & Status Tracker ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'upload'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            <Upload className="h-4 w-4" />
            Image Upload Center
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === 'products'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            <PackageCheck className="h-4 w-4" />
            Upload Product & Catalog ({productList.length})
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TAB 1: OVERVIEW & SALES REPORT */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Cards Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
                  <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                  <span>Real-time backend total</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Orders</span>
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/20">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{metrics.totalOrders}</p>
                <p className="mt-2 text-xs text-slate-400">Customer orders logged in system</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Average Order Value</span>
                  <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(metrics.avgOrderValue)}
                </p>
                <p className="mt-2 text-xs text-slate-400">Average basket value per order</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-lg hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Delivered Orders</span>
                  <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-400 border border-teal-500/20">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{metrics.deliveredCount}</p>
                <p className="mt-2 text-xs text-teal-400">
                  {metrics.totalOrders > 0
                    ? `${Math.round((metrics.deliveredCount / metrics.totalOrders) * 100)}% fulfillment rate`
                    : '0% fulfillment'}
                </p>
              </div>
            </div>

            {/* Sales Distribution & Order Status Report */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Order Status Breakdown */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">Order Fulfillment Status Report</h2>
                    <p className="text-xs text-slate-400">Current distribution of orders across active stages</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('orders')}
                    className="border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    View All Orders <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase">Processing</span>
                      <Clock className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{metrics.processingCount}</p>
                    <p className="mt-1 text-[11px] text-amber-400/80">Awaiting shipment</p>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase">Shipped</span>
                      <Truck className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{metrics.shippedCount}</p>
                    <p className="mt-1 text-[11px] text-blue-400/80">In transit</p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase">Delivered</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{metrics.deliveredCount}</p>
                    <p className="mt-1 text-[11px] text-emerald-400/80">Completed</p>
                  </div>

                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase">Cancelled</span>
                      <XCircle className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{metrics.cancelledCount}</p>
                    <p className="mt-1 text-[11px] text-rose-400/80">Refunded / Closed</p>
                  </div>
                </div>

                {/* Status Progress Bar Visual */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fulfillment Progress</span>
                    <span>{metrics.deliveredCount} of {metrics.totalOrders} Delivered</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{
                        width: `${metrics.totalOrders > 0 ? (metrics.deliveredCount / metrics.totalOrders) * 100 : 0}%`,
                      }}
                      title="Delivered"
                    />
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{
                        width: `${metrics.totalOrders > 0 ? (metrics.shippedCount / metrics.totalOrders) * 100 : 0}%`,
                      }}
                      title="Shipped"
                    />
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{
                        width: `${metrics.totalOrders > 0 ? (metrics.processingCount / metrics.totalOrders) * 100 : 0}%`,
                      }}
                      title="Processing"
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{
                        width: `${metrics.totalOrders > 0 ? (metrics.cancelledCount / metrics.totalOrders) * 100 : 0}%`,
                      }}
                      title="Cancelled"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods & Admin Privileges Info */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Payment Gateway Breakdown</h3>
                  <p className="text-xs text-slate-400 mt-1">Orders processed by method</p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">Razorpay Online</span>
                      </div>
                      <span className="text-xs font-bold text-white">{metrics.razorpayCount} orders</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-400" />
                        <span className="text-xs font-semibold text-slate-200">Cash on Delivery (COD)</span>
                      </div>
                      <span className="text-xs font-bold text-white">{metrics.codCount} orders</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <UserCheck className="h-4 w-4" />
                    <span>Admin Privilege Active</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Logged in as <strong className="text-slate-200">{user.email}</strong> with full catalog and status mutation access.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Store Orders</h3>
                  <p className="text-xs text-slate-400">Latest purchases requiring fulfillment attention</p>
                </div>
                <Button
                  onClick={() => setActiveTab('orders')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-xs text-white"
                >
                  Manage All Orders
                </Button>
              </div>

              <div className="divide-y divide-slate-800 overflow-x-auto">
                {orders.slice(0, 5).map((order) => {
                  const status = order.orderStatus || 'Processing'
                  return (
                    <div key={order.id} className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-800/30 rounded-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                          #{order.id.replace('VRD-', '')}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{order.customer.name}</p>
                          <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">{formatCurrency(order.total || order.totalPrice || 0)}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">{order.paymentMethod}</p>
                        </div>

                        <span
                          className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : status === 'Shipped'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : status === 'Cancelled'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                        >
                          {status}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order)
                            setActiveTab('orders')
                          }}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & STATUS TRACKER */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by Order ID, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${statusFilter === tab
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Order ID & Date</th>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Items Count</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4 text-right">Actions / Track Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          No orders found matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const currentStatus = (order.orderStatus || 'Processing') as OrderStatus
                        const isUpdating = updatingOrderId === (order.id || order._id)

                        return (
                          <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-mono">
                              <span className="font-bold text-emerald-400">#{order.id}</span>
                              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{order.customer.name}</p>
                              <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                              <p className="text-[10px] text-slate-500">{order.customer.phone}</p>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </span>
                            </td>

                            <td className="px-6 py-4 font-mono uppercase text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.paymentMethod === 'razorpay'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  }`}
                              >
                                {order.paymentMethod}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-bold text-white">
                              {formatCurrency(order.total || order.totalPrice || 0)}
                            </td>

                            <td className="px-6 py-4">
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${currentStatus === 'Delivered'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : currentStatus === 'Shipped'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                      : currentStatus === 'Cancelled'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${currentStatus === 'Delivered' ? 'bg-emerald-400' :
                                    currentStatus === 'Shipped' ? 'bg-blue-400' :
                                      currentStatus === 'Cancelled' ? 'bg-rose-400' : 'bg-amber-400'
                                  }`} />
                                {currentStatus}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Change Status Dropdown */}
                                <select
                                  disabled={isUpdating}
                                  value={currentStatus}
                                  onChange={(e) => handleStatusChange(order.id || order._id || '', e.target.value as OrderStatus)}
                                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:ring-0 disabled:opacity-50 font-medium cursor-pointer"
                                >
                                  <option value="Processing">Set: Processing</option>
                                  <option value="Shipped">Set: Shipped</option>
                                  <option value="Delivered">Set: Delivered</option>
                                  <option value="Cancelled">Set: Cancelled</option>
                                </select>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                  className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IMAGE UPLOADER CENTER */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ImageIcon className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Product Image Asset Manager</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Upload catalog assets or banners to the Cloudinary / API server storage. Uploaded URLs can be attached directly to product listings.
                </p>
              </div>

              {/* Upload Drop Zone Button */}
              <div className="mx-auto max-w-lg">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-950/60 rounded-2xl p-8 cursor-pointer transition-all hover:bg-slate-900">
                  <Upload className={`h-10 w-10 text-emerald-400 ${uploading ? 'animate-bounce' : ''}`} />
                  <span className="mt-3 text-sm font-semibold text-slate-200">
                    {uploading ? 'Uploading images to server...' : 'Click to select or drag images here'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">Supports PNG, JPG, WEBP, SVG (Single or Multiple)</span>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Gallery of Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Recently Uploaded Assets ({uploadedImages.length})</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedImages([])}
                    className="text-xs text-slate-400 hover:text-rose-400"
                  >
                    Clear Gallery
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg hover:border-emerald-500/50 transition-all"
                    >
                      <div className="relative h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                        <Image
                          src={img.url}
                          alt={`Uploaded asset ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-3 bg-slate-900 flex items-center justify-between border-t border-slate-800">
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px] font-mono">
                          {img.public_id || `asset_${idx + 1}`}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(img.url)}
                          className="h-7 border-slate-800 bg-slate-950 text-[11px] text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500"
                        >
                          {copiedUrl === img.url ? (
                            <>
                              <Check className="mr-1 h-3 w-3 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" /> Copy URL
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRODUCT MANAGEMENT & UPLOAD NEW PRODUCT */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Upload New Product & Inventory Catalog</h2>
                <p className="text-xs text-slate-400 mt-1">Publish new storefront products and inspect full inventory specs</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
                Refresh Catalog
              </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column: Upload New Product Form */}
              <div className="lg:col-span-1">
                <form
                  onSubmit={handleCreateProduct}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-5 sticky top-24"
                >
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Upload className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Upload New Product</h3>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title / Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ultra Soft Facial Tissues (Pack of 3)"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl"
                      required
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    >
                      <option value="Tissues & Papers">Tissues & Papers</option>
                      <option value="Packaging & Boxes">Packaging & Boxes</option>
                      <option value="Combo Packs">Combo Packs</option>
                      <option value="Skincare & Beauty">Skincare & Beauty</option>
                      <option value="Electronics & Home">Electronics & Home</option>
                      <option value="General Store">General Store</option>
                    </select>
                  </div>

                  {/* Price & Discount Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹) *</label>
                      <Input
                        type="number"
                        placeholder="299"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Price (₹)</label>
                      <Input
                        type="number"
                        placeholder="399"
                        value={newProdDiscountPrice}
                        onChange={(e) => setNewProdDiscountPrice(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Stock Quantity & Featured Toggle */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Units</label>
                      <Input
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                      />
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFeaturedToggle"
                        checked={newProdFeatured}
                        onChange={(e) => setNewProdFeatured(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      />
                      <label htmlFor="isFeaturedToggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
                        Featured Item
                      </label>
                    </div>
                  </div>

                  {/* Product Image URL & Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Image</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-300 text-xs rounded-xl flex-1"
                      />
                      <label className="cursor-pointer rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-white border border-slate-700 flex items-center shrink-0">
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        {uploadingProdImage ? 'Uploading...' : 'Browse'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="hidden"
                          disabled={uploadingProdImage}
                        />
                      </label>
                    </div>

                    {/* Image Preview */}
                    {newProdImage && (
                      <div className="mt-2 relative h-24 w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800">
                        <Image
                          src={resolveValidProductImage(newProdImage)}
                          alt="Product preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter product features, specs, and details..."
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={creatingProduct}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 py-2.5"
                  >
                    {creatingProduct ? 'Publishing Product...' : '+ Create & Publish Product'}
                  </Button>
                </form>
              </div>

              {/* Right Column: Existing Products Inventory & Details Button */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white">Product Inventory ({productList.length})</h3>
                    <span className="text-xs text-slate-400">Click "View Details" to inspect any product</span>
                  </div>

                  {loadingProducts ? (
                    <div className="py-12 text-center text-xs text-slate-400">Loading catalog...</div>
                  ) : productList.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">No products found.</div>
                  ) : (
                    <div className="divide-y divide-slate-800/80 max-h-[650px] overflow-y-auto pr-1">
                      {productList.map((prod) => (
                        <div key={prod.id || prod._id} className="flex items-center justify-between py-3 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                              <Image
                                src={resolveValidProductImage(prod.image)}
                                alt={prod.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-200">{prod.name}</h4>
                                {prod.featured && (
                                  <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {prod.category} • <span className="text-emerald-400 font-bold">{formatCurrency(prod.price)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              prod.inStock
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {prod.inStock ? `${prod.stockCount || 50} in stock` : 'Out of stock'}
                            </span>

                            {/* VIEW DETAILS BUTTON */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProduct(prod)}
                              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold rounded-xl"
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Order Inspection</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">Order #{selectedOrder.id}</h2>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </Button>
            </div>

            {/* Status Change Selector in Modal */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Update Order Status</p>
                <p className="text-xs text-slate-300">Change status to sync customer notification</p>
              </div>
              <div className="flex items-center gap-2">
                {(['Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedOrder.id || selectedOrder._id || '', st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedOrder.orderStatus === st
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Customer Information</p>
                <p className="text-sm font-semibold text-white">{selectedOrder.customer.name}</p>
                <p className="text-xs text-slate-400">{selectedOrder.customer.email}</p>
                <p className="text-xs text-slate-400">{selectedOrder.customer.phone}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Shipping Address</p>
                <p className="text-xs font-medium text-slate-200">{selectedOrder.customer.address}</p>
                <p className="text-xs text-slate-400">
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.zip}
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase">Ordered Products ({selectedOrder.items.length})</p>
              <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg bg-slate-900 overflow-hidden border border-slate-800">
                        <Image
                          src={resolveValidProductImage(item.product?.image || (item as any)?.image)}
                          alt={item.product?.name || 'Product'}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatCurrency(item.product.price)}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {formatCurrency(item.quantity * item.product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Payment Summary */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Payment Method: {selectedOrder.paymentMethod}</p>
                <p className="text-xs text-emerald-400 font-medium">
                  {selectedOrder.isPaid ? 'Payment Verified ✓' : 'Pending Payment / COD'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Order Amount</span>
                <p className="text-xl font-extrabold text-white">
                  {formatCurrency(selectedOrder.total || selectedOrder.totalPrice || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Product Details Inspection</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{selectedProduct.name}</h2>
                <p className="text-xs text-slate-400">Category: {selectedProduct.category}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative h-44 w-full sm:w-44 rounded-2xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                <Image
                  src={resolveValidProductImage(selectedProduct.image)}
                  alt={selectedProduct.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 text-xs flex-1">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Price Details</span>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(selectedProduct.price)}
                    {selectedProduct.originalPrice && (
                      <span className="ml-2 text-xs text-slate-500 line-through">
                        {formatCurrency(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Inventory & Rating</span>
                  <p className="text-slate-200 font-semibold mt-0.5">
                    Stock: {selectedProduct.stockCount || 50} units • Rating: ★ {selectedProduct.rating || 5.0} ({selectedProduct.reviewCount || 0} reviews)
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Product Description</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {selectedProduct.description || selectedProduct.shortDescription || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <Button
                onClick={() => setSelectedProduct(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs px-5"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
