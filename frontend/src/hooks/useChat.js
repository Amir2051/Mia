'use client';
import { useState, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export function useChat(getToken) {
  const [conversations,     setConversations]     = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages,           setMessages]           = useState([]);
  const [loading,            setLoading]            = useState(false);
  const [streaming,          setStreaming]           = useState(false);
  const abortRef = useRef(null);

  const authHeaders = useCallback(() => ({
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${getToken()}`
  }), [getToken]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    const res  = await fetch(`${API}/api/chat/conversations`, { headers: authHeaders() });
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  // Select / load a conversation
  const selectConversation = useCallback(async (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    const res  = await fetch(`${API}/api/chat/conversations/${conv.id}/messages`, { headers: authHeaders() });
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  // New conversation
  const newConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (id) => {
    await fetch(`${API}/api/chat/conversations/${id}`, { method: 'DELETE', headers: authHeaders() });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation?.id === id) newConversation();
  }, [authHeaders, activeConversation, newConversation]);

  // Send message (streaming)
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || streaming) return;

    const userMsg = { role: 'user', content, id: Date.now(), created_at: new Date().toISOString() };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    // Placeholder for streaming reply
    const placeholderId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: placeholderId, streaming: true }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(`${API}/api/chat/stream`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ content, history, conversation_id: activeConversation?.id }),
        signal:  abortRef.current.signal
      });

      if (!res.ok) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { delta } = JSON.parse(data);
            full += delta;
            setMessages(prev => prev.map(m =>
              m.id === placeholderId ? { ...m, content: full } : m
            ));
          } catch {}
        }
      }

      // Finalize message
      setMessages(prev => prev.map(m =>
        m.id === placeholderId ? { ...m, content: full, streaming: false } : m
      ));

      // Refresh conversations to pick up new/updated conv
      await loadConversations();

    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== placeholderId));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === placeholderId
            ? { ...m, content: '❌ Something went wrong. Please try again.', streaming: false }
            : m
        ));
      }
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, activeConversation, authHeaders, loadConversations]);

  const stopStreaming = () => abortRef.current?.abort();

  return {
    conversations, activeConversation, messages,
    loading, streaming,
    loadConversations, selectConversation, newConversation,
    deleteConversation, sendMessage, stopStreaming
  };
}
