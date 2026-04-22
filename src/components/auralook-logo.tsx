"use client"

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

const GAZE: [number, number][] = [
  [0, 0],
  [0.65, 0], [-0.65, 0],
  [0, -0.6], [0, 0.6],
  [0.5, -0.45], [-0.5, -0.45],
  [0.5, 0.45], [-0.5, 0.45],
];
const MAX = 14;

// Both eyes receive the same gaze + blink props so they always move in sync
function Eye({ gazeX, gazeY, blinking }: { gazeX: number; gazeY: number; blinking: boolean }) {
  const pupilAnim = useAnimation();
  const eyeAnim = useAnimation();

  useEffect(() => {
    pupilAnim.start({
      x: gazeX * MAX,
      y: gazeY * MAX,
      transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    });
  }, [gazeX, gazeY]);

  useEffect(() => {
    if (blinking) {
      eyeAnim.start({ scaleY: 0.05, transition: { duration: 0.07, ease: 'easeIn' } });
    } else {
      eyeAnim.start({ scaleY: 1, transition: { duration: 0.12, ease: 'easeOut' } });
    }
  }, [blinking]);

  return (
    <svg
      viewBox="0 0 100 130"
      style={{ display: 'inline-block', width: '0.68em', height: '0.88em', verticalAlign: 'middle', marginBottom: '0.02em' }}
      aria-hidden
    >
      <motion.g
        animate={eyeAnim}
        initial={{ scaleY: 1 }}
        style={{ transformOrigin: '50px 65px' }}
      >
        <ellipse cx="50" cy="65" rx="48" ry="63" fill="currentColor" />
        <ellipse cx="50" cy="65" rx="32" ry="44" fill="hsl(var(--background))" />
        <motion.circle cx="50" cy="65" r="17" fill="hsl(var(--foreground))" animate={pupilAnim} initial={{ x: 0, y: 0 }} />
        <motion.circle cx="60" cy="55" r="6" fill="hsl(var(--background))" opacity={0.55} animate={pupilAnim} initial={{ x: 0, y: 0 }} />
      </motion.g>
    </svg>
  );
}

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

export function AuralookLogo() {
  const [gazeIndex, setGazeIndex] = useState(0);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let alive = true;

    async function wander() {
      await delay(500);
      while (alive) {
        setGazeIndex(Math.floor(Math.random() * GAZE.length));
        await delay(800 + Math.random() * 2200);
      }
    }

    async function blink() {
      await delay(1200 + Math.random() * 800);
      while (alive) {
        setBlinking(true);
        await delay(75 + 120);
        setBlinking(false);
        await delay(2400 + Math.random() * 3500);
      }
    }

    wander();
    blink();
    return () => { alive = false; };
  }, []);

  const [gx, gy] = GAZE[gazeIndex];

  return (
    <span className="text-2xl sm:text-3xl font-black tracking-tighter logo-color-cycle italic inline-flex items-center">
      AURAL<Eye gazeX={gx} gazeY={gy} blinking={blinking} /><Eye gazeX={gx} gazeY={gy} blinking={blinking} />K
    </span>
  );
}
