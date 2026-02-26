'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
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
  const routerRef = useRef(router);
  routerRef.current = router;
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function fetchProfile(userId: string) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        if (active) setProfile(data);
      } catch {
        // profile fetch is non-critical
      }
    }

    // Use onAuthStateChange as the single source of truth.
    // It fires INITIAL_SESSION when the client finishes restoring
    // the session from storage, avoiding getSession() lock issues.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          routerRef.current.replace('/login');
        }
      }
    );

    // Safety net: if onAuthStateChange never fires, force loading off
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 3000);

    return () => {
      active = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
