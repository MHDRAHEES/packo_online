import { FeaturedCategories } from '@/components/home/featured-categories'
import { FeaturedProducts } from '@/components/home/featured-products'
import { Hero } from '@/components/home/hero'
import { Newsletter } from '@/components/home/newsletter'
import { Testimonials } from '@/components/home/testimonials'
import { VideoShowcase } from '@/components/home/video_showcase'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { api } from '@/lib/api'

export default async function HomePage() {
  const [categories, products, testimonials] = await Promise.all([
    api.getCategories(),
    api.getFeaturedProducts(),
    api.getTestimonials(),
  ])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCategories categories={categories} />
        <FeaturedProducts products={products} />
        <Testimonials testimonials={testimonials} />
        <VideoShowcase />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
