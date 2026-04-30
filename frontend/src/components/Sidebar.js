'use client';
import { useState } from 'react';
import { MessageSquarePlus, Trash2, ChevronLeft, ChevronRight, Shield, Search } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ conversations, activeConversation, onSelect, onNew, onDelete, onInvestigate }) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirmDelete === id) { await onDelete(id); setConfirmDelete(null); }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000); }
  };

  return (
    <aside className={clsx('flex flex-col h-full relative transition-all duration-300', collapsed ? 'w-14' : 'w-60')}
      style={{ borderRight: '1px solid rgba(0,255,65,.1)', background: 'rgba(0,4,0,.97)' }}
    >
      {/* Right border glow */}
      <div className="absolute top-0 right-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(0,255,65,.2), transparent)' }} />

      {/* Toggle */}
      <button onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-sm flex items-center justify-center transition-colors"
        style={{ background: '#000', border: '1px solid rgba(0,255,65,.2)', color: 'rgba(0,255,65,.5)' }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* ── Brand ───────────────────────────────────────────── */}
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid rgba(0,255,65,.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,149,0,.08)', border: '1px solid rgba(255,149,0,.3)', boxShadow: '0 0 10px rgba(255,149,0,.2)' }}>
            <Shield size={14} style={{ color: '#ff9500' }} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-black text-xs font-mono text-gradient tracking-widest">MIA</p>
              <p className="sys-label">Neural Intelligence · by Ronzoro</p>
            </div>
          )}
        </div>

        {/* Status bar */}
        {!collapsed && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-matrix"
              style={{ animation: 'eyePulse 2s ease-in-out infinite', boxShadow: '0 0 4px #00ff41' }} />
            <span className="sys-label">System operational</span>
            <div className="ml-auto sys-label opacity-50">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </div>

      {/* ── Investigate ─────────────────────────────────────── */}
      <div className="px-2.5 pt-2.5 shrink-0">
        <button onClick={onInvestigate}
          className={clsx('w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-mono transition-all mb-2', collapsed && 'justify-center px-0')}
          style={{ background: 'rgba(255,149,0,.06)', border: '1px solid rgba(255,149,0,.3)', color: '#ff9500' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,149,0,.12)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,149,0,.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,149,0,.06)'; e.currentTarget.style.boxShadow = 'none'; }}
          title="Wallet Investigation"
        >
          <Search size={13} />
          {!collapsed && 'INVESTIGATE WALLET'}
        </button>
      </div>

      {/* ── New session ─────────────────────────────────────── */}
      <div className="px-2.5 pb-2.5 shrink-0">
        <button onClick={onNew}
          className={clsx('w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-mono transition-all', collapsed && 'justify-center px-0')}
          style={{ background: 'rgba(0,255,65,.05)', border: '1px solid rgba(0,255,65,.2)', color: '#00ff41' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,65,.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,.05)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <MessageSquarePlus size={13} />
          {!collapsed && '+ NEW SESSION'}
        </button>
      </div>

      {/* ── Session log ─────────────────────────────────────── */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="sys-label px-1 py-2">Session log</div>

          {conversations.length === 0 && (
            <p className="sys-label px-1 py-1 opacity-40">No sessions recorded.</p>
          )}

          {conversations.map(conv => (
            <button key={conv.id} onClick={() => onSelect(conv)}
              className="w-full flex items-center justify-between gap-2 px-2 py-2 text-left text-xs font-mono group mb-0.5 rounded-sm transition-all relative"
              style={activeConversation?.id === conv.id ? {
                background: 'rgba(0,255,65,.06)', border: '1px solid rgba(0,255,65,.2)', color: '#00ff41',
              } : {
                border: '1px solid transparent', color: 'rgba(200,230,200,.4)',
              }}
              onMouseEnter={e => { if (activeConversation?.id !== conv.id) e.currentTarget.style.background = 'rgba(0,255,65,.03)'; }}
              onMouseLeave={e => { if (activeConversation?.id !== conv.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {activeConversation?.id === conv.id && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-matrix" style={{ boxShadow: '0 0 6px #00ff41' }} />
              )}
              <span className="truncate flex-1 pl-1">{conv.title || 'Untitled session'}</span>
              <button onClick={e => handleDelete(e, conv.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                style={{ color: confirmDelete === conv.id ? '#ff2d2d' : 'rgba(200,230,200,.3)' }}
                title={confirmDelete === conv.id ? 'Click again to confirm' : 'Terminate session'}
              >
                <Trash2 size={11} />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(0,255,65,.08)' }}>
        {!collapsed ? (
          <div className="sys-label opacity-30 text-center leading-relaxed">
            MIA v2.0 · All sessions encrypted<br />
            SafeNestT Intelligence Network
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-matrix" style={{ boxShadow: '0 0 4px #00ff41', animation: 'eyePulse 2s ease-in-out infinite' }} />
          </div>
        )}
      </div>
    </aside>
  );
}
