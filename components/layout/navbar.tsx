'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Heart,
  Leaf,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/providers/cart-provider'
import { useWishlist } from '@/components/providers/wishlist-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categories } from '@/lib/data'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const router = useRouter()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
    setMobileOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'border-border bg-background/85 backdrop-blur-md'
          : 'border-transparent bg-background',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center  justify-between gap-4 px-4 sm:px-6 lg:h-18 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Image
              src="/images/logo.png"
              alt="Verdant Logo"
              width={200}
              height={80}
              priority
              className="w-24 h-auto" // 96px wide
            />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Packo.ofc
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.slice(0, 2).map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              aria-expanded={catOpen}
            >
              Categories
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  catOpen && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full w-64 pt-2"
                >
                  <div className="grid gap-1 rounded-2xl border border-border bg-popover p-2 shadow-xl">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        // href={`/shop?category=${c.slug}`}
                        href="/"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.productCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {navLinks.slice(2).map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Search (desktop) */}
        <form
          onSubmit={submitSearch}
          className="ml-auto hidden max-w-xs flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 rounded-full pl-9"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 md:ml-2">
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative rounded-full"
            aria-label="Wishlist"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <Badge count={wishlistCount} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative rounded-full"
            aria-label="Cart"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && <Badge count={itemCount} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="hidden rounded-full sm:inline-flex"
            aria-label="Account"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <User className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="space-y-4 px-4 py-4 sm:px-6">
              <form onSubmit={submitSearch} className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="rounded-full pl-9"
                  aria-label="Search products"
                />
              </form>
              <nav className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div>
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      // href={`/shop?category=${c.slug}`}
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavItem({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
    >
      {label}
    </Link>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {count > 9 ? '9+' : count}
    </span>
  )
}
