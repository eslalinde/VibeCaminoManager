'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { publicRoutes } from '@/lib/routes';

interface Profile {
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', currentUser.id)
            .single();
          if (!cancelled) setProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (!cancelled) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          router.replace('/login');
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  // Redirect to login if unauthenticated and on a protected route
  useEffect(() => {
    if (loading) return;
    const isPublic = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );
    if (!user && !isPublic) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
