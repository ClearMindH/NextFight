'use client'

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/utils/cn'

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.5 }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
