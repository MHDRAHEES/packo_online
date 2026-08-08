'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/components/context/authContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await register({ name: form.name, email: form.email, password: form.password })
      if (user?.role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('Unable to create your account right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f5fbf6_0%,#eef7ef_100%)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-xl relative">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="rounded-xl border-emerald-800/20 text-foreground hover:bg-emerald-500/10 hover:text-primary text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Back to Store
          </Button>
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Create account</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Sign up for Verdant</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join to shop faster and access your account area.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="name">Full name</label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Jane Doe" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">Email</label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
