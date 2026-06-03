'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Calendar,
  Swords,
  RefreshCw,
  CreditCard,
  LogOut,
  Plus,
} from 'lucide-react'
import type { Fighter, OrganizationId } from '@/types'
import type { EventInput, FightInput, FighterUpsertPayload } from '@/types/admin'
import type { SubscriptionRecord } from '@/types/subscription'
import type { PlanId, SubscriptionStatus } from '@/types/subscription'
import { organizations } from '@/data/organizations'
import { planDisplayName } from '@/lib/subscription-constants'
import { cn } from '@/utils/cn'

type Tab = 'fighters' | 'events' | 'fights' | 'recalculate' | 'subscriptions'

const ORG_IDS: OrganizationId[] = ['ufc', 'pfl', 'ksw', 'ares', 'hexagone']

const emptyFighterForm = (): FighterUpsertPayload => ({
  organizationId: 'ufc',
  name: '',
  record: '0-0-0',
  wins: 0,
  losses: 0,
  draws: 0,
  country: 'USA',
  imageUrl: '',
  stats: {
    strikingAccuracy: 50,
    takedownAccuracy: 40,
    reachCm: 180,
    heightCm: 178,
    age: 28,
    winStreak: 0,
  },
})

export function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('fighters')
  const [fighters, setFighters] = useState<Fighter[]>([])
  const [eventsRaw, setEventsRaw] = useState<EventInput[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [newSubEmail, setNewSubEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [fighterForm, setFighterForm] = useState<FighterUpsertPayload>(emptyFighterForm())
  const [editFighterId, setEditFighterId] = useState<string | null>(null)

  const [eventForm, setEventForm] = useState<Partial<EventInput>>({
    organizationId: 'ufc',
    status: 'upcoming',
    communityPredictions: 0,
    fights: [],
  })

  const [fightForm, setFightForm] = useState<Partial<FightInput>>({
    order: 1,
    isTitle: false,
    isMainEvent: false,
    scheduledRounds: 3,
  })

  const loadAll = useCallback(async () => {
    const [fRes, eRes, sRes] = await Promise.all([
      fetch('/api/admin/fighters'),
      fetch('/api/admin/events'),
      fetch('/api/admin/subscriptions'),
    ])
    if (fRes.ok) {
      const d = await fRes.json()
      setFighters(d.fighters ?? [])
    }
    if (eRes.ok) {
      const d = await eRes.json()
      setEventsRaw(d.events ?? [])
    }
    if (sRes.ok) {
      const d = await sRes.json()
      setSubscriptions(d.subscriptions ?? [])
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function selectFighter(f: Fighter) {
    setEditFighterId(f.id)
    setFighterForm({
      id: f.id,
      organizationId: f.organizationId,
      name: f.name,
      nickname: f.nickname,
      record: f.record,
      wins: f.wins,
      losses: f.losses,
      draws: f.draws,
      country: f.country,
      weightClass: f.weightClass,
      ranking: f.ranking,
      imageUrl: f.imageUrl ?? '',
      stats: { ...f.stats },
    })
    setTab('fighters')
  }

  async function saveFighter(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const url = editFighterId
      ? `/api/admin/fighters/${editFighterId}`
      : '/api/admin/fighters'
    const method = editFighterId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fighterForm),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setMessage(data.error ?? 'Erreur')
      return
    }
    setMessage(editFighterId ? 'Combattant mis à jour' : 'Combattant ajouté')
    setEditFighterId(null)
    setFighterForm(emptyFighterForm())
    loadAll()
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setMessage(data.error ?? 'Erreur événement')
      return
    }
    setMessage('Événement enregistré')
    setEventForm({ organizationId: 'ufc', status: 'upcoming', communityPredictions: 0, fights: [] })
    loadAll()
  }

  async function saveFight(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/fights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fightForm),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setMessage(data.error ?? 'Erreur combat')
      return
    }
    setMessage('Combat ajouté')
    loadAll()
  }

  async function recalculate() {
    setLoading(true)
    const res = await fetch('/api/admin/recalculate', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    setMessage(
      res.ok
        ? `Prédictions recalculées (${data.updated} combats, ${data.skipped} ignorés)`
        : data.error ?? 'Erreur',
    )
  }

  async function updateSubscription(email: string, plan: PlanId, status: SubscriptionStatus) {
    const res = await fetch('/api/admin/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan, status }),
    })
    if (res.ok) {
      setMessage(`Abonnement ${email} mis à jour`)
      loadAll()
    }
  }

  async function grantPremiumEmail() {
    const email = newSubEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      setMessage('Email invalide')
      return
    }
    await updateSubscription(email, 'premium_annual', 'active')
    setNewSubEmail('')
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'fighters', label: 'Combattants', icon: Users },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'fights', label: 'Combats', icon: Swords },
    { id: 'recalculate', label: 'Prédictions', icon: RefreshCw },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  ]

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Admin</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Panneau d&apos;administration
          </h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-gold border border-gold/30 bg-gold/5 rounded-xl px-4 py-2">
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-colors',
              tab === id
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border text-muted hover:text-foreground',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'fighters' && (
          <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={saveFighter} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold">
                {editFighterId ? 'Modifier combattant' : 'Ajouter combattant'}
              </h2>
              <AdminField label="Organisation">
                <select
                  value={fighterForm.organizationId}
                  onChange={(e) =>
                    setFighterForm({ ...fighterForm, organizationId: e.target.value as OrganizationId })
                  }
                  className={inputClass}
                >
                  {ORG_IDS.map((id) => (
                    <option key={id} value={id}>
                      {id.toUpperCase()}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Nom">
                <input
                  required
                  value={fighterForm.name}
                  onChange={(e) => setFighterForm({ ...fighterForm, name: e.target.value })}
                  className={inputClass}
                />
              </AdminField>
              <AdminField label="Photo (URL ou fichier local)">
                <input
                  type="url"
                  placeholder="https://… ou /fighters/nom.jpg"
                  value={fighterForm.imageUrl ?? ''}
                  onChange={(e) =>
                    setFighterForm({ ...fighterForm, imageUrl: e.target.value })
                  }
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Fichier local : placez l&apos;image dans{' '}
                  <code className="text-gold">public/fighters/</code> puis indiquez{' '}
                  <code className="text-gold">/fighters/nom.jpg</code>. Les URLs externes
                  (UFC, Wikipedia, etc.) sont acceptées.
                </p>
              </AdminField>
              <div className="grid grid-cols-3 gap-2">
                <AdminField label="V">
                  <input
                    type="number"
                    value={fighterForm.wins}
                    onChange={(e) =>
                      setFighterForm({ ...fighterForm, wins: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="D">
                  <input
                    type="number"
                    value={fighterForm.losses}
                    onChange={(e) =>
                      setFighterForm({ ...fighterForm, losses: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="N">
                  <input
                    type="number"
                    value={fighterForm.draws}
                    onChange={(e) =>
                      setFighterForm({ ...fighterForm, draws: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </AdminField>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <AdminField label="Strike %">
                  <input
                    type="number"
                    value={fighterForm.stats.strikingAccuracy}
                    onChange={(e) =>
                      setFighterForm({
                        ...fighterForm,
                        stats: { ...fighterForm.stats, strikingAccuracy: Number(e.target.value) },
                      })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="TD %">
                  <input
                    type="number"
                    value={fighterForm.stats.takedownAccuracy}
                    onChange={(e) =>
                      setFighterForm({
                        ...fighterForm,
                        stats: { ...fighterForm.stats, takedownAccuracy: Number(e.target.value) },
                      })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="Reach cm">
                  <input
                    type="number"
                    value={fighterForm.stats.reachCm}
                    onChange={(e) =>
                      setFighterForm({
                        ...fighterForm,
                        stats: { ...fighterForm.stats, reachCm: Number(e.target.value) },
                      })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="Age">
                  <input
                    type="number"
                    value={fighterForm.stats.age}
                    onChange={(e) =>
                      setFighterForm({
                        ...fighterForm,
                        stats: { ...fighterForm.stats, age: Number(e.target.value) },
                      })
                    }
                    className={inputClass}
                  />
                </AdminField>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium"
              >
                {editFighterId ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editFighterId && (
                <button
                  type="button"
                  className="w-full text-sm text-muted hover:text-gold"
                  onClick={() => {
                    setEditFighterId(null)
                    setFighterForm(emptyFighterForm())
                  }}
                >
                  Annuler édition
                </button>
              )}
            </form>

            <div className="rounded-2xl border border-border bg-card p-6 max-h-[600px] overflow-y-auto">
              <h2 className="font-display font-semibold mb-4">Roster ({fighters.length})</h2>
              <ul className="space-y-2 text-sm">
                {fighters.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => selectFighter(f)}
                      className="w-full text-left rounded-lg border border-border px-3 py-2 hover:border-gold/30"
                    >
                      <span className="text-gold text-xs">{f.organizationId}</span>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted">{f.record}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'events' && (
          <form onSubmit={saveEvent} className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Plus size={18} className="text-gold" />
              Ajouter événement
            </h2>
            <AdminField label="ID (slug)">
              <input
                required
                placeholder="ufc-314"
                value={eventForm.id ?? ''}
                onChange={(e) => setEventForm({ ...eventForm, id: e.target.value })}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Nom">
              <input
                required
                value={eventForm.name ?? ''}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Organisation">
              <select
                value={eventForm.organizationId ?? 'ufc'}
                onChange={(e) =>
                  setEventForm({ ...eventForm, organizationId: e.target.value as OrganizationId })
                }
                className={inputClass}
              >
                {ORG_IDS.map((id) => (
                  <option key={id} value={id}>
                    {organizations.find((o) => o.id === id)?.name ?? id}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Date (ISO)">
              <input
                required
                type="datetime-local"
                value={eventForm.date?.slice(0, 16) ?? ''}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Lieu">
              <input
                value={eventForm.venue ?? ''}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className={inputClass}
              />
            </AdminField>
            <div className="grid grid-cols-2 gap-2">
              <AdminField label="Ville">
                <input
                  value={eventForm.city ?? ''}
                  onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                  className={inputClass}
                />
              </AdminField>
              <AdminField label="Pays">
                <input
                  value={eventForm.country ?? ''}
                  onChange={(e) => setEventForm({ ...eventForm, country: e.target.value })}
                  className={inputClass}
                />
              </AdminField>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium"
            >
              Créer l&apos;événement
            </button>
          </form>
        )}

        {tab === 'fights' && (
          <form onSubmit={saveFight} className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl">
            <h2 className="font-display font-semibold">Ajouter un combat</h2>
            <AdminField label="Événement">
              <select
                required
                value={fightForm.eventId ?? ''}
                onChange={(e) => setFightForm({ ...fightForm, eventId: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                {eventsRaw.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="ID combat">
              <input
                required
                value={fightForm.id ?? ''}
                onChange={(e) => setFightForm({ ...fightForm, id: e.target.value })}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Catégorie">
              <input
                required
                value={fightForm.weightClass ?? ''}
                onChange={(e) => setFightForm({ ...fightForm, weightClass: e.target.value })}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Coin rouge (ID)">
              <select
                required
                value={fightForm.redId ?? ''}
                onChange={(e) => setFightForm({ ...fightForm, redId: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                {fighters.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Coin bleu (ID)">
              <select
                required
                value={fightForm.blueId ?? ''}
                onChange={(e) => setFightForm({ ...fightForm, blueId: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                {fighters.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Rounds">
              <input
                type="number"
                min={3}
                max={5}
                value={fightForm.scheduledRounds ?? 3}
                onChange={(e) =>
                  setFightForm({ ...fightForm, scheduledRounds: Number(e.target.value) })
                }
                className={inputClass}
              />
            </AdminField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fightForm.isMainEvent ?? false}
                onChange={(e) => setFightForm({ ...fightForm, isMainEvent: e.target.checked })}
              />
              Main event
            </label>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium"
            >
              Ajouter le combat
            </button>
          </form>
        )}

        {tab === 'recalculate' && (
          <div className="rounded-2xl border border-border bg-card p-8 max-w-lg text-center">
            <RefreshCw className="h-10 w-10 text-gold mx-auto" />
            <h2 className="mt-4 font-display text-xl font-semibold">Recalculer les prédictions</h2>
            <p className="mt-2 text-sm text-muted">
              Relance le moteur statistique sur tous les combats enregistrés (fichier{' '}
              <code className="text-gold">data/store/events.json</code>).
            </p>
            <button
              type="button"
              onClick={recalculate}
              disabled={loading}
              className="mt-6 rounded-full bg-gold text-background px-8 py-3 text-sm font-medium"
            >
              Recalculer maintenant
            </button>
          </div>
        )}

        {tab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
              <label className="flex-1 block">
                <span className="text-xs text-muted uppercase tracking-wider">
                  Accorder Premium à un email
                </span>
                <input
                  type="email"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="utilisateur@exemple.com"
                  className={cn('mt-2 w-full', inputClass)}
                />
              </label>
              <button
                type="button"
                onClick={grantPremiumEmail}
                className="rounded-full bg-gold text-background px-6 py-2.5 text-sm font-medium shrink-0"
              >
                Activer Premium
              </button>
            </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50 text-left">
                  <th className="px-4 py-3 text-muted">Email</th>
                  <th className="px-4 py-3 text-muted">Plan</th>
                  <th className="px-4 py-3 text-muted">Statut</th>
                  <th className="px-4 py-3 text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">
                      Aucun abonnement enregistré
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <SubscriptionRow
                      key={sub.email}
                      sub={sub}
                      onSave={updateSubscription}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionRow({
  sub,
  onSave,
}: {
  sub: SubscriptionRecord
  onSave: (email: string, plan: PlanId, status: SubscriptionStatus) => void
}) {
  const [plan, setPlan] = useState<PlanId>(sub.plan)
  const [status, setStatus] = useState<SubscriptionStatus>(sub.status)

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">{sub.email}</td>
      <td className="px-4 py-3">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as PlanId)}
          className={inputClass}
        >
          <option value="free">Gratuit</option>
          <option value="premium_monthly">Premium Mensuel</option>
          <option value="premium_annual">Premium Annuel</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
          className={inputClass}
        >
          <option value="active">active</option>
          <option value="trialing">trialing</option>
          <option value="inactive">inactive</option>
          <option value="canceled">canceled</option>
          <option value="past_due">past_due</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onSave(sub.email, plan, status)}
          className="text-xs text-gold hover:underline"
        >
          Enregistrer
        </button>
        <p className="text-[10px] text-muted mt-1">{planDisplayName(sub.plan)}</p>
      </td>
    </tr>
  )
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold/50 focus:outline-none'
