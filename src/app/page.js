'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg shadow-lg bg-white border border-gray-100">
        <div className="w-24 h-24 mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full text-blue-600">
            <path d="M100,20 C55.8,20 20,55.8 20,100 C20,144.2 55.8,180 100,180 C144.2,180 180,144.2 180,100 C180,55.8 144.2,20 100,20 Z M100,160 C66.9,160 40,133.1 40,100 C40,66.9 66.9,40 100,40 C133.1,40 160,66.9 160,100 C160,133.1 133.1,160 100,160 Z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('capgeminiManagement')}</h1>
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
        </div>
        <p className="text-gray-600">{t('loadingDashboard')}</p>
      </div>
    </div>
  );
}
