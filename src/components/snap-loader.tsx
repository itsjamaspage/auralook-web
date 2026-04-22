"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'spin' | 'hand-in' | 'pre-snap' | 'snap' | 'post-snap' | 'hand-out' | 'spin-out';

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// 8 spark particles that burst outward on snap
const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function Sparks() {
  return (
    <>
      {SPARK_ANGLES.map((deg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full neon-bg"
          style={{ width: 5, height: 5, top: '38%', left: '58%', marginLeft: -2.5, marginTop: -2.5 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((deg * Math.PI) / 180) * 40,
            y: Math.sin((deg * Math.PI) / 180) * 40,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.01 }}
        />
      ))}
      <motion.div
        className="absolute rounded-full neon-bg"
        style={{ width: 14, height: 14, top: '38%', left: '58%', marginLeft: -7, marginTop: -7 }}
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </>
  );
}

// High-quality outlined snapping-hand SVG
// Pre-snap: middle finger raised, thumb pressed against it from below
// Post-snap: middle finger flicked down, thumb extended
function HandSVG({ snapped }: { snapped: boolean }) {
  return (
    <svg
      viewBox="0 0 90 115"
      width={140}
      height={175}
      aria-hidden
      style={{ display: 'block' }}
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Wrist left arm */}
        <path d="M 32 97 Q 28 108 30 118" />
        {/* Wrist right arm */}
        <path d="M 62 97 Q 66 108 64 118" />
        {/* Palm */}
        <path d="M 20 66 Q 17 80 32 97 Q 47 104 62 97 Q 77 80 74 66" />

        {/* Pinky — curled short */}
        <path d="M 66 68 Q 65 58 67 50 Q 70 43 75 48 Q 78 55 76 68" />

        {/* Ring — mid height, curled */}
        <path d="M 55 68 Q 53 52 55 40 Q 59 31 65 37 Q 69 47 67 68" />

        {/* Middle finger — the snap finger */}
        <motion.path
          d={
            snapped
              // snapped: finger curled down toward palm
              ? "M 40 68 Q 40 58 44 52 Q 48 47 53 52 Q 56 58 54 68"
              // pre-snap: raised tall
              : "M 40 68 Q 38 48 41 32 Q 45 22 51 30 Q 56 42 54 68"
          }
          transition={{ duration: 0.07, ease: 'easeIn' }}
        />

        {/* Index finger — raised alongside middle */}
        <path d="M 26 68 Q 24 50 28 36 Q 32 26 39 32 Q 43 44 41 68" />

        {/* Thumb — presses against middle finger pre-snap, extends post-snap */}
        <motion.path
          d={
            snapped
              // post-snap: thumb extended out to side
              ? "M 22 72 Q 13 64 12 53 Q 11 42 20 38 Q 30 35 37 44 Q 42 54 40 68"
              // pre-snap: thumb tip pushed up under middle finger
              : "M 22 72 Q 13 64 12 53 Q 11 42 20 38 Q 30 35 44 46 Q 50 56 48 68"
          }
          transition={{ duration: 0.07, ease: 'easeIn' }}
        />
      </g>
    </svg>
  );
}

// Spinning neon arc (loading ring)
function SpinnerRing() {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      width={80}
      height={80}
      className="neon-text"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="90 86"
      />
    </motion.svg>
  );
}

export function SnapLoader() {
  const [phase, setPhase] = useState<Phase>('spin');
  const [sparkKey, setSparkKey] = useState(0);

  useEffect(() => {
    let alive = true;

    async function run() {
      // Spinner spins for a moment
      await delay(900);
      if (!alive) return;

      // Spinner → hand
      setPhase('hand-in');
      await delay(450);
      if (!alive) return;

      // Hand visible, pre-snap pose
      setPhase('pre-snap');
      await delay(500);
      if (!alive) return;

      // SNAP!
      setPhase('snap');
      setSparkKey(k => k + 1);
      await delay(90);
      if (!alive) return;

      // Post-snap hold
      setPhase('post-snap');
      await delay(320);
      if (!alive) return;

      // Hand → spinner
      setPhase('hand-out');
      await delay(400);
      if (!alive) return;

      // Spinner completes a final revolution
      setPhase('spin-out');
      await delay(700);
      if (!alive) return;

      // Loop back
      setPhase('spin');
      run();
    }

    run();
    return () => { alive = false; };
  }, []);

  const showSpinner = phase === 'spin' || phase === 'spin-out';
  const showHand = phase === 'hand-in' || phase === 'pre-snap' || phase === 'snap' || phase === 'post-snap' || phase === 'hand-out';
  const snapped = phase === 'snap' || phase === 'post-snap';

  return (
    <div className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center gap-10">
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 200 }}>

        {/* Spinning ring */}
        <AnimatePresence>
          {showSpinner && (
            <motion.div
              key="ring"
              className="absolute"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <SpinnerRing />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand */}
        <AnimatePresence>
          {showHand && (
            <motion.div
              key="hand"
              className="neon-text absolute"
              initial={{ opacity: 0, scale: 0.2, rotate: -15 }}
              animate={{
                opacity: phase === 'hand-out' ? 0 : 1,
                scale: phase === 'hand-out' ? 0.2 : 1,
                rotate: phase === 'snap' ? 7 : phase === 'hand-out' ? 15 : 0,
                y: phase === 'snap' ? 3 : 0,
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{
                duration: phase === 'snap' ? 0.07 : 0.35,
                ease: phase === 'snap' ? 'easeIn' : 'easeOut',
              }}
            >
              {/* Sparks re-mounted each snap via key */}
              {sparkKey > 0 && <Sparks key={sparkKey} />}
              <HandSVG snapped={snapped} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        className="text-[9px] font-mono uppercase tracking-[0.4em] text-foreground/30"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        loading
      </motion.p>
    </div>
  );
}
