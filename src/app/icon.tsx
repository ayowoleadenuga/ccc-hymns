import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
 
// Image metadata
export const size = {
  width: 36,
  height: 36,
}
export const contentType = 'image/png'
 
// Generate the image
export default async function Icon() {
  const buffer = await readFile(join(cwd(), 'public', 'logo.png'))
 
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* @ts-ignore */}
        <img src={buffer.buffer} alt="CCC Hymns Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
