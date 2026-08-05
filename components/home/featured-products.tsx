import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-secondary-foreground">
              Handpicked for you
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Featured products
            </h2>
          </div>
          <Button
            variant="ghost"
            className="rounded-full text-primary hover:bg-accent"
            nativeButton={false}
            render={<Link href="/shop" />}
          >
            View all
            <ArrowRight className="size-4" />
          </Button>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
