"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Phase = 'idle' | 'windup' | 'snap' | 'recover';

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Burst of sparks re-mounted each snap via key change
function Sparks() {
  return (
    <>
      {SPARK_ANGLES.map((deg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full neon-bg"
          style={{ width: 3.5, height: 3.5, top: 48, left: 50, marginLeft: -1.75, marginTop: -1.75 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((deg * Math.PI) / 180) * 28,
            y: Math.sin((deg * Math.PI) / 180) * 28,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.02 }}
        />
      ))}
      {/* Central flash ring */}
      <motion.div
        className="absolute rounded-full neon-bg"
        style={{ width: 10, height: 10, top: 48, left: 50, marginLeft: -5, marginTop: -5 }}
        initial={{ scale: 0, opacity: 0.85 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </>
  );
}

function SnapHand({ snapped }: { snapped: boolean }) {
  return (
    <svg viewBox="0 0 80 96" width={80} height={96} aria-hidden>
      {/* Palm */}
      <path d="M 12 66 Q 8 82 20 89 Q 40 95 60 89 Q 72 82 68 66 Z" fill="currentColor" />
      {/* Pinky */}
      <path d="M 14 67 Q 10 55 13 46 Q 16 40 21 46 Q 24 55 21 67 Z" fill="currentColor" />
      {/* Ring */}
      <path d="M 24 67 Q 20 51 23 38 Q 26 31 31 38 Q 35 51 32 67 Z" fill="currentColor" />
      {/* Middle — raised (pre-snap) */}
      <motion.path
        d="M 34 67 Q 30 48 33 30 Q 36 22 41 30 Q 45 48 42 67 Z"
        fill="currentColor"
        animate={{ opacity: snapped ? 0 : 1 }}
        transition={{ duration: 0.06 }}
      />
      {/* Middle — snapped down */}
      <motion.path
        d="M 34 67 Q 32 59 35 52 Q 37 47 41 52 Q 44 59 42 67 Z"
        fill="currentColor"
        animate={{ opacity: snapped ? 1 : 0 }}
        transition={{ duration: 0.06 }}
      />
      {/* Index */}
      <path d="M 45 67 Q 42 53 45 43 Q 48 37 53 43 Q 56 53 55 67 Z" fill="currentColor" />
      {/* Thumb */}
      <path d="M 59 67 Q 66 61 69 53 Q 71 45 66 42 Q 60 40 56 47 Q 53 55 56 67 Z" fill="currentColor" />
    </svg>
  );
}

export function SnapLoader() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [sparkKey, setSparkKey] = useState(0);

  useEffect(() => {
    let alive = true;

    async function run() {
      // Small initial pause so the screen isn't immediately animated
      await delay(400);
      while (alive) {
        await delay(800);
        if (!alive) break;
        setPhase('windup');
        await delay(160);
        if (!alive) break;
        setPhase('snap');
        setSparkKey(k => k + 1);
        await delay(110);
        if (!alive) break;
        setPhase('recover');
        await delay(210);
        if (!alive) break;
        setPhase('idle');
      }
    }

    run();
    return () => { alive = false; };
  }, []);

  const snapped = phase === 'snap' || phase === 'recover';

  return (
    <div className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center gap-10">
      <div className="relative" style={{ width: 80, height: 96 }}>
        {/* Sparks — re-mounted each snap */}
        {sparkKey > 0 && <Sparks key={sparkKey} />}

        {/* Hand with snap motion */}
        <motion.div
          className="neon-text absolute inset-0"
          animate={{
            rotate: phase === 'windup' ? -10 : phase === 'snap' ? 6 : 0,
            y: phase === 'windup' ? -4 : phase === 'snap' ? 2 : 0,
          }}
          transition={{
            duration: phase === 'snap' ? 0.07 : 0.2,
            ease: phase === 'snap' ? 'easeIn' : 'easeOut',
          }}
        >
          <SnapHand snapped={snapped} />
        </motion.div>
      </div>

      {/* Label */}
      <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-foreground/25 animate-pulse">
        loading
      </p>
    </div>
  );
}
