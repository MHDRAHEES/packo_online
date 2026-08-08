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
    <footer className="mt-20 border-t border-emerald-900/40 bg-[#052918] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center rounded-2xl bg-white p-2 shadow-md group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png"
                  alt="Packo.ofc Logo"
                  width={120}
                  height={40}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="font-heading text-2xl font-extrabold tracking-tight text-white">
                Packo.ofc
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-emerald-100/80">
              Premium tissue boxes, packaging materials, and travel essentials designed for quality and sustainable living. Enjoy seamless online shopping and instant delivery.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border border-emerald-700/50 bg-emerald-900/40 text-emerald-200 transition-all hover:border-emerald-400 hover:bg-emerald-500 hover:text-white"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-emerald-300">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/70 transition-colors hover:text-white font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/40 pt-8 sm:flex-row text-xs text-emerald-200/70">
          <p className="font-medium">
            {`© ${new Date().getFullYear()} Packo.ofc. All rights reserved.`}
          </p>
          <p className="font-medium flex items-center gap-1">
            <span>Crafted with</span>
            <span className="text-emerald-400 font-bold">Dark Green & White Excellence</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
