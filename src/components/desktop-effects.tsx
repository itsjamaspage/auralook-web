"use client"

import dynamic from 'next/dynamic';

const MouseGlow = dynamic(
  () => import('@/components/mouse-glow').then(m => m.MouseGlow),
  { ssr: false }
);

export function DesktopEffects() {
  return <MouseGlow />;
}
