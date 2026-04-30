'use client';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import MiaFace from './MiaFace';

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-end py-1">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="rounded-full bg-amber-400"
          style={{
            width: 3,
            height: [6,12,18,12,6][i],
            animation: `bar${(i % 3) + 1} .5s ease-in-out ${i * .08}s infinite`,
            boxShadow: '0 0 4px rgba(255,149,0,.7)',
          }}
        />
      ))}
    </div>
  );
}

function SystemLine({ text }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,255,65,.15), transparent)' }} />
      <span className="sys-label">{text}</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(0,255,65,.15), transparent)' }} />
    </div>
  );
}

function Message({ msg, isLast, streaming }) {
  const isUser = msg.role === 'user';
  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded border border-amber-400/30 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5"
          style={{ background: 'rgba(255,149,0,.06)', color: '#ff9500', boxShadow: '0 0 10px rgba(255,149,0,.15)' }}>
          USR
        </div>
      ) : (
        <div className="w-8 h-8 rounded border border-matrix/30 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5"
          style={{ background: 'rgba(0,255,65,.05)', color: '#00ff41', boxShadow: '0 0 10px rgba(0,255,65,.15)' }}>
          MIA
        </div>
      )}

      {/* Bubble */}
      <div className={clsx('max-w-[75%] rounded px-4 py-3 text-sm relative', isUser ? 'rounded-tr-none' : 'rounded-tl-none')}
        style={isUser ? {
          background: 'rgba(255,149,0,.05)',
          border: '1px solid rgba(255,149,0,.2)',
          color: '#e0c090',
        } : {
          background: 'rgba(0,255,65,.03)',
          border: '1px solid rgba(0,255,65,.12)',
          color: '#c8e6c8',
        }}
      >
        {/* Corner accent */}
        {!isUser && (
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix/50" />
        )}
        {isUser && (
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-400/50" />
        )}

        {msg.streaming && !msg.content ? (
          <TypingDots />
        ) : isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed font-mono text-xs">{msg.content}</p>
        ) : (
          <div className="mia-prose text-xs leading-relaxed">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}

        {/* Streaming cursor */}
        {msg.streaming && msg.content && (
          <span className="inline-block w-0.5 h-3 bg-matrix ml-0.5 align-middle"
            style={{ animation: 'eyePulse .6s ease-in-out infinite', boxShadow: '0 0 6px #00ff41' }} />
        )}

        {/* Timestamp */}
        {!msg.streaming && (
          <div className="mt-1.5 sys-label opacity-40">
            {new Date(msg.created_at || Date.now()).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, streaming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center grid-bg relative overflow-hidden">
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-matrix/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-matrix/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-matrix/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-matrix/30" />

      {/* Top system status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-matrix" style={{ boxShadow: '0 0 6px #00ff41', animation: 'eyePulse 1.5s ease-in-out infinite' }} />
        <span className="sys-label">System online — Neural link established</span>
        <div className="w-1.5 h-1.5 rounded-full bg-matrix" style={{ boxShadow: '0 0 6px #00ff41', animation: 'eyePulse 1.5s ease-in-out .5s infinite' }} />
      </div>

      {/* Animated AI face */}
      <div className="mb-8 glitch">
        <MiaFace size={220} streaming={false} />
      </div>

      {/* Title */}
      <div className="mb-1">
        <div className="sys-label mb-2">Mia · Advanced Intelligence System · v2.0</div>
        <h2 className="text-3xl font-black font-mono text-gradient mb-1 tracking-tight">
          NEURAL LINK ACTIVE
        </h2>
        <p className="text-xs font-mono" style={{ color: 'rgba(0,255,65,.5)' }}>
          ████ CLASSIFIED SYSTEM — AUTHORIZED ACCESS ONLY ████
        </p>
      </div>

      <p className="text-xs font-mono mt-3 mb-8 max-w-sm leading-relaxed" style={{ color: 'rgba(200,230,200,.5)' }}>
        Cybersecurity · Geopolitics · Behavioral Analysis · Fraud Intelligence · World Events
      </p>

      {/* Query cards */}
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {[
          { code: '01', label: 'THREAT INTEL',    sub: 'Cyber threats & defenses',   color: '#ff2d2d' },
          { code: '02', label: 'GEO-POLITICAL',   sub: 'World events & intelligence', color: '#ff9500' },
          { code: '03', label: 'PSYCH ANALYSIS',  sub: 'Behavior & fraud patterns',   color: '#00ff41' },
          { code: '04', label: 'STRATEGY OPS',    sub: 'Growth & mission planning',   color: '#00e5ff' },
        ].map(s => (
          <button key={s.code}
            className="p-4 text-left group relative overflow-hidden"
            style={{ background: 'rgba(0,255,65,.02)', border: `1px solid ${s.color}20`, borderRadius: 4 }}
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: s.color, opacity: .5 }} />
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: s.color }} />
            <p className="text-[10px] font-mono mb-1" style={{ color: s.color, opacity: .7 }}>[ {s.code} ]</p>
            <p className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(200,230,200,.4)' }}>{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-4 left-4 right-4 sys-label text-center opacity-30">
        WARNING: This AI system processes sensitive intelligence. All sessions are monitored. Built by RONZORO.
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 relative"
      style={{ background: 'linear-gradient(180deg, #000 0%, #020502 100%)' }}
    >
      {/* Top bar */}
      <SystemLine text="— Session active · End-to-end encrypted —" />

      {messages.map((msg, i) => (
        <Message key={msg.id || i} msg={msg} isLast={i === messages.length - 1} streaming={streaming} />
      ))}

      {/* Bottom spacer label */}
      {!streaming && messages.length > 0 && (
        <SystemLine text={`— ${messages.length} transmissions logged —`} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
