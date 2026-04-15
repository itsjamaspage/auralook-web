
/**
 * @fileOverview Animated lane/beam background — works for both light and dark themes.
 * Lines sweep across the screen using the app's live color-sync system.
 */

const LANES = [
  { top: '6%',  height: '1px',   duration: '9s',   delay: '0s',    op: 0.55, reverse: false },
  { top: '17%', height: '2px',   duration: '15s',  delay: '4s',    op: 0.30, reverse: true  },
  { top: '28%', height: '1px',   duration: '7s',   delay: '1.5s',  op: 0.50, reverse: false },
  { top: '39%', height: '1.5px', duration: '12s',  delay: '6s',    op: 0.38, reverse: true  },
  { top: '51%', height: '1px',   duration: '8.5s', delay: '2.8s',  op: 0.60, reverse: false },
  { top: '63%', height: '2px',   duration: '14s',  delay: '0.5s',  op: 0.28, reverse: true  },
  { top: '74%', height: '1px',   duration: '6.5s', delay: '3.5s',  op: 0.48, reverse: false },
  { top: '85%', height: '1.5px', duration: '11s',  delay: '7s',    op: 0.35, reverse: true  },
  { top: '93%', height: '1px',   duration: '10s',  delay: '1s',    op: 0.42, reverse: false },
];

export function LaneBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Subtle grid */}
      <div className="lane-grid" />

      {/* Sweeping beam lines */}
      {LANES.map((lane, i) => (
        <div
          key={i}
          className={`lane-beam${lane.reverse ? ' lane-beam-rev' : ''}`}
          style={{
            top: lane.top,
            height: lane.height,
            animationDuration: lane.duration,
            animationDelay: `-${lane.delay}`, // negative delay = starts mid-animation, no blank wait
            ['--lane-op' as string]: lane.op,
            opacity: lane.op,
          }}
        />
      ))}
    </div>
  );
}
