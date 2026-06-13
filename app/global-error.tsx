'use client'

function errorLabel(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return 'Une erreur inattendue est survenue.'
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#050505', color: '#fff', fontFamily: 'system-ui' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem' }}>NextFight — erreur critique</h1>
          <p style={{ marginTop: '1rem', color: '#8b8b8b', maxWidth: '28rem' }}>
            {errorLabel(error)}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#c9a227',
              color: '#050505',
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  )
}
