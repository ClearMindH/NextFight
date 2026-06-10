'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type HeroPreviewAsideProps = {
  children: ReactNode
}

export function HeroPreviewAside({ children }: HeroPreviewAsideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className="mx-auto w-full max-w-md lg:max-w-none lg:pt-2"
    >
      {children}
    </motion.div>
  )
}
