import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f1115',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
        }}
      >
        {/* Gold accent bar */}
        <div style={{ width: 56, height: 2, background: '#dca840', marginBottom: 40 }} />

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 300,
            letterSpacing: '-0.5px',
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          <span style={{ color: '#ffffff' }}>STEINBERG</span>
          <span style={{ color: '#dca840' }}>VALENTINO</span>
        </div>

        {/* Descriptor */}
        <div
          style={{
            color: '#a6acb3',
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          Investor Relations &middot; Capital Markets Advisory
        </div>

        {/* Domain watermark bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            color: '#52555d',
            fontSize: 16,
            letterSpacing: '1px',
          }}
        >
          steinbergvalentino.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
