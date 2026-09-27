import { useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL_DOMAIN } from '@/lib/config';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let revision = 0;
    let authEventReceived = false;
    const updateSession = (newSession: Session | null) => {
      if (!active) return;
      revision += 1;
      setSession(newSession);
      setAdminUserId(null);
      setLoading(!!newSession);
      if (!newSession) return;
      const current = revision;
      // Do not await another Supabase call inside onAuthStateChange.
      void Promise.resolve().then(async () => {
        try {
          const { data, error } = await supabase.rpc('is_catalog_admin');
          if (active && current === revision) {
            setAdminUserId(!error && data === true ? newSession.user.id : null);
          }
        } catch {
          // Fail closed without deleting or invalidating the user's session.
        } finally {
          if (active && current === revision) setLoading(false);
        }
      });
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      authEventReceived = true;
      updateSession(newSession);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!authEventReceived) updateSession(data.session);
    }).catch(() => {
      if (!authEventReceived) updateSession(null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const email = `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, loading, isAuthenticated: !!session, isAdmin: !!session && adminUserId === session.user.id, signIn, signOut };
}
