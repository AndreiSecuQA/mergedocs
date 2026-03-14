'use client'

import type React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): React.ReactNode {
  return (
    <html>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1rem',
        }}
      >
        <div style={{ fontSize: '3rem' }}>⚠</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
        {error.message && (
          <p style={{ color: '#6b7280', maxWidth: '28rem', fontSize: '0.875rem' }}>{error.message}</p>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={reset}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#f3f4f6',
              color: '#111',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Go Home
          </button>
        </div>
      </body>
    </html>
  )
}
