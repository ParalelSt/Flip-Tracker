'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { setSignedIn } from '@/lib/api';
import { hasLocalData } from '@/lib/localStore';
import { migrateLocalToServer } from '@/lib/migrate';

interface AuthValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string) => Promise<{ error: { message: string } | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

interface Props {
  children: ReactNode;
  initialSession: Session | null;
}

export function AuthProvider({ children, initialSession }: Props) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(initialSession === null);
  const qc = useQueryClient();
  // Keep the api-layer guest/signed-in flag in sync with the React session.
  // This avoids the alternative of plumbing useAuth() into every hook.
  setSignedIn(!!initialSession);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSignedIn(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      setSignedIn(!!s);

      // On first sign-in: push any guest-mode localStorage data up to the
      // user's account, then refetch every list so the UI shows the merged set.
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && s && hasLocalData()) {
        try {
          const { migrated, failed } = await migrateLocalToServer();
          if (migrated > 0) {
            toast.success(
              failed > 0
                ? `Saved ${migrated} item${migrated === 1 ? '' : 's'} to your account (${failed} failed)`
                : `Saved ${migrated} item${migrated === 1 ? '' : 's'} to your account`,
            );
          }
          await qc.invalidateQueries();
        } catch {
          toast.error('Failed to migrate guest data — try signing out and back in.');
        }
      } else {
        // Sign-out or fresh sign-in with no local data — just refresh queries.
        await qc.invalidateQueries();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, qc]);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? { message: error.message } : null };
      },
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return {
          error: error ? { message: error.message } : null,
          needsConfirmation: !error && !!data?.user && !data?.session,
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
