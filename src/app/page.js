'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        // If there's an error, redirect to login
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}
