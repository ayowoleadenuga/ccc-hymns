import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

// Route segment config
export const runtime = 'nodejs'

// Image metadata
export const alt = 'CCC Hymns - Worship in Truth & Spirit'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Generate the image
export default async function Image() {
  const buffer = await readFile(join(cwd(), 'public', 'logo.png'))

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* @ts-ignore */}
        <img src={buffer.buffer} alt="CCC Hymns Logo" style={{ width: '400px', height: '400px', objectFit: 'contain', marginBottom: '20px' }} />
        <div style={{ fontSize: 60, fontWeight: 'bold', color: '#333' }}>CCC Hymns</div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
