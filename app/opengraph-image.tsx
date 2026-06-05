import { ImageResponse } from 'next/og'
import { getSiteName, getSiteUrl } from '@/lib/site'

export const runtime = 'edge'
export const alt = 'NextFight — Prédictions MMA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const siteName = getSiteName()
  const siteUrl = getSiteUrl()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(145deg, #0a0a0a 0%, #14110c 45%, #0a0a0a 100%)',
          padding: 72,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 24,
              background: '#c41e1e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 60px rgba(201,184,150,0.25)',
            }}
          >
            <div
              style={{
                color: '#f5f2eb',
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              NF
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 88,
                fontWeight: 700,
                color: '#f5f2eb',
                letterSpacing: -1,
                lineHeight: 1,
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 34,
                color: '#c9b896',
                letterSpacing: 2,
              }}
            >
              PRÉDICTIONS MMA
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            color: '#8a8278',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          UFC · PFL · KSW · ARES · Hexagone — pronostics statistiques
        </div>
        <div style={{ marginTop: 32, fontSize: 22, color: '#5c5c5c' }}>{siteUrl.replace('https://', '')}</div>
      </div>
    ),
    { ...size },
  )
}
