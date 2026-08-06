'use client'

import { motion } from 'framer-motion'
import { Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Subscribed!', {
      description: 'Thanks for joining the Packo.ofc list.',
    })
    setEmail('')
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 1, y: 24 }}
        whileInView={{ opacity: 3, y: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center sm:px-12"
      >
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 size-56 rounded-full bg-primary-foreground/10 blur-2xl" />

        <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15 text-primary-foreground">
          <Mail className="size-6" />
        </span>
        <h2 className="relative mt-5 font-heading text-2xl font-bold text-primary-foreground sm:text-3xl text-balance">
          Join the Packo.ofc newsletter
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/80">
          Get early access to new arrivals, exclusive offers and seasonal sales.
        </p>

        <form
          onSubmit={submit}
          className="relative mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="h-12 flex-1 border-transparent bg-primary-foreground text-foreground"
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-lg bg-primary-foreground px-6 text-primary hover:bg-primary-foreground/90"
          >
            Subscribe
            <Send className="size-4" />
          </Button>
        </form>
      </motion.div>
    </section>
  )
}
