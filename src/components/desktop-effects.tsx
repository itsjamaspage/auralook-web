"use client"

import dynamic from 'next/dynamic';

const CustomCursor = dynamic(
  () => import('@/components/custom-cursor').then(m => m.CustomCursor),
  { ssr: false }
);
const MouseGlow = dynamic(
  () => import('@/components/mouse-glow').then(m => m.MouseGlow),
  { ssr: false }
);

export function DesktopEffects() {
  return (
    <>
      <MouseGlow />
      <CustomCursor />
    </>
  );
}
