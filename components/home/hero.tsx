'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles, ShieldCheck, Truck, Star, Award } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden min-h-[90vh] flex items-center bg-slate-950 text-white">
      {/* Background Image Layer with Gradient Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Desktop Hero Image */}
        <Image
          src="/images/her_3.jpeg"
          alt="Packo Storefront Hero"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="hidden object-cover object-center md:block opacity-60 scale-105 transition-all duration-1000"
        />

        {/* Mobile Hero Image */}
        <Image
          src="/images/hero_2.png"
          alt="Packo Storefront Mobile Hero"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-top md:hidden opacity-60"
        />

        {/* Dark Emerald Dual Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </div>

      {/* Floating Animated Glass Accent Orbs */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[12%] top-20 -z-10 size-72 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[8%] bottom-16 -z-10 size-96 rounded-full bg-teal-600/15 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl space-y-6"
        >
          {/* Top Category Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <Sparkles className="size-4 text-emerald-400" />
              <span>Premium Automotive Essentials & Storefront 2026</span>
            </span>
          </motion.div>

          {/* Hero Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Elevate Every Drive With{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Packo Excellence
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 font-normal"
          >
            Discover luxury car tissue boxes, long-lasting ambient car sprays, and refined travel accessories crafted for ultimate comfort and elegance.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            <Button
              size="lg"
              className="h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 text-base shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"
              nativeButton={false}
              render={<Link href="/shop" />}
            >
              Shop Collection Now
              <ArrowRight className="ml-2 size-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-13 rounded-2xl border-slate-700 bg-slate-900/60 backdrop-blur-md px-8 text-base text-slate-100 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all active:scale-[0.98]"
              nativeButton={false}
              render={<Link href="/shop?featured=true" />}
            >
              Featured Products
            </Button>
          </motion.div>

          {/* Key Metric Highlights & Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 sm:gap-10 max-w-xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-2xl sm:text-3xl font-heading">
                <span>10K+</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Satisfied Drivers</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-2xl sm:text-3xl font-heading">
                <span>4.9</span>
                <Star className="size-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Customer Rating</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-2xl sm:text-3xl font-heading">
                <span>100%</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Quality Guarantee</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        aria-hidden
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  )
}
