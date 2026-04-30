'use client';
import { useCallback } from 'react';

const SESSION_KEY = 'mia_session_id';

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useAuth() {
  const getToken = useCallback(() => getOrCreateSessionId(), []);
  return { getToken };
}
