import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithProvider: (provider: 'google') => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readableError(message: string) {
  return message
    .replace('Invalid login credentials', 'Email or password is incorrect.')
    .replace('Email not confirmed', 'Please verify your email before signing in. Use the resend confirmation option below.')
    .replace('User already registered', 'An account with this email already exists.')
    .replace('Password should be at least 6 characters', 'Password must be at least 6 characters.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/?auth_callback=email-confirmation`,
      },
    });
    if (!error && data.user?.identities?.length === 0) {
      return { error: 'An account with this email may already exist. Try signing in or use Forgot password.' };
    }
    if (!error && data.session) {
      await supabase.auth.signOut();
      return { error: 'Email confirmation is disabled. Enable email confirmations in Supabase Authentication settings before creating accounts.' };
    }
    return { error: error ? readableError(error.message) : null };
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/?auth_callback=email-confirmation`,
      },
    });
    return { error: error ? readableError(error.message) : null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? readableError(error.message) : null };
  }, []);

  const signInWithProvider = useCallback(async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error ? readableError(error.message) : null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });
    return { error: error ? readableError(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? readableError(error.message) : null };
  }, []);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    let remoteError: unknown = null;

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      remoteError = error;
    } catch (error) {
      remoteError = error;
    }

    if (remoteError) {
      // Supabase's default browser storage key is namespaced by project ref.
      // This client does not configure a custom storage key or storage adapter.
      const projectRef = new URL(
        import.meta.env.VITE_SUPABASE_URL as string
      ).hostname.split('.')[0];
      const storageKey = `sb-${projectRef}-auth-token`;

      try {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(`${storageKey}-code-verifier`);
        window.localStorage.removeItem(`${storageKey}-user`);
      } catch (storageError) {
        console.error('ABOS sign-out: local session cleanup failed', storageError);
        return {
          error: 'ABOS could not clear this browser session. Allow site storage and try again.',
        };
      }

      // With the persisted session gone, let Supabase perform its normal
      // local cleanup and notify SIGNED_OUT subscribers without another
      // authenticated /logout request.
      try {
        const { error: cleanupError } = await supabase.auth.signOut({ scope: 'local' });
        if (cleanupError) {
          console.warn('ABOS sign-out: SDK cleanup warning', cleanupError);
        }
      } catch (cleanupError) {
        console.warn('ABOS sign-out: SDK cleanup warning', cleanupError);
      }

      const authError = remoteError as {
        name?: string;
        code?: string;
        message?: string;
      };

      const missingSession =
        authError.name === 'AuthSessionMissingError' ||
        authError.code === 'session_not_found' ||
        /session (missing|not found)/i.test(authError.message ?? '');

      if (!missingSession) {
        console.warn(
          'ABOS sign-out: remote revocation was not confirmed; local credentials were cleared.',
          remoteError
        );
      }
    }

    try {
      window.localStorage.removeItem('abos_active_business_id');
    } catch (storageError) {
      // This preference is non-sensitive; authentication cleanup takes priority.
      console.warn('ABOS sign-out: could not clear active business preference', storageError);
    }

    setSession(null);
    setUser(null);

    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signUp,
      resendConfirmation,
      signIn,
      signInWithProvider,
      resetPassword,
      updatePassword,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
