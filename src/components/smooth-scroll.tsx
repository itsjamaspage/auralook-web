"use client"

// Lenis removed — it added artificial scroll latency.
// Native browser scroll is used instead.
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
