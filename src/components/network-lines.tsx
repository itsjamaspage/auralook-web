"use client"

// Pure CSS animation — no canvas, no rAF, no JS per frame.
// Dots travel left → right using compositor-only transforms.
// Color is driven by var(--sync-color) — syncs with the rest of the app.

const DOTS: {
  size: number;
  top: string;
  speed: number;
  waveAmp: number;
  waveSpeed: number;
  delay: number;
}[] = [
  { size: 9,  top:  '8%', speed: 22, waveAmp: 18, waveSpeed: 6.5, delay:   0 },
  { size: 7,  top: '28%', speed: 18, waveAmp: 24, waveSpeed: 8.0, delay:  -5 },
  { size: 11, top: '50%', speed: 26, waveAmp: 14, waveSpeed: 7.2, delay: -11 },
  { size: 6,  top: '70%', speed: 20, waveAmp: 20, waveSpeed: 5.8, delay:  -7 },
  { size: 8,  top: '88%', speed: 24, waveAmp: 16, waveSpeed: 9.0, delay: -16 },
];

export function NetworkLines() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden
    >
      {DOTS.map((d, i) => (
        /* Outer div: horizontal sweep L → R */
        <div
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
            left: 0,
            animation: `sweep-right ${d.speed}s ${d.delay}s linear infinite`,
          }}
        >
          {/* Inner div: vertical sine-wave */}
          <div
            style={{
              '--amp': `${d.waveAmp}px`,
              animation: `wave-y ${d.waveSpeed}s ease-in-out infinite alternate`,
              willChange: 'transform',
            } as React.CSSProperties}
          >
            <div
              style={{
                width:  d.size,
                height: d.size,
                borderRadius: '50%',
                background: 'var(--sync-color)',
                animation: 'color-sync 24.5s linear infinite',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
