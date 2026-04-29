'use client';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import Image from 'next/image';

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0,1,2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
          style={{ animation: `typing .8s ease-in-out ${i * .15}s infinite` }} />
      ))}
    </div>
  );
}

function Message({ msg, isLast }) {
  const isUser = msg.role === 'user';
  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5',
        isUser
          ? 'bg-purple-600/25 border border-purple-500/30'
          : 'bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30'
      )}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={clsx(
        'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
        isUser
          ? 'bg-purple-600/20 border border-purple-500/25 rounded-tr-sm text-purple-100'
          : 'bg-card border border-border rounded-tl-sm'
      )}>
        {msg.streaming && !msg.content ? (
          <TypingDots />
        ) : isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        ) : (
          <div className="mia-prose">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        {msg.streaming && msg.content && (
          <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, streaming, activeConversation }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages.length) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 flex items-center justify-center text-4xl mb-5 glow-cyan">
        🤖
      </div>
      <h2 className="text-2xl font-black text-gradient mb-2">Hello, I'm Mia</h2>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
        Your advanced AI — cybersecurity, geopolitics, psychology, debunking, and strategy. Ask me anything.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {[
          { icon: '🛡', title: 'Cyber Threat Briefing',    sub: 'Latest threats & defenses' },
          { icon: '🌍', title: 'Geopolitical Intelligence', sub: 'World events & impact' },
          { icon: '🧠', title: 'Behavior Analysis',        sub: 'Psychology of fraud & influence' },
          { icon: '🚀', title: 'Business Strategy',        sub: 'Growth & success coaching' },
        ].map(s => (
          <button
            key={s.title}
            className="p-4 rounded-xl bg-card border border-border hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-left group"
          >
            <span className="text-xl block mb-2">{s.icon}</span>
            <p className="text-sm font-semibold text-gray-200 group-hover:text-cyan-300 transition-colors">{s.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5">
      {messages.map((msg, i) => (
        <Message key={msg.id || i} msg={msg} isLast={i === messages.length - 1} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
