'use client';
import { useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, StopCircle } from 'lucide-react';
import clsx from 'clsx';

export default function ChatInput({ onSend, onStop, disabled, streaming }) {
  const [value,     setValue]     = useState('');
  const [listening, setListening] = useState(false);
  const textareaRef    = useRef(null);
  const recognitionRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, disabled, onSend]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice not supported. Use Chrome or Edge.');
    const r = new SR();
    r.lang = 'en-US'; r.continuous = false; r.interimResults = true;
    r.onstart  = () => setListening(true);
    r.onresult = e => setValue(Array.from(e.results).map(r => r[0].transcript).join(''));
    r.onend    = () => { setListening(false); if (value.trim()) handleSend(); };
    r.onerror  = () => setListening(false);
    r.start();
    recognitionRef.current = r;
  };

  return (
    <div className="shrink-0 px-4 pb-5 pt-3 relative"
      style={{ borderTop: '1px solid rgba(0,255,65,.1)', background: 'rgba(0,0,0,.95)' }}
    >
      {/* Top border glow */}
      <div className="absolute top-0 left-8 right-8 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,65,.3), transparent)' }} />

      {/* Listening indicator */}
      {listening && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex gap-0.5 items-end h-4">
            {[4,8,12,16,12,8,4].map((h, i) => (
              <div key={i} className="w-0.5 rounded-full bg-danger"
                style={{
                  height: h,
                  animation: `bar${(i % 3) + 1} .3s ease-in-out ${i * .05}s infinite`,
                  boxShadow: '0 0 4px #ff2d2d',
                }} />
            ))}
          </div>
          <span className="sys-label text-danger">Voice capture active — speak now</span>
          <div className="w-1.5 h-1.5 rounded-full bg-danger"
            style={{ animation: 'eyePulse .5s ease-in-out infinite', boxShadow: '0 0 6px #ff2d2d' }} />
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Prompt prefix */}
        <span className="text-matrix font-mono text-sm pb-3 shrink-0"
          style={{ textShadow: '0 0 8px #00ff41' }}>
          &gt;_
        </span>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder="Enter command..."
          rows={1}
          disabled={streaming}
          className="flex-1 text-sm resize-none outline-none min-h-[44px] max-h-40 disabled:opacity-40 font-mono py-2.5 px-3"
          style={{
            background: 'rgba(0,255,65,.03)',
            border: '1px solid rgba(0,255,65,.15)',
            borderRadius: 4,
            color: '#c8e6c8',
            caretColor: '#00ff41',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(0,255,65,.4)'; e.target.style.boxShadow = '0 0 12px rgba(0,255,65,.1)'; }}
          onBlur={e  => { e.target.style.borderColor = 'rgba(0,255,65,.15)'; e.target.style.boxShadow = 'none'; }}
        />

        {/* Voice */}
        <button onClick={toggleVoice} title="Voice input"
          className="w-10 h-10 flex items-center justify-center shrink-0 rounded transition-all"
          style={listening ? {
            background: 'rgba(255,45,45,.1)', border: '1px solid rgba(255,45,45,.4)', color: '#ff2d2d',
            boxShadow: '0 0 12px rgba(255,45,45,.3)',
          } : {
            background: 'rgba(0,255,65,.04)', border: '1px solid rgba(0,255,65,.15)', color: 'rgba(0,255,65,.5)',
          }}
        >
          {listening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Send / Stop */}
        {streaming ? (
          <button onClick={onStop} title="Abort transmission"
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded transition-all"
            style={{ background: 'rgba(255,45,45,.1)', border: '1px solid rgba(255,45,45,.4)', color: '#ff2d2d', boxShadow: '0 0 14px rgba(255,45,45,.2)' }}
          >
            <StopCircle size={15} />
          </button>
        ) : (
          <button onClick={handleSend} disabled={!value.trim() || disabled} title="Transmit"
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded transition-all disabled:opacity-25"
            style={{ background: 'rgba(0,255,65,.08)', border: '1px solid rgba(0,255,65,.35)', color: '#00ff41', boxShadow: '0 0 14px rgba(0,255,65,.15)' }}
          >
            <Send size={15} />
          </button>
        )}
      </div>

      <p className="sys-label text-center mt-2 opacity-30">
        Enter · transmit &nbsp;|&nbsp; Shift+Enter · new line &nbsp;|&nbsp; 🎙 · voice &nbsp;|&nbsp; Mia — Built by Ronzoro
      </p>
    </div>
  );
}
