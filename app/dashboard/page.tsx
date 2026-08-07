'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/components/context/authContext'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fcf8_0%,#f0f7f2_100%)] px-4 py-12">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-background p-8 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Account area</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Welcome, {user.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Role: {user.role}</p>
          </div>
          <Button variant="outline" onClick={() => logout().finally(() => router.push('/'))}>
            Log out
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">Manage your personal details and account preferences.</p>
          </section>

          <section className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">Orders</h2>
            <p className="mt-2 text-sm text-muted-foreground">Track current and past purchases from your account.</p>
          </section>

          {user.role === 'admin' ? (
            <section className="rounded-2xl border border-border bg-primary/5 p-6">
              <h2 className="text-lg font-semibold text-foreground">Admin tools</h2>
              <p className="mt-2 text-sm text-muted-foreground">Manage products, categories, promos, and orders from the backend.</p>
              <Link href="/admin" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                Open admin panel →
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  )
}
