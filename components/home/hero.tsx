'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image with dark green overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[oklch(0.28_0.07_156)]/82" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.06_156)] via-transparent to-transparent" />
      </div>

      {/* Floating accents */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[8%] top-24 -z-10 size-40 rounded-full bg-[oklch(0.6_0.12_162)]/25 blur-2xl"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[6%] bottom-16 -z-10 size-52 rounded-full bg-[oklch(0.5_0.1_160)]/25 blur-3xl"
      />

      <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl"
        >
          <motion.span
      
            className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur"
          >
            <ShoppingBag className="size-4" />
            New season · up to 40% off
          </motion.span>

          <motion.h1
       
            className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground text-balance sm:text-6xl lg:text-7xl"
          >
            Premium products for a life well lived
          </motion.h1>

          <motion.p
         
            className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85 text-pretty"
          >
         Discover premium car accessories, fresh sprays, and travel kits designed for every journey.
          </motion.p>

          <motion.div
       
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-12 rounded-full bg-primary-foreground px-7 text-base text-primary hover:bg-primary-foreground/90"
              nativeButton={false}
              // render={<Link href="/shop" />}
            >
              Shop Now
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-foreground/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              nativeButton={false}
              // render={<Link href="/shop" />}
            >
              Explore Collection
            </Button>
          </motion.div>

          <motion.div
          
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-primary-foreground/80"
          >
            {[
              ['10k+', 'Happy customers'],
              ['500+', 'Premium products'],
              ['4.9', 'Average rating'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-heading text-2xl font-bold text-primary-foreground">
                  {value}
                </p>
                <p className="text-sm">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-primary-foreground/70"
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  )
}
