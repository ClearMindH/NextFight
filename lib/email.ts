import { Resend } from 'resend'
import { getSiteName, getSiteUrl, NOREPLY_EMAIL } from '@/lib/site'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'
import { planDisplayName } from '@/lib/subscription-constants'
import type { PlanId } from '@/types/subscription'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) return null
  return new Resend(key)
}

export async function sendWelcomeSubscriptionEmail(
  email: string,
  plan: PlanId,
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    return { sent: false, error: 'RESEND_API_KEY not configured' }
  }

  const siteName = getSiteName()
  const siteUrl = getSiteUrl()
  const unsubscribeUrl = buildUnsubscribeUrl(email)
  const planLabel = planDisplayName(plan)

  try {
    await resend.emails.send({
      from: NOREPLY_EMAIL,
      to: email,
      subject: `✅ Bienvenue sur ${siteName} !`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
          <h1 style="font-size:1.5rem">Ton abonnement est confirmé 🥊</h1>
          <p>Tu as accès à tous les pronostics UFC, PFL, KSW, ARES et Hexagone MMA.</p>
          <p>Plan souscrit : <strong>${planLabel}</strong></p>
          <p style="margin:24px 0">
            <a href="${siteUrl}/account" style="background:#c9b896;color:#0c0c0c;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
              Accéder à mon espace →
            </a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/>
          <p style="font-size:12px;color:#666">
            Outil informatif — pas de paris sportifs.
            ${unsubscribeUrl ? `<br/>Se désabonner des emails : <a href="${unsubscribeUrl}">lien sécurisé</a>` : ''}
          </p>
        </div>
      `,
    })
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Send failed'
    console.error('[email] welcome', message)
    return { sent: false, error: message }
  }
}

export async function sendContactEmail(input: {
  name: string
  email: string
  message: string
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    return { sent: false, error: 'RESEND_API_KEY not configured' }
  }

  const adminTo = process.env.CONTACT_TO_EMAIL?.trim() || process.env.CONTACT_EMAIL?.trim()
  if (!adminTo) {
    return { sent: false, error: 'CONTACT_TO_EMAIL not configured' }
  }

  const siteName = getSiteName()

  try {
    await resend.emails.send({
      from: NOREPLY_EMAIL,
      to: adminTo,
      replyTo: input.email,
      subject: `Message de ${input.name} — ${siteName}`,
      html: `
        <p><strong>De :</strong> ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p>
        <p>${escapeHtml(input.message).replace(/\n/g, '<br/>')}</p>
      `,
    })
    return { sent: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Send failed'
    return { sent: false, error: message }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
