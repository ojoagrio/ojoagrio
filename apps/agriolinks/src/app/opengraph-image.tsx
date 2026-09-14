import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#241a2e',
          backgroundImage: 'linear-gradient(135deg, #241a2e 0%, #4a3b52 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff3e0',
            border: '4px solid #241a2e',
            borderRadius: 999,
            padding: '10px 28px',
            fontSize: 32,
            fontWeight: 800,
            color: '#241a2e',
            marginBottom: 36,
          }}
        >
          🔗 AGRIOLINKS
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 900,
            color: '#fff3e0',
            textAlign: 'center',
            lineHeight: 1.15,
            padding: '0 80px',
          }}
        >
          Tu página de links, con fondos que se mueven
        </div>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 44,
          }}
        >
          {['#ff6b4a', '#ffb347', '#2ec4b6', '#e4007c'].map((color) => (
            <div key={color} style={{ width: 28, height: 28, borderRadius: '50%', background: color }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
