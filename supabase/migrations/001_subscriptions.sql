-- NextFight — abonnements Stripe (Premium)
-- Exécuter dans Supabase → SQL Editor → Run

create table if not exists public.subscriptions (
  email text primary key,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  plan text not null check (plan in ('free', 'premium_monthly', 'premium_annual')),
  status text not null default 'inactive' check (
    status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'inactive')
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_customer_id_key
  on public.subscriptions (stripe_customer_id);

create index if not exists subscriptions_updated_at_idx
  on public.subscriptions (updated_at desc);

alter table public.subscriptions enable row level security;

-- Aucune policy : accès uniquement via service role côté serveur Next.js
