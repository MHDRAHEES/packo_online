'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/reveal'
import { StarRating } from '@/components/star-rating'
import type { Testimonial } from '@/lib/types'

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary-foreground">
          Loved by shoppers
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          What our customers say
        </h2>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 1, y: 24 }}
            whileInView={{ opacity: 1, y: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
          >
            <Quote className="size-8 text-accent-foreground/25" />
            <blockquote className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-foreground/90">
              {t.quote}
            </blockquote>
            <StarRating rating={t.rating} size={16} className="mt-5" />
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <Image
                src={t.avatar || '/placeholder.svg'}
                alt={t.name}
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {t.name}
                </p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
