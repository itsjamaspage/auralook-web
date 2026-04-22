"use client"

import { useEffect, useRef } from 'react';

const COLORS_RGB = [
  [255, 34,  34 ],
  [255, 102, 0  ],
  [0,   204, 85 ],
  [0,   204, 255],
  [68,  136, 255],
  [170, 68,  255],
  [255, 68,  204],
];

const COUNT = 12;

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export function FloatingOrbs() {
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

    const balls: Ball[] = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      r:  Math.round(7 + Math.random() * 10),
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
    }));

    let colorIdx  = 0;
    let [cr, cg, cb] = COLORS_RGB[0];        // current rendered color
    const SWITCH_MS  = 2000;
    const BLEND_MS   = 700;
    let lastSwitch   = performance.now();
    let raf: number;
    let lastT = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - lastT, 32);
      lastT = now;

      // Blend colour
      const elapsed = now - lastSwitch;
      if (elapsed > SWITCH_MS) {
        colorIdx  = (colorIdx + 1) % COLORS_RGB.length;
        lastSwitch = now;
      }
      const [tr, tg, tb] = COLORS_RGB[(colorIdx + 1) % COLORS_RGB.length];
      const t = Math.min(elapsed / BLEND_MS, 1);
      [cr, cg, cb] = [
        Math.round(lerp(COLORS_RGB[colorIdx][0], tr, t)),
        Math.round(lerp(COLORS_RGB[colorIdx][1], tg, t)),
        Math.round(lerp(COLORS_RGB[colorIdx][2], tb, t)),
      ];

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},0.82)`;

      for (const b of balls) {
        b.x += b.vx * dt * 0.06;
        b.y += b.vy * dt * 0.06;
        if (b.x - b.r < 0)  { b.x = b.r;     b.vx *= -1; }
        if (b.x + b.r > w)  { b.x = w - b.r; b.vx *= -1; }
        if (b.y - b.r < 0)  { b.y = b.r;     b.vy *= -1; }
        if (b.y + b.r > h)  { b.y = h - b.r; b.vy *= -1; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
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

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
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
