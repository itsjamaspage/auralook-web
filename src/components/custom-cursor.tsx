"use client"

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on pointer-capable devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const pos = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };
    let visible = false;
    let hovering = false;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        ringPos.x = pos.x;
        ringPos.y = pos.y;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      hovering = !!target?.closest('a, button, [role="button"], input, textarea, [data-magnetic]');
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const animate = () => {
      // Dot snaps to cursor
      dot.style.transform = `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)`;

      // Ring lags behind with spring
      ringPos.x += (pos.x - ringPos.x) * 0.13;
      ringPos.y += (pos.y - ringPos.y) * 0.13;

      const scale = hovering ? 2.2 : 1;
      ring.style.transform = `translate3d(${ringPos.x - 18}px, ${ringPos.y - 18}px, 0) scale(${scale})`;

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Inner dot — snaps instantly */}
      <div
        ref={dotRef}
        aria-hidden
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] opacity-0"
        style={{
          background: 'var(--sync-color)',
          boxShadow: '0 0 8px var(--sync-shadow)',
          transition: 'opacity 0.3s',
          willChange: 'transform',
        }}
      />
      {/* Outer ring — springs behind */}
      <div
        ref={ringRef}
        aria-hidden
        className="fixed top-0 left-0 w-9 h-9 rounded-full pointer-events-none z-[9999] opacity-0"
        style={{
          border: '1.5px solid var(--sync-color)',
          boxShadow: '0 0 12px var(--sync-shadow)',
          transition: 'opacity 0.3s, transform 0.05s linear, scale 0.25s cubic-bezier(0.22,1,0.36,1)',
          willChange: 'transform',
        }}
      />
    </>
  );
}
