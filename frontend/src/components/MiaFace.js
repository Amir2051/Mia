'use client';
import { useMemo } from 'react';

const BUBBLE_COUNT = 14;

export default function MiaFace({ size = 220, streaming = false }) {
  const bubbles = useMemo(() => Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    id: i,
    w:  Math.random() * 5 + 2,
    x:  Math.random() * 70 + 15,
    delay:    (Math.random() * 4).toFixed(2),
    duration: (Math.random() * 2 + 2).toFixed(2),
  })), []);

  const bars = streaming ? [6,10,16,20,16,10,6,12,8] : [3,2,3,2,3,2,3,2,3];

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>

      {/* ── Sonar rings ──────────────────────────────────────── */}
      {[0, 1.1, 2.2].map((delay, i) => (
        <div key={i} className="absolute inset-0 rounded-full border border-amber-400/20 pointer-events-none"
          style={{ animation: `sonar 3s ease-out ${delay}s infinite` }} />
      ))}

      {/* ── Outer glow ring ──────────────────────────────────── */}
      <div className="absolute inset-3 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,149,0,.06) 0%, transparent 70%)',
          boxShadow: '0 0 60px rgba(255,149,0,.25), inset 0 0 40px rgba(255,149,0,.08)',
          animation: 'breathe 4s ease-in-out infinite',
        }} />

      {/* ── Main face circle ─────────────────────────────────── */}
      <div className="absolute inset-4 rounded-full overflow-hidden border border-amber-400/40"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #1a0c00, #000000)',
          boxShadow: '0 0 40px rgba(255,149,0,.3), inset 0 0 30px rgba(255,149,0,.08)',
          animation: 'breathe 4s ease-in-out infinite',
        }}
      >
        {/* Hex grid texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 2L25 8v12L14 26 3 20V8z' fill='none' stroke='%23ff9500' stroke-width='.6'/%3E%3C/svg%3E")`,
        }} />

        {/* Scanline inside face */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.2) 3px,rgba(0,0,0,.2) 4px)',
        }} />

        {/* ── Eyes ─────────────────────────────────────────── */}
        <div className="absolute" style={{ top: '34%', left: '22%', width: '14%', height: '10%' }}>
          <div className="w-full h-full rounded-sm bg-amber-400"
            style={{
              animation: 'eyePulse 2.5s ease-in-out infinite',
              boxShadow: '0 0 14px 5px rgba(255,149,0,.9), 0 0 30px 8px rgba(255,149,0,.4)',
            }} />
        </div>
        <div className="absolute" style={{ top: '34%', right: '22%', width: '14%', height: '10%' }}>
          <div className="w-full h-full rounded-sm bg-amber-400"
            style={{
              animation: 'eyePulse 2.5s ease-in-out .8s infinite',
              boxShadow: '0 0 14px 5px rgba(255,149,0,.9), 0 0 30px 8px rgba(255,149,0,.4)',
            }} />
        </div>

        {/* ── Nose bridge ──────────────────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '47%', width: '2px', height: '10%', background: 'rgba(255,149,0,.3)' }} />

        {/* ── Mouth / Audio bars ───────────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-[3px] items-end"
          style={{ bottom: '22%', height: 24 }}
        >
          {bars.map((h, i) => {
            const animName = `bar${(i % 3) + 1}`;
            const duration = streaming ? `${0.25 + i * 0.04}s` : 'none';
            return (
              <div key={i} className="rounded-full bg-amber-400"
                style={{
                  width: 3,
                  height: h,
                  transformOrigin: 'bottom',
                  animation: streaming ? `${animName} ${duration} ease-in-out infinite` : 'none',
                  opacity: streaming ? 1 : 0.4,
                  boxShadow: streaming ? '0 0 6px rgba(255,149,0,.8)' : 'none',
                  transition: 'opacity .3s',
                }}
              />
            );
          })}
        </div>

        {/* ── Circuit traces ───────────────────────────────── */}
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
          <path d="M10 50 L25 50 L30 40 L40 40" stroke="#ff9500" strokeWidth=".6" fill="none" />
          <path d="M90 50 L75 50 L70 60 L60 60" stroke="#ff9500" strokeWidth=".6" fill="none" />
          <circle cx="40" cy="40" r="1.5" fill="#ff9500" />
          <circle cx="60" cy="60" r="1.5" fill="#ff9500" />
          <path d="M50 85 L50 75 L55 70" stroke="#ff9500" strokeWidth=".6" fill="none" />
        </svg>
      </div>

      {/* ── Floating bubbles ─────────────────────────────────── */}
      {bubbles.map(b => (
        <div key={b.id} className="absolute rounded-full bg-amber-400/70 pointer-events-none"
          style={{
            width: b.w, height: b.w,
            left: `${b.x}%`,
            bottom: '12%',
            opacity: 0,
            animation: `floatUp ${b.duration}s ease-out ${b.delay}s infinite`,
            boxShadow: '0 0 4px rgba(255,149,0,.6)',
          }}
        />
      ))}

      {/* ── Status badge ─────────────────────────────────────── */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-black/90"
        style={{ boxShadow: '0 0 12px rgba(255,149,0,.2)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full"
          style={{
            background: streaming ? '#ff9500' : '#00ff41',
            boxShadow: streaming ? '0 0 6px #ff9500' : '0 0 6px #00ff41',
            animation: 'eyePulse 1s ease-in-out infinite',
          }}
        />
        <span className="text-[8px] font-mono tracking-widest uppercase"
          style={{ color: streaming ? '#ff9500' : '#00ff41' }}
        >
          {streaming ? 'Processing...' : 'Neural link active'}
        </span>
      </div>
    </div>
  );
}
