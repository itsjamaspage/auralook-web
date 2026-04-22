"use client"

import { useEffect, useRef } from 'react';

const COLORS = [
  '#ff2222',
  '#ff6600',
  '#00cc55',
  '#00ccff',
  '#4488ff',
  '#aa44ff',
  '#ff44cc',
];

const COUNT = 22;

export function FloatingOrbs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const orbs: HTMLDivElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const orb = document.createElement('div');
      const color = COLORS[i % COLORS.length];
      const sizePx = 6 + Math.random() * 18;

      Object.assign(orb.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: color,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        opacity: '0.75',
        willChange: 'transform',
        pointerEvents: 'none',
      });

      const tx = (Math.random() - 0.5) * 25;
      const ty = (Math.random() - 0.5) * 20;
      const duration = 900 + Math.random() * 1200;

      orb.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${tx}rem, ${ty}rem)` },
        ],
        {
          duration,
          direction: 'alternate',
          fill: 'both',
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: -(Math.random() * duration),
        }
      );

      orbs.push(orb);
      container.appendChild(orb);
    }

    return () => orbs.forEach(o => o.remove());
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    />
  );
}
