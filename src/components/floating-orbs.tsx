"use client"

import { useEffect, useRef } from 'react';

const HUES = [0, 30, 145, 190, 225, 275, 315];
const COUNT = 30;

export function FloatingOrbs() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const orbs: HTMLDivElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const orb = document.createElement('div');
      const hue = HUES[i % HUES.length];
      const isSmall = i < 10;

      const sizePx = isSmall
        ? 10 + Math.random() * 28    // small sharp dots: 10–38px
        : 90 + Math.random() * 240;  // large soft glows: 90–330px

      const blurPx = isSmall ? sizePx * 0.35 : sizePx * 0.6;

      Object.assign(orb.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: `hsl(${hue}, 100%, 55%)`,
        left: `${Math.random() * 110 - 5}%`,
        top: `${Math.random() * 110 - 5}%`,
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        opacity: isSmall ? '0.35' : '0.18',
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
          delay: -(Math.random() * 5000),
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
      // multiply blends colors against white in light mode (shows tints)
      // screen blends additively against dark in dark mode (shows glows)
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none [mix-blend-mode:multiply] dark:[mix-blend-mode:screen]"
      aria-hidden
    />
  );
}
