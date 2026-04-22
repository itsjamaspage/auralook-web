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
    let colorIndex = 0;

    for (let i = 0; i < COUNT; i++) {
      const orb = document.createElement('div');
      const sizePx = Math.round(8 + Math.random() * 14);

      Object.assign(orb.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: COLORS[0],
        left: `${Math.round(Math.random() * 95)}%`,
        top: `${Math.round(Math.random() * 95)}%`,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        opacity: '0.85',
        pointerEvents: 'none',
        transition: 'background-color 0.8s ease',
      });

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

    // All balls cycle through the same color together
    const cycleInterval = setInterval(() => {
      colorIndex = (colorIndex + 1) % COLORS.length;
      orbs.forEach(orb => { orb.style.background = COLORS[colorIndex]; });
    }, 1800);

    return () => {
      clearInterval(cycleInterval);
      orbs.forEach(o => o.remove());
    };
  }, []);

  return (
    <div
      ref={ref}
      // z-index: -1 puts orbs behind all page content but above the body background
      style={{ zIndex: -1 }}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    />
  );
}
