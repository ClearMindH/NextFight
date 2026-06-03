import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

export function getSiteUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!url && process.env.VERCEL_URL?.trim()) {
    url = `https://${process.env.VERCEL_URL.trim()}`
  }
  if (!url) url = 'http://localhost:3000'
  return url.replace(/\/$/, '')
}
