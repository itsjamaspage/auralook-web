"use client"

import { useEffect, useRef } from 'react';

// Same hues as the app's neon color-sync keyframe stops
const HUES = [0, 30, 145, 190, 225, 275, 315];
const COUNT = 22;

export function FloatingOrbs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const orbs: HTMLDivElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const orb = document.createElement('div');
      const hue = HUES[i % HUES.length];

      // Mix of tiny dots and large soft glows
      const sizePx = i < 8
        ? 8 + Math.random() * 24          // small sharp dots: 8–32px
        : 80 + Math.random() * 220;       // large soft glows: 80–300px

      const blurPx = i < 8
        ? sizePx * 0.4
        : sizePx * 0.65;

      Object.assign(orb.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: `hsl(${hue}, 100%, 55%)`,
        left: `${Math.random() * 110 - 5}%`,
        top: `${Math.random() * 110 - 5}%`,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        // Small dots more visible, large glows soft
        opacity: i < 8 ? '0.22' : '0.10',
        filter: `blur(${blurPx}px)`,
        willChange: 'transform',
        pointerEvents: 'none',
      });

      const tx = (Math.random() - 0.5) * 18;
      const ty = (Math.random() - 0.5) * 14;

      orb.animate(
        [
          { transform: 'translate(0, 0)' },
          { transform: `translate(${tx}rem, ${ty}rem)` },
        ],
        {
          duration: 3000 + Math.random() * 6000,
          direction: 'alternate',
          fill: 'both',
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: -(Math.random() * 5000), // stagger so they don't all start at same position
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
