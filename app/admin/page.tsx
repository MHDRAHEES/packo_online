'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/context/authContext'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard')
    }
  }, [loading, user, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading admin panel...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbf8_0%,#f1f6f0_100%)] px-4 py-12">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-background p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Admin panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Manage your storefront</h1>
            <p className="mt-2 text-sm text-muted-foreground">Products, orders, users, and promotions.</p>
          </div>
          <Button variant="outline" onClick={() => logout().finally(() => router.push('/'))}>
            Log out
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">Products</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create, edit, and publish catalog items.</p>
          </section>
          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">Orders</h2>
            <p className="mt-2 text-sm text-muted-foreground">Review new purchases and payment status.</p>
          </section>
          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">Customers</h2>
            <p className="mt-2 text-sm text-muted-foreground">Monitor registered users and account roles.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
