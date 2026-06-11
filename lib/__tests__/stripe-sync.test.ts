import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import {
  emailFromCheckoutSession,
  emailFromStripeCustomer,
  resolveEmailFromCompletedSession,
} from '@/lib/stripe-sync'
import { buildSubscriptionStatus } from '@/lib/premium'
import { isActivePremium, upsertSubscription } from '@/lib/subscription-store'
import { canAccessFightPrediction } from '@/lib/fight-access'
import type { Event, Fight } from '@/types'

function cardCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: 'cs_card_test',
    object: 'checkout.session',
    customer: 'cus_card_test',
    customer_details: {
      email: 'client.carte@exemple.com',
      address: null,
      name: 'Client Carte',
      phone: null,
      tax_exempt: 'none',
      tax_ids: [],
    },
    customer_email: 'client.carte@exemple.com',
    subscription: 'sub_card_test',
    status: 'complete',
    metadata: { planId: 'premium_monthly' },
  } as Stripe.Checkout.Session
}

describe('emailFromCheckoutSession (paiement carte)', () => {
  it('lit l’email saisi dans le formulaire Stripe Checkout', () => {
    const session = cardCheckoutSession()
    expect(emailFromCheckoutSession(session)).toBe('client.carte@exemple.com')
  })

  it('normalise la casse et les espaces', () => {
    const session = cardCheckoutSession({
      customer_details: {
        email: '  Client.Carte@Exemple.COM  ',
        address: null,
        name: null,
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      customer_email: null,
    })
    expect(emailFromCheckoutSession(session)).toBe('client.carte@exemple.com')
  })

  it('retombe sur customer_email si customer_details absent', () => {
    const session = {
      ...cardCheckoutSession(),
      customer_details: null,
      customer_email: 'fallback@exemple.com',
    } as Stripe.Checkout.Session
    expect(emailFromCheckoutSession(session)).toBe('fallback@exemple.com')
  })
})

describe('emailFromStripeCustomer', () => {
  it('lit l’email du client Stripe créé après paiement carte', () => {
    const customer = {
      id: 'cus_1',
      object: 'customer',
      email: 'client.carte@exemple.com',
      deleted: undefined,
    } as Stripe.Customer
    expect(emailFromStripeCustomer(customer)).toBe('client.carte@exemple.com')
  })
})

describe('resolveEmailFromCompletedSession (Apple Pay / Link)', () => {
  it('lit l’email Apple Pay depuis customer_details', () => {
    const session = {
      id: 'cs_apple',
      object: 'checkout.session',
      status: 'complete',
      customer: {
        id: 'cus_apple',
        object: 'customer',
        email: 'apple.hide@privaterelay.appleid.com',
      } as Stripe.Customer,
      customer_details: {
        email: 'apple.hide@privaterelay.appleid.com',
        address: null,
        name: 'Marie Dupont',
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      customer_email: null,
      subscription: 'sub_apple',
    } as Stripe.Checkout.Session

    expect(resolveEmailFromCompletedSession(session)).toBe(
      'apple.hide@privaterelay.appleid.com',
    )
  })

  it('lit l’email Stripe Link depuis le Customer expandé si customer_details absent', () => {
    const session = {
      id: 'cs_link',
      object: 'checkout.session',
      status: 'complete',
      customer: {
        id: 'cus_link',
        object: 'customer',
        email: 'marie.link@exemple.com',
      } as Stripe.Customer,
      customer_details: null,
      customer_email: null,
      subscription: 'sub_link',
    } as Stripe.Checkout.Session

    expect(resolveEmailFromCompletedSession(session)).toBe('marie.link@exemple.com')
  })

  it('priorise customer_details sur le Customer (compte Link avec email wallet différent)', () => {
    const session = {
      id: 'cs_link2',
      object: 'checkout.session',
      status: 'complete',
      customer: {
        id: 'cus_link2',
        object: 'customer',
        email: 'ancien@exemple.com',
      } as Stripe.Customer,
      customer_details: {
        email: 'paiement.link@exemple.com',
        address: null,
        name: null,
        phone: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      customer_email: null,
      subscription: 'sub_link2',
    } as Stripe.Checkout.Session

    expect(resolveEmailFromCompletedSession(session)).toBe('paiement.link@exemple.com')
  })
})

describe('accès Premium après sync abonnement carte', () => {
  const main: Fight = {
    id: 'main',
    eventId: 'ev-1',
    order: 1,
    weightClass: 'Lightweight',
    isTitle: true,
    isMainEvent: true,
    scheduledRounds: 5,
    redId: 'r1',
    blueId: 'b1',
    redCorner: {
      id: 'r1',
      organizationId: 'ufc',
      name: 'Red',
      record: '10-0',
      wins: 10,
      losses: 0,
      draws: 0,
      country: 'FR',
      stats: {
        strikingAccuracy: 50,
        takedownAccuracy: 40,
        reachCm: 180,
        heightCm: 180,
        age: 28,
        winStreak: 2,
      },
      lastSyncedAt: '',
      source: 'merged',
    },
    blueCorner: {
      id: 'b1',
      organizationId: 'ufc',
      name: 'Blue',
      record: '8-2',
      wins: 8,
      losses: 2,
      draws: 0,
      country: 'US',
      stats: {
        strikingAccuracy: 48,
        takedownAccuracy: 38,
        reachCm: 178,
        heightCm: 178,
        age: 30,
        winStreak: 1,
      },
      lastSyncedAt: '',
      source: 'merged',
    },
    model: {
      redWinProbability: 55,
      predictedMethod: 'decision',
      predictedRound: 3,
      confidence: 60,
      breakdown: {
        red: { compositeScore: 0.5, striking: 0.5, grappling: 0.5, physical: 0.5, momentum: 0.5, schedule: 0.5, recentForm: 0.5 },
        blue: { compositeScore: 0.5, striking: 0.5, grappling: 0.5, physical: 0.5, momentum: 0.5, schedule: 0.5, recentForm: 0.5 },
      },
    },
  }

  const coMain: Fight = { ...main, id: 'comain', order: 2, isMainEvent: false, isTitle: false }

  const event: Event = {
    id: 'ev-1',
    organizationId: 'ufc',
    name: 'Test Card',
    date: '2026-06-15',
    venue: 'Arena',
    city: 'Vegas',
    country: 'USA',
    status: 'upcoming',
    predictionsStatus: 'published',
    fights: [main, coMain],
  }

  it('débloque le main event pour un abonnement actif (carte bancaire)', async () => {
    const email = 'client.carte@exemple.com'
    const record = await upsertSubscription({
      email,
      stripeCustomerId: 'cus_card_test',
      stripeSubscriptionId: 'sub_card_test',
      plan: 'premium_monthly',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      updatedAt: new Date().toISOString(),
    })

    expect(isActivePremium(record)).toBe(true)

    const status = await buildSubscriptionStatus(email)
    expect(status.isPremium).toBe(true)
    expect(status.features.allPredictions).toBe(true)

    expect(canAccessFightPrediction(main, event, status.isPremium)).toBe(true)
    expect(canAccessFightPrediction(coMain, event, status.isPremium)).toBe(true)
    expect(canAccessFightPrediction(main, event, false)).toBe(false)
  })
})
