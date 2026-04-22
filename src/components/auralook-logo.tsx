"use client"

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const GAZE: [number, number][] = [
  [0, 0],
  [0.65, 0], [-0.65, 0],
  [0, -0.6], [0, 0.6],
  [0.5, -0.45], [-0.5, -0.45],
  [0.5, 0.45], [-0.5, 0.45],
];

function Eye({ delay = 0 }: { delay?: number }) {
  const pupilAnim = useAnimation();
  const eyeAnim = useAnimation();
  const MAX = 14;

  useEffect(() => {
    let alive = true;

    async function wander() {
      await new Promise(r => setTimeout(r, delay * 450));
      while (alive) {
        const [gx, gy] = GAZE[Math.floor(Math.random() * GAZE.length)];
        await pupilAnim.start({
          x: gx * MAX,
          y: gy * MAX,
          transition: { duration: 0.28 + Math.random() * 0.45, ease: [0.22, 1, 0.36, 1] },
        });
        await new Promise(r => setTimeout(r, 700 + Math.random() * 2200));
      }
    }

    async function blink() {
      await new Promise(r => setTimeout(r, 900 + delay * 1400 + Math.random() * 1000));
      while (alive) {
        await eyeAnim.start({ scaleY: 0.05, transition: { duration: 0.07, ease: 'easeIn' } });
        await new Promise(r => setTimeout(r, 80));
        await eyeAnim.start({ scaleY: 1, transition: { duration: 0.12, ease: 'easeOut' } });
        await new Promise(r => setTimeout(r, 2200 + Math.random() * 4000));
      }
    }

    wander();
    blink();
    return () => { alive = false; };
  }, []);

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
        {/* Outer O ring */}
        <ellipse cx="50" cy="65" rx="48" ry="63" fill="currentColor" />
        {/* Iris area */}
        <ellipse cx="50" cy="65" rx="32" ry="44" fill="hsl(var(--background))" />
        {/* Pupil */}
        <motion.circle cx="50" cy="65" r="17" fill="hsl(var(--foreground))" animate={pupilAnim} initial={{ x: 0, y: 0 }} />
        {/* Catchlight */}
        <motion.circle cx="60" cy="55" r="6" fill="hsl(var(--background))" opacity={0.55} animate={pupilAnim} initial={{ x: 0, y: 0 }} />
      </motion.g>
    </svg>
  );
}

export function AuralookLogo() {
  return (
    <span className="text-xl sm:text-2xl font-black tracking-tighter neon-text italic inline-flex items-center">
      AURAL<Eye delay={0} /><Eye delay={1} />K
    </span>
  );
}
