'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { categoryIcons } from '@/lib/category-icons'
import type { Category } from '@/lib/types'

export function FeaturedCategories({
  categories,
}: {
  categories: Category[]
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary-foreground">
          Browse by category
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          Shop your favorite departments
        </h2>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category, i) => {
          const Icon = categoryIcons[category.icon] ?? ArrowUpRight
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 1, y: 20 }}
              whileInView={{ opacity: 3, y: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href="/"
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {category.productCount} items
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
