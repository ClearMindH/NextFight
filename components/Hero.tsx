'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/** Fond d’accueil — tunnel de marche d’aréna MMA (logos retirés, copie locale) */
const HERO_SRC = process.env.NEXT_PUBLIC_HERO_BACKGROUND ?? '/images/hero-bg.jpg'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={HERO_SRC}
          alt="Ambiance octogone MMA"
          fill
          priority
          className="object-cover object-center scale-[0.88]"
          sizes="100vw"
        />
      </div>
      {/* Assombrissement de base pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-background/55" />
      {/* Teinte dorée pour s'accorder à la charte (gold #c9a227) */}
      <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
      {/* Dégradés haut/bas pour fondre le wallpaper dans le fond noir */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/40" />
      {/* Vignettage radial doré subtil */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(201,162,39,0.12) 0%, rgba(5,5,5,0) 45%, rgba(5,5,5,0.7) 100%)',
        }}
      />

      <div className="relative z-10 container-content px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-medium uppercase tracking-[0.25em] text-gold"
        >
          Pronostics MMA
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto"
        >
          Pronostics MMA fiables pour chaque combat.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Pronostics et analyses statistiques pour l&apos;UFC, la PFL, le KSW, ARES et Hexagone MMA —
          sans paris sportifs.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/ufc-pronostics"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-gold/10"
          >
            Pronostics UFC
            <ArrowRight size={16} />
          </Link>
          <Link
            href="#events"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium backdrop-blur transition-colors hover:border-gold/40 hover:text-gold"
          >
            Prochains combats
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#events" className="text-xs text-muted hover:text-foreground transition-colors">
          Voir le calendrier ↓
        </a>
      </motion.div>
    </section>
  )
}
