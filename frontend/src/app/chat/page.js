'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ChatLayout from '@/components/ChatLayout';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="grid-bg min-h-screen flex items-center justify-center">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
            style={{ animation: `typing .8s ease-in-out ${i * .15}s infinite` }} />
        ))}
      </div>
    </div>
  );

  return <ChatLayout user={user} />;
}
