'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { organizations } from '@/data/organizations'
import { NextFightBrand } from '@/components/NextFightBrand'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import { OrgBrandTagline } from '@/components/OrgBrandName'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

const staticLinks = [
  { href: '/#events', label: 'Combats' },
  { href: '/resultats', label: 'Résultats' },
  { href: '/pricing', label: 'Tarifs' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [mobilePromoOpen, setMobilePromoOpen] = useState(false)
  const promoRef = useRef<HTMLDivElement>(null)
  const { status, isPremium, loading } = useSubscription()
  const loggedIn = Boolean(status.email)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (promoRef.current && !promoRef.current.contains(e.target as Node)) {
        setPromoOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/95 border-b border-border backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="container-content flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <NextFightBrand iconSize="md" />

        <nav className="hidden items-center gap-8 md:flex">
          <div className="relative" ref={promoRef}>
            <button
              type="button"
              onClick={() => setPromoOpen((o) => !o)}
              className={cn(
                'group relative flex items-center gap-1 text-sm transition-colors',
                promoOpen ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
              aria-expanded={promoOpen}
              aria-haspopup="true"
            >
              Organisations
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', promoOpen && 'rotate-180')}
              />
              <span
                className={cn(
                  'absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300',
                  promoOpen ? 'w-full' : 'w-0 group-hover:w-full',
                )}
              />
            </button>

            <AnimatePresence>
              {promoOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-50 mt-3 w-[min(100vw-2rem,26rem)] -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                    Choisir une organisation
                  </p>
                  <ul className="space-y-0.5">
                    {organizations.map((org) => (
                        <li key={org.id}>
                          <Link
                            href={org.seoPathFr}
                            onClick={() => setPromoOpen(false)}
                            className="group flex flex-col items-start gap-1 rounded-xl px-3 py-3.5 transition-colors hover:bg-background/60"
                          >
                            <OrgBrandLogo orgId={org.id} size="md" glow="soft" />
                            <OrgBrandTagline orgId={org.id} className="opacity-80" />
                          </Link>
                        </li>
                    ))}
                  </ul>
                  <Link
                    href="/#promotions"
                    onClick={() => setPromoOpen(false)}
                    className="mt-1 block rounded-xl px-3 py-2 text-center text-xs text-muted transition-colors hover:bg-background/60 hover:text-gold"
                  >
                    Voir toutes les organisations
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {staticLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !loggedIn && (
            <Link
              href="/login"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Se connecter
            </Link>
          )}
          <Link
            href="/account"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Compte
          </Link>
          {isPremium ? (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold">
              Premium
            </span>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Passer Premium
            </Link>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-foreground"
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
            transition={{ duration: 0.3 }}
            className="border-t border-border bg-background md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              <button
                type="button"
                onClick={() => setMobilePromoOpen((o) => !o)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card hover:text-foreground"
              >
                Organisations
                <ChevronDown
                  size={16}
                  className={cn('transition-transform', mobilePromoOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {mobilePromoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pl-2"
                  >
                    {organizations.map((org) => (
                      <Link
                        key={org.id}
                        href={org.seoPathFr}
                        onClick={() => {
                          setMobileOpen(false)
                          setMobilePromoOpen(false)
                        }}
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-3 hover:bg-card/80"
                      >
                        <OrgBrandLogo orgId={org.id} size="md" glow="soft" />
                        <OrgBrandTagline orgId={org.id} className="text-left" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {staticLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {!loading && !loggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-card hover:text-foreground"
                >
                  Se connecter
                </Link>
              )}
              <Link
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
              </Link>
              {!isPremium && (
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background"
                >
                  Passer Premium
                </Link>
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
    <Link href={href} className="group relative text-sm text-muted transition-colors hover:text-foreground">
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}
