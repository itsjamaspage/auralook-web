"use client"

import { useEffect, useRef } from 'react';

const COLORS = ['#ff2222', '#ff6600', '#00cc55', '#00ccff', '#4488ff', '#aa44ff', '#ff44cc'];
const COUNT = 12;

export function FloatingOrbs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const orbs: HTMLDivElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const orb = document.createElement('div');
      const color = COLORS[i % COLORS.length];
      // Round to whole pixels so the circle stays crisp
      const sizePx = Math.round(8 + Math.random() * 14);

      Object.assign(orb.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: color,
        left: `${Math.round(Math.random() * 95)}%`,
        top: `${Math.round(Math.random() * 95)}%`,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        opacity: '0.85',
        pointerEvents: 'none',
      });

      // Integer px distances — avoids sub-pixel blur during animation
      const tx = Math.round((Math.random() - 0.5) * 200);
      const ty = Math.round((Math.random() - 0.5) * 160);
      const duration = 1000 + Math.random() * 1000;

      orb.animate(
        [
          { transform: 'translate(0px, 0px)' },
          { transform: `translate(${tx}px, ${ty}px)` },
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
