'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ value, suffix = '', duration = 1.2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(value * eased)
      setDisplay(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return (
    <motion.span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </motion.span>
  )
}
