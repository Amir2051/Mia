'use client';
import { useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, StopCircle } from 'lucide-react';
import clsx from 'clsx';

export default function ChatInput({ onSend, onStop, disabled, streaming }) {
  const [value,      setValue]      = useState('');
  const [listening,  setListening]  = useState(false);
  const textareaRef  = useRef(null);
  const recognitionRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
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
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice not supported in this browser. Use Chrome or Edge.');
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
    <div className="shrink-0 px-4 pb-5 pt-3 border-t border-border bg-bg/80 backdrop-blur-xl">
      {listening && (
        <div className="flex items-center gap-2 text-red-400 text-xs mb-2 px-1">
          <div className="flex gap-1">
            {[6,12,18,12,6].map((h,i) => (
              <div key={i} className="w-0.5 rounded bg-red-400"
                style={{ height: `${h}px`, animation: `typing .5s ease-in-out ${i*.1}s infinite` }} />
            ))}
          </div>
          Listening... speak now
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder="Ask Mia anything..."
          rows={1}
          disabled={streaming}
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none outline-none focus:border-cyan-500/40 transition-colors min-h-[48px] max-h-40 disabled:opacity-50"
        />

        {/* Voice */}
        <button
          onClick={toggleVoice}
          title="Voice input"
          className={clsx(
            'w-11 h-11 rounded-xl border flex items-center justify-center transition-all shrink-0',
            listening
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-card border-border text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30'
          )}
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send / Stop */}
        {streaming ? (
          <button
            onClick={onStop}
            className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all shrink-0"
            title="Stop generating"
          >
            <StopCircle size={16} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all shrink-0 glow-cyan"
            title="Send"
          >
            <Send size={16} />
          </button>
        )}
      </div>
      <p className="text-[10px] text-gray-700 text-center mt-2">
        Enter to send · Shift+Enter for new line · 🎙 voice input · Built by Ronzoro
      </p>
    </div>
  );
}
