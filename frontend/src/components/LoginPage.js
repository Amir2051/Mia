'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router  = useRouter();
  const btnRef  = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;
    window.google.accounts.id.initialize({
      client_id:  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback:   handleCredential,
      auto_select: false,
    });
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black', size: 'large', shape: 'pill',
      text: 'signin_with', width: 280
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCredential({ credential }) {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      router.push('/chat');
    } catch {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Google GSI script */}
      <script src="https://accounts.google.com/gsi/client" async defer />

      <div className="grid-bg min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Orbs */}
        <div className="fixed w-80 h-80 -top-20 -left-20 rounded-full bg-purple-600 opacity-20 blur-[100px] pointer-events-none" />
        <div className="fixed w-64 h-64 bottom-10 -right-10 rounded-full bg-cyan-400 opacity-15 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-4xl mb-6 glow-cyan animate-pulse-glow">
            🤖
          </div>

          <h1 className="text-4xl font-black text-gradient mb-2">Mia</h1>
          <p className="text-purple-300 text-sm font-semibold tracking-widest uppercase mb-2">by Ronzoro</p>
          <p className="text-gray-400 text-center text-sm leading-relaxed mb-10 max-w-xs">
            Your advanced AI assistant — cybersecurity intelligence, world analysis, behavioral insights, and more.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {['🛡 Cybersecurity','🌍 Geopolitics','🧠 Psychology','🔍 Debunking','🚀 Strategy'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold border border-cyan-500/20 bg-cyan-500/5 text-cyan-300">
                {f}
              </span>
            ))}
          </div>

          {/* Google Sign In */}
          <div className="flex flex-col items-center gap-4 w-full">
            {loading ? (
              <div className="flex gap-2 py-4">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
                    style={{ animation: `typing .8s ease-in-out ${i * .15}s infinite` }} />
                ))}
              </div>
            ) : (
              <div ref={btnRef} className="overflow-hidden rounded-full" />
            )}
            <p className="text-xs text-gray-600 text-center max-w-xs">
              By signing in you agree to our Terms of Service and Privacy Policy. Your data is encrypted and never shared.
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <p className="absolute bottom-6 text-xs text-gray-700">
          © 2026 Mia · Built by <span className="text-cyan-700">Ronzoro</span>
        </p>
      </div>
    </>
  );
}
