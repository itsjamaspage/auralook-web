"use client"

import { useEffect, useRef } from 'react';

// Neon palette — same progression as app color-sync
const PALETTE: [number, number, number][] = [
  [255,  30,  30],
  [255, 110,   0],
  [  0, 210,  80],
  [  0, 200, 255],
  [ 70, 130, 255],
  [160,  50, 255],
  [255,  50, 200],
];

const LOOP_MS   = 15_000; // 15-second deterministic loop
const CLR_MS    = 2_000;  // color hold duration
const BLEND_MS  = 700;    // color blend duration
const NODE_N    = 8;
const MAX_DIST  = 380;

// Each node: base position + two Lissajous oscillation params
// Frequencies are small integers → exact 15s period
const NODES = [
  { bx: 0.15, by: 0.25, ax: 0.14, ay: 0.11, fx: 1, fy: 2, px: 0.00, py: 0.50, r: 7  },
  { bx: 0.72, by: 0.18, ax: 0.16, ay: 0.09, fx: 2, fy: 1, px: 0.25, py: 0.15, r: 11 },
  { bx: 0.48, by: 0.58, ax: 0.19, ay: 0.14, fx: 1, fy: 3, px: 0.70, py: 0.10, r: 5  },
  { bx: 0.88, by: 0.52, ax: 0.08, ay: 0.17, fx: 3, fy: 1, px: 0.10, py: 0.80, r: 9  },
  { bx: 0.12, by: 0.72, ax: 0.11, ay: 0.18, fx: 2, fy: 2, px: 0.60, py: 0.35, r: 6  },
  { bx: 0.58, by: 0.88, ax: 0.14, ay: 0.07, fx: 1, fy: 2, px: 0.85, py: 0.60, r: 10 },
  { bx: 0.33, by: 0.42, ax: 0.20, ay: 0.15, fx: 3, fy: 2, px: 0.40, py: 0.90, r: 5  },
  { bx: 0.80, by: 0.75, ax: 0.12, ay: 0.13, fx: 2, fy: 3, px: 0.55, py: 0.20, r: 8  },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export function NetworkLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;

    let raf: number;

    const draw = (now: number) => {
      // --- color ---
      const colorPhase = (now / CLR_MS) % PALETTE.length;
      const ci  = Math.floor(colorPhase) % PALETTE.length;
      const ni  = (ci + 1) % PALETTE.length;
      const bt  = Math.min((colorPhase - Math.floor(colorPhase)) / (BLEND_MS / CLR_MS), 1);
      const r   = Math.round(lerp(PALETTE[ci][0], PALETTE[ni][0], bt));
      const g   = Math.round(lerp(PALETTE[ci][1], PALETTE[ni][1], bt));
      const b   = Math.round(lerp(PALETTE[ci][2], PALETTE[ni][2], bt));

      // --- node positions (deterministic 15-s loop) ---
      const t = (now % LOOP_MS) / LOOP_MS;
      const pos = NODES.map(n => ({
        x: (n.bx + n.ax * Math.sin(2 * Math.PI * n.fx * t + n.px * 2 * Math.PI)) * w,
        y: (n.by + n.ay * Math.sin(2 * Math.PI * n.fy * t + n.py * 2 * Math.PI)) * h,
        r: n.r,
      }));

      ctx.clearRect(0, 0, w, h);

      // --- curved lines between nearby nodes ---
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const a = pos[i], b2 = pos[j];
          const dx = b2.x - a.x, dy = b2.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > MAX_DIST) continue;

          const alpha = (1 - dist / MAX_DIST) * 0.55;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';

          // Control point perpendicular to midpoint → curved line
          const mx = (a.x + b2.x) / 2;
          const my = (a.y + b2.y) / 2;
          const curve = dist * 0.28;
          const cpx = mx - (dy / dist) * curve;
          const cpy = my + (dx / dist) * curve;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(cpx, cpy, b2.x, b2.y);
          ctx.stroke();
        }
      }

      // --- dots ---
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
      for (const p of pos) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
