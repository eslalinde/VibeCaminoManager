'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

function ConfirmHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;

    if (!token_hash || !type) {
      router.replace('/login?error=email_confirmation_failed');
      return;
    }

    const supabase = createClient();
    supabase.auth.verifyOtp({ type, token_hash }).then(({ error }) => {
      if (error) {
        router.replace('/login?error=email_confirmation_failed');
      } else {
        router.replace('/');
      }
    });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Confirmando email...</p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        </div>
      }
    >
      <ConfirmHandler />
    </Suspense>
  );
}
