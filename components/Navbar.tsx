'use client'

import { useEffect, useState } from 'react'
import { FastLink } from '@/components/navigation/FastLink'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NextFightBrand } from '@/components/NextFightBrand'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

const navLinks = [
  { href: '/ufc-pronostics', label: 'Pronostics UFC' },
  { href: '/resultats', label: 'Résultats' },
  { href: '/pricing', label: 'Tarifs' },
]

type NavbarProps = {
  /** Décalage sous la bannière urgence (px). */
  topOffset?: number
}

export function Navbar({ topOffset = 0 }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { status, isPremium, loading } = useSubscription()
  const loggedIn = Boolean(status.email)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-200',
        scrolled ? 'bg-background/95 border-b border-border backdrop-blur-md' : 'bg-transparent',
      )}
      style={{ top: topOffset }}
    >
      <div className="container-content flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <NextFightBrand iconSize="md" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !loggedIn && (
            <FastLink
              href="/login"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Se connecter
            </FastLink>
          )}
          <FastLink
            href="/account"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Compte
          </FastLink>
          {isPremium ? (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
              Premium
            </span>
          ) : (
            <FastLink
              href="/pricing"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Passer Premium
            </FastLink>
          )}
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <FastLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card hover:text-foreground"
                >
                  {link.label}
                </FastLink>
              ))}
              {!loading && !loggedIn && (
                <FastLink
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card hover:text-foreground"
                >
                  Se connecter
                </FastLink>
              )}
              <FastLink
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card"
              >
                Compte
                {isPremium && (
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                    Premium
                  </span>
                )}
              </FastLink>
              {!isPremium && (
                <FastLink
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background"
                >
                  Passer Premium
                </FastLink>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <FastLink href={href} className="group relative text-sm text-muted transition-colors hover:text-foreground">
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-200 group-hover:w-full" />
    </FastLink>
  )
}
