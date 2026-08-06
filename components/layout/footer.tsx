import { AtSign, Globe, Leaf, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/about' },
      { label: 'Blog', href: '/about' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '/contact' },
      { label: 'Shipping', href: '/contact' },
      { label: 'Returns', href: '/contact' },
      { label: 'Track Order', href: '/account' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/about' },
      { label: 'Terms & Conditions', href: '/about' },
      { label: 'Cookie Policy', href: '/about' },
      { label: 'Accessibility', href: '/about' },
    ],
  },
]

const socials = [
  { label: 'Instagram', icon: AtSign, href: '#' },
  { label: 'Twitter', icon: Send, href: '#' },
  { label: 'Community', icon: MessageCircle, href: '#' },
  { label: 'Website', icon: Globe, href: '#' },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Image
                  src="/images/logo.png"
                  alt="Verdant Logo"
                  width={200}
                  height={80}
                  priority
                  className="w-24 h-auto" />
              </span>
              <span className="font-heading text-xl font-bold text-foreground">
                Packo.ofc
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Premium products across Accessories, perfumes, and travel kits, designed for a life well lived. Explore our curated collection and enjoy a
               sustainable shopping experience.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {`© ${new Date().getFullYear()} Verdant. All rights reserved.`}
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with care for a better shopping experience.
          </p>
        </div>
      </div>
    </footer>
  )
}
