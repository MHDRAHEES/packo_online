import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { ProductCard } from '@/components/product/product-card'
import { api } from '@/lib/api'

export default async function ShopPage() {
  const products = await api.getProducts()
  const categories = await api.getCategories()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              All Products
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore our complete collection of premium items ({products.length} products available).
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
