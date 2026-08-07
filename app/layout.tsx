import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Suspense } from 'react'

import { AuthProvider } from '@/components/context/authContext'
import { CartProvider } from '@/components/providers/cart-provider'
import { WishlistProvider } from '@/components/providers/wishlist-provider'
import { ProductProvider } from '@/components/providers/product_provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Verdant — Premium Online Shopping',
  description:
    'Verdant is a modern, premium e-commerce store offering electronics, fashion, home, grocery, accessories and beauty products with a seamless shopping experience.',
  generator: 'v0.app',
  keywords: [
    'ecommerce',
    'online shopping',
    'electronics',
    'fashion',
    'beauty',
    'home',
    'grocery',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0F5132',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light ${inter.variable} ${poppins.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider>
            <AuthProvider>
              <ProductProvider>
                <CartProvider>
                  <WishlistProvider>
                    {children}
                    <Toaster />
                  </WishlistProvider>
                </CartProvider>
              </ProductProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}