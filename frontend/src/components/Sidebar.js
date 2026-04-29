'use client';
import { useState } from 'react';
import { MessageSquarePlus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ conversations, activeConversation, onSelect, onNew, onDelete }) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirmDelete === id) { await onDelete(id); setConfirmDelete(null); }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000); }
  };

  return (
    <aside className={clsx(
      'flex flex-col h-full border-r border-border bg-card/60 backdrop-blur-xl transition-all duration-300 relative',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Brand */}
      <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-base shrink-0">
          🤖
        </div>
        {!collapsed && (
          <div>
            <p className="font-black text-sm text-gradient">Mia</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">by Ronzoro</p>
          </div>
        )}
      </div>

      {/* New chat */}
      <div className="p-3 shrink-0">
        <button
          onClick={onNew}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-sm font-semibold',
            collapsed && 'justify-center px-0'
          )}
        >
          <MessageSquarePlus size={16} />
          {!collapsed && 'New chat'}
        </button>
      </div>

      {/* Conversations */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest px-2 py-2">Conversations</p>
          {conversations.length === 0 && (
            <p className="text-xs text-gray-600 px-2 py-1">No conversations yet.</p>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={clsx(
                'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all group mb-0.5',
                activeConversation?.id === conv.id
                  ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              <span className="truncate flex-1">{conv.title || 'Untitled'}</span>
              <button
                onClick={e => handleDelete(e, conv.id)}
                className={clsx(
                  'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded',
                  confirmDelete === conv.id ? 'text-red-400 opacity-100' : 'text-gray-600 hover:text-red-400'
                )}
                title={confirmDelete === conv.id ? 'Click again to confirm' : 'Delete'}
              >
                <Trash2 size={12} />
              </button>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
